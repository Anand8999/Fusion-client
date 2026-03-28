import React, { useEffect, useState } from "react";
import { Container, Paper, Title, Text, Button, Center } from "@mantine/core";
import { useSearchParams } from "react-router-dom";
import { jsPDF } from "jspdf";

export default function VMSReceipt() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    try {
      const rawData = searchParams.get("data");
      if (rawData) {
        const decoded = atob(decodeURIComponent(rawData));
        setData(JSON.parse(decoded));
      }
    } catch (e) {
      console.error("Failed to decode receipt data", e);
    }
  }, [searchParams]);

  const downloadPDF = () => {
    if (!data) return;
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Visitor Pass Receipt", 20, 20);

    doc.setFontSize(12);
    doc.text(`Pass Number: ${data.pass_number}`, 20, 40);
    doc.text(`Visitor Name: ${data.visitor_name || "N/A"}`, 20, 50);
    doc.text(`Contact: ${data.visitor_phone || "N/A"}`, 20, 60);
    doc.text(
      `Host: ${data.host || "N/A"} (${data.department || "N/A"})`,
      20,
      70,
    );
    doc.text(`Purpose: ${data.purpose || "N/A"}`, 20, 80);
    doc.text(`Authorized Zones: ${data.authorized_zones || "N/A"}`, 20, 90);
    doc.text(
      `Valid From: ${new Date(data.valid_from).toLocaleString()}`,
      20,
      100,
    );
    doc.text(
      `Valid Until: ${new Date(data.valid_until).toLocaleString()}`,
      20,
      110,
    );
    doc.text("Please keep this document handy throughout your stay.", 20, 130);

    doc.save(`${data.visitor_name.replace(/\s+/g, "_")}_Visitor_Pass.pdf`);
  };

  if (!data) {
    return (
      <Container size="sm" mt="xl">
        <Text align="center" color="red">
          Invalid or Missing Receipt Data
        </Text>
      </Container>
    );
  }

  return (
    <Container size="sm" p="xl" style={{ marginTop: "50px" }}>
      <Paper shadow="sm" p="xl" withBorder>
        <Center>
          <Title order={2} mb="xl">
            Visitor Pass Status
          </Title>
        </Center>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginBottom: "30px",
          }}
        >
          <Text>
            <b>Pass Number:</b> {data.pass_number}
          </Text>
          <Text>
            <b>Visitor Name:</b> {data.visitor_name}
          </Text>
          <Text>
            <b>Contact:</b> {data.visitor_phone}
          </Text>
          <Text>
            <b>Host:</b> {data.host} ({data.department})
          </Text>
          <Text>
            <b>Purpose:</b> {data.purpose}
          </Text>
          <Text>
            <b>Permitted Zones:</b> {data.authorized_zones}
          </Text>
          <Text>
            <b>Valid From:</b> {new Date(data.valid_from).toLocaleString()}
          </Text>
          <Text>
            <b>Valid Until:</b> {new Date(data.valid_until).toLocaleString()}
          </Text>
        </div>

        <Center>
          <Button size="lg" color="green" onClick={downloadPDF}>
            Download PDF Receipt
          </Button>
        </Center>
      </Paper>
    </Container>
  );
}
