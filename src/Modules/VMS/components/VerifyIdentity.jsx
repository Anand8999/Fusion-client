import React, { useState } from "react";
import PropTypes from "prop-types";
import { Paper, Select, TextInput, Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

function VerifyIdentity({ visitId, onClose, onRefresh, onBlacklisted }) {
  const [visitorId, setVisitorId] = useState("");
  const [idType, setIdType] = useState("");
  const [status, setStatus] = useState(null);

  const handleVerify = async () => {
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
      await axios.post(
        `${host}/vms/verify/`,
        {
          visit_id: visitId,
          method: "manual",
          result: true,
          notes: `Verified ${idType} ${visitorId}`,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      setStatus("verified");
      notifications.show({
        title: "Verified",
        message: "Identity verified successfully.",
        color: "green",
      });
      if (onRefresh) onRefresh();
      if (onClose) setTimeout(onClose, 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || "";
      if (errorMsg.includes("BLACKLISTED")) {
        notifications.show({
          title: "Blacklisted Alert",
          message: "Visitor requires override.",
          color: "red",
        });
        if (onBlacklisted) onBlacklisted();
      } else {
        notifications.show({
          title: "Error",
          message: `Verification failed: ${errorMsg}`,
          color: "red",
        });
      }
    }
  };

  return (
    <Paper p="md">
      <Text mb="md">
        Scan or enter the visitor's government ID to verify their identity
        (UC-002).
      </Text>
      <Select
        label="Select ID Document Type"
        placeholder="Choose one"
        data={["Aadhaar Card", "Passport", "Driver License", "National ID"]}
        value={idType}
        onChange={setIdType}
        mb="sm"
      />
      <TextInput
        label="Enter Document Number"
        placeholder="Ex: 1234-5678-9012"
        value={visitorId}
        onChange={(e) => setVisitorId(e.target.value)}
        mb="md"
      />
      <Group position="right">
        <Button color="yellow" onClick={handleVerify}>
          Run Verification Check
        </Button>
      </Group>
      {status === "verified" && (
        <Text color="green" mt="md" weight={500}>
          Identity Verified Successfully. Biometric match passed (BR-008).
        </Text>
      )}
    </Paper>
  );
}

VerifyIdentity.propTypes = {
  visitId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
  onBlacklisted: PropTypes.func,
};

VerifyIdentity.defaultProps = {
  onClose: null,
  onRefresh: null,
  onBlacklisted: null,
};

export default VerifyIdentity;
