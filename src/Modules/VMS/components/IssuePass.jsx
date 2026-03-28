import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  Select,
  Button,
  Group,
  Image,
  Center,
  Title,
  Text,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { jsPDF } from "jspdf";
import { host } from "../../../routes/globalRoutes";

function IssuePass({ visitId, onRefresh }) {
  const [zone, setZone] = useState("public");
  const [qrCode, setQrCode] = useState(null);
  const [passData, setPassData] = useState(null);

  const handleIssue = async () => {
    if (!visitId) {
      notifications.show({
        title: "Error",
        message: "No visit selected",
        color: "red",
      });
      return;
    }
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        `${host}/vms/pass/`,
        {
          visit_id: visitId,
          authorized_zones: zone,
        },
        { headers: { Authorization: `Token ${token}` } },
      );

      setQrCode(res.data.qr_code);
      setPassData(res.data.pass_data);
      notifications.show({
        title: "Success",
        message: "Pass Issued successfully",
        color: "green",
      });

      if (onRefresh) onRefresh();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Issuance failed",
        color: "red",
      });
    }
  };

  const downloadPassPDF = () => {
    if (!passData) return;
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Visitor Pass Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Pass Number: ${passData.pass_number || "N/A"}`, 20, 40);
    doc.text(`Visitor Name: ${passData.visitor_name || "N/A"}`, 20, 50);
    doc.text(`Contact: ${passData.visitor_phone || "N/A"}`, 20, 60);
    doc.text(
      `Host: ${passData.host || "N/A"} (${passData.department || "N/A"})`,
      20,
      70,
    );
    doc.text(`Purpose: ${passData.purpose || "N/A"}`, 20, 80);
    doc.text(`Authorized Zones: ${passData.authorized_zones || "N/A"}`, 20, 90);
    doc.text(
      `Valid From: ${new Date(passData.valid_from).toLocaleString()}`,
      20,
      100,
    );
    doc.text(
      `Valid Until: ${new Date(passData.valid_until).toLocaleString()}`,
      20,
      110,
    );

    if (qrCode) {
      // qrCode is a base64 data URI (e.g. data:image/png;base64,...)
      doc.addImage(qrCode, "PNG", 20, 120, 50, 50);
      doc.text("Scan to view details", 20, 180);
    }

    doc.save(`Visitor_Pass_${passData.pass_number}.pdf`);
  };

  return (
    <Paper p="md">
      <Text mb="sm">
        Prior to pass issuance, ID must be verified (UC-004, BR-016).
      </Text>
      <Badge color="green" mb="md">
        ID Status: Verified
      </Badge>

      <Select
        label="Authorized Zones"
        placeholder="Select Zone"
        data={[
          { value: "public", label: "Public Areas Only" },
          { value: "academic", label: "Academic Blocks" },
          { value: "hostel", label: "Hostel Areas" },
          { value: "all", label: "All Access (VIP)" },
        ]}
        value={zone}
        onChange={setZone}
        mb="md"
      />

      <Group position="right">
        <Button color="cyan" onClick={handleIssue}>
          Generate & Print Pass
        </Button>
      </Group>

      {qrCode && (
        <Center mt="xl" style={{ flexDirection: "column" }}>
          <Title order={5} mb="sm">
            Visitor Pass QR Code
          </Title>
          <Image
            src={qrCode}
            width={200}
            height={200}
            fit="contain"
            radius="md"
          />
          <Text size="sm" mt="sm" mb="md">
            Scan this code to view visitor details securely.
          </Text>
          <Button color="green" variant="outline" onClick={downloadPassPDF}>
            Download Pass Receipt (PDF)
          </Button>
        </Center>
      )}
    </Paper>
  );
}

IssuePass.propTypes = {
  visitId: PropTypes.number.isRequired,
  onRefresh: PropTypes.func,
};

IssuePass.defaultProps = {
  onRefresh: null,
};

export default IssuePass;
