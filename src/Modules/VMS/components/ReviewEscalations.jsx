import React, { useState, useEffect } from "react";
import { Table, Button, Group, Paper } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchPendingOverridesApi, updateOverrideStatusApi } from "./api";

export default function ReviewEscalations() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    try {
      const data = await fetchPendingOverridesApi();
      setRequests(data);
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to fetch escalation requests",
        color: "red",
      });
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    try {
      await updateOverrideStatusApi(id, { status });
      notifications.show({
        title: "Success",
        message: `Request ${status} successfully`,
      });
      fetchRequests();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to update request",
        color: "red",
      });
    }
  };

  return (
    <Paper p="md">
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>ID Number</Table.Th>
            <Table.Th>Reason</Table.Th>
            <Table.Th>Requested By</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {requests.length > 0 ? (
            requests.map((r) => (
              <Table.Tr key={r.id}>
                <Table.Td>{r.visitor_name}</Table.Td>
                <Table.Td>{r.id_number}</Table.Td>
                <Table.Td>{r.reason}</Table.Td>
                <Table.Td>{r.requested_by_name || "N/A"}</Table.Td>
                <Table.Td>
                  <Group>
                    <Button
                      color="green"
                      size="xs"
                      onClick={() => handleAction(r.id, "approved")}
                    >
                      Approve
                    </Button>
                    <Button
                      color="red"
                      size="xs"
                      onClick={() => handleAction(r.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                No pending requests.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
