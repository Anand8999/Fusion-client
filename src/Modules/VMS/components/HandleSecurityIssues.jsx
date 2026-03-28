import React, { useState, useEffect } from "react";
import { Paper, Title, Table, Button, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

export default function HandleSecurityIssues() {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(`${host}/vms/incidents/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setIncidents(res.data);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch security issues",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const exportToExcel = () => {
    const headers = [
      "ID",
      "Severity",
      "Type",
      "Description",
      "Status",
      "Created At",
    ];
    const csvContent = [
      headers.join(","),
      ...incidents.map((inc) =>
        [
          inc.id,
          inc.severity,
          inc.issue_type,
          `"${(inc.description || "").replace(/"/g, '""')}"`,
          inc.status,
          new Date(inc.created_at).toLocaleString(),
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "security_issues.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Paper p="md">
      <Group justify="space-between" mb="md">
        <Title order={5}>Handle Security Incidents</Title>
        <Button color="green" onClick={exportToExcel}>
          Export to Excel (CSV)
        </Button>
      </Group>

      <Table.ScrollContainer minWidth={800}>
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Severity</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created At</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {incidents.map((inc) => (
              <Table.Tr key={inc.id}>
                <Table.Td>{inc.id}</Table.Td>
                <Table.Td>{inc.severity}</Table.Td>
                <Table.Td>{inc.issue_type}</Table.Td>
                <Table.Td>{inc.description}</Table.Td>
                <Table.Td>{inc.status}</Table.Td>
                <Table.Td>{new Date(inc.created_at).toLocaleString()}</Table.Td>
              </Table.Tr>
            ))}
            {incidents.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={6} style={{ textAlign: "center" }}>
                  No issues found
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
}
