import React, { useState, useEffect } from "react";
import { Paper, Title, Text, Table, Badge, ScrollArea } from "@mantine/core";
import { fetchVIPRulesApi } from "./api";

export default function VIPPermissions() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    const loadRules = async () => {
      try {
        const data = await fetchVIPRulesApi();
        setRules(data);
      } catch (err) {
        console.error("Failed to load VIP rules", err);
      }
    };
    loadRules();
  }, []);

  const rows = rules.map((rule) => (
    <Table.Tr key={rule.id}>
      <Table.Td>{rule.visitor_name}</Table.Td>
      <Table.Td>{rule.organization || "N/A"}</Table.Td>
      <Table.Td>{new Date(rule.created_at).toLocaleDateString()}</Table.Td>
      <Table.Td>
        <Badge color={rule.active ? "green" : "gray"}>
          {rule.active ? "Active" : "Inactive"}
        </Badge>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title order={3} mb="md">
        Manage VIP Permissions
      </Title>
      <Text mb="sm">
        Configure specialized access permissions for recurring or prominent
        guests.
      </Text>

      <ScrollArea>
        <Table striped highlightOnHover mt="md">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Visitor Name</Table.Th>
              <Table.Th>Organization</Table.Th>
              <Table.Th>Created At</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4} style={{ textAlign: "center" }}>
                  No VIP Rules found.
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
