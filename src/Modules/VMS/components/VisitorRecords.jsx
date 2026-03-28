import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Table,
  Badge,
  ScrollArea,
  TextInput,
  Group,
  Button,
} from "@mantine/core";
import { fetchRecentVisitsApi } from "./api";

export default function VisitorRecords() {
  const [search, setSearch] = useState("");
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Fetch recent visits and use them as records for now
        const data = await fetchRecentVisitsApi();
        setRecords(data);
      } catch (err) {
        console.error("Failed to load records", err);
      }
    };
    fetchRecords();
  }, []);

  const filteredRecords = records.filter(
    (record) =>
      record?.visitor?.full_name
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      record?.purpose?.toLowerCase().includes(search.toLowerCase()),
  );

  const rows = filteredRecords.map((element) => (
    <Table.Tr key={element.id}>
      <Table.Td>{element.visitor?.full_name}</Table.Td>
      <Table.Td>{element.purpose}</Table.Td>
      <Table.Td>
        {new Date(element.registered_at).toLocaleDateString()}
      </Table.Td>
      <Table.Td>
        <Badge
          color={
            element.status === "inside"
              ? "blue"
              : element.status === "exited"
                ? "gray"
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
      <Title order={3} mb="md">
        Visitor Records View
      </Title>
      <Group mb="md">
        <TextInput
          placeholder="Search visitors..."
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button>Search</Button>
      </Group>
      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Purpose</Table.Th>
              <Table.Th>Date</Table.Th>
              <Table.Th>Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}
