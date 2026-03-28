import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Table,
  Badge,
  Card,
  ScrollArea,
  Select,
} from "@mantine/core";
import { fetchReportsApi, fetchRecentVisitsApi } from "./api";

export default function Reports() {
  const [reportData, setReportData] = useState(null);
  const [visitRecords, setVisitRecords] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchReportsApi(filter);
        setReportData(data);
      } catch (err) {
        console.error("Failed to load reports", err);
      }
    };
    const loadVisits = async () => {
      try {
        const data = await fetchRecentVisitsApi();
        // To do real time filtering of visits, the backend RecentVisitsView also needs to be updated.
        // Or we can filter it locally for now. Let's rely on backend if possible, or local if needed.
        setVisitRecords(data);
      } catch (err) {
        console.error("Failed to load visits for report", err);
      }
    };
    loadReports();
    loadVisits();
  }, [filter]);

  const handleFilterChange = (val) => {
    setFilter(val || "all");
  };

  const generatePDF = () => {
    // eslint-disable-next-line new-cap
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(
      `Visitor Management System - ${filter.charAt(0).toUpperCase() + filter.slice(1)} Report`,
      14,
      22,
    );

    if (reportData) {
      doc.setFontSize(12);
      doc.text(`Total Registered: ${reportData.total_visits}`, 14, 32);
      doc.text(`Currently Inside: ${reportData.currently_inside}`, 14, 40);
      doc.text(`Total Exited: ${reportData.exited_visitors}`, 100, 32);
      doc.text(`Entries Denied: ${reportData.denied_entries}`, 100, 40);
    }

    doc.setFontSize(14);
    doc.text("Detailed Visitor Log", 14, 55);

    const tableColumn = [
      "Name",
      "ID Number",
      "Phone",
      "Purpose",
      "Host",
      "Entry Time",
      "Exit Time",
      "Status",
    ];
    const tableRows = [];

    visitRecords.forEach((element) => {
      const entryTime = element.entry_at
        ? new Date(element.entry_at).toLocaleString()
        : element.registered_at
          ? new Date(element.registered_at).toLocaleString()
          : "N/A";
      const exitTime = element.exit_at
        ? new Date(element.exit_at).toLocaleString()
        : "N/A";
      const rowData = [
        element.visitor?.full_name || "Unknown",
        element.visitor?.id_number || "N/A",
        element.visitor?.contact_phone || "N/A",
        element.purpose || "",
        element.host_name || "",
        entryTime,
        exitTime,
        element.status || "",
      ];
      tableRows.push(rowData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 60,
    });

    doc.save(`VMS_${filter}_Report.pdf`);
  };

  const generateExcel = () => {
    if (!visitRecords || visitRecords.length === 0) return;

    const excelData = visitRecords.map((element) => ({
      Name: element.visitor?.full_name || "Unknown",
      "ID Number": element.visitor?.id_number || "N/A",
      Phone: element.visitor?.contact_phone || "N/A",
      Purpose: element.purpose || "",
      Host: element.host_name || "",
      "Entry Time": element.entry_at
        ? new Date(element.entry_at).toLocaleString()
        : element.registered_at
          ? new Date(element.registered_at).toLocaleString()
          : "N/A",
      "Exit Time": element.exit_at
        ? new Date(element.exit_at).toLocaleString()
        : "N/A",
      Status: element.status || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Visits");

    XLSX.writeFile(workbook, `VMS_${filter}_Report.xlsx`);
  };

  const rows =
    visitRecords &&
    visitRecords.map((element) => (
      <Table.Tr key={element.id}>
        <Table.Td>{element.visitor?.full_name || "Unknown"}</Table.Td>
        <Table.Td>{element.visitor?.id_number || "N/A"}</Table.Td>
        <Table.Td>{element.visitor?.contact_phone || "N/A"}</Table.Td>
        <Table.Td>{element.purpose}</Table.Td>
        <Table.Td>{element.host_name}</Table.Td>
        <Table.Td>
          {element.entry_at
            ? new Date(element.entry_at).toLocaleString()
            : element.registered_at
              ? new Date(element.registered_at).toLocaleString()
              : "N/A"}
        </Table.Td>
        <Table.Td>
          {element.exit_at ? new Date(element.exit_at).toLocaleString() : "N/A"}
        </Table.Td>
        <Table.Td>
          <Badge
            color={
              element.status === "inside"
                ? "blue"
                : element.status === "exited"
                  ? "gray"
                  : element.status === "denied"
                    ? "red"
                    : "yellow"
            }
          >
            {element.status}
          </Badge>
        </Table.Td>
      </Table.Tr>
    ));

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Group position="apart" mb="md">
        <Title order={3}>System Activity Report</Title>
        <Group>
          <Select
            placeholder="Time Range"
            value={filter}
            onChange={handleFilterChange}
            data={[
              { value: "all", label: "All Time" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
          />
          <Button variant="light" onClick={generatePDF}>
            Export PDF
          </Button>
          <Button variant="outline" color="green" onClick={generateExcel}>
            Export Excel
          </Button>
        </Group>
      </Group>

      <Text mb="md">Live overview of VMS operations.</Text>

      {reportData ? (
        <Group position="apart" grow mb="lg">
          <Card shadow="xs" p="sm" withBorder>
            <Title order={4}>Total Registered</Title>
            <Text size="xl" weight={700} color="blue">
              {reportData.total_visits}
            </Text>
          </Card>
          <Card shadow="xs" p="sm" withBorder>
            <Title order={4}>Currently Inside</Title>
            <Text size="xl" weight={700} color="green">
              {reportData.currently_inside}
            </Text>
          </Card>
          <Card shadow="xs" p="sm" withBorder>
            <Title order={4}>Total Exited</Title>
            <Text size="xl" weight={700} color="gray">
              {reportData.exited_visitors}
            </Text>
          </Card>
          <Card shadow="xs" p="sm" withBorder>
            <Title order={4}>Entries Denied</Title>
            <Text size="xl" weight={700} color="red">
              {reportData.denied_entries}
            </Text>
          </Card>
        </Group>
      ) : (
        <Text mb="lg">Loading report data...</Text>
      )}

      <Title order={4} mb="sm" mt="lg">
        Detailed Visitor Log
      </Title>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>ID Number</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Purpose</Table.Th>
              <Table.Th>Host</Table.Th>
              <Table.Th>Entry Time</Table.Th>
              <Table.Th>Exit Time</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8} style={{ textAlign: "center" }}>
                  No recent visitor records found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
