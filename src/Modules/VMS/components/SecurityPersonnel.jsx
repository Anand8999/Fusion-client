import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Table,
  Button,
  Badge,
  Group,
  Modal,
  TextInput,
  Select,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { fetchGuardsApi, assignGuardShiftApi } from "./api";

export default function SecurityPersonnel() {
  const [guards, setGuards] = useState([]);
  const [assignOpened, { open: openAssign, close: closeAssign }] =
    useDisclosure(false);
  const [guardId, setGuardId] = useState("");
  const [shiftName, setShiftName] = useState("Morning");

  const loadGuards = async () => {
    try {
      const data = await fetchGuardsApi();
      setGuards(data);
    } catch (err) {
      console.error("Failed to load security personnel", err);
    }
  };

  useEffect(() => {
    loadGuards();
  }, []);

  const handleAssign = async () => {
    try {
      // we will need the real ID of the globals.ExtraInfo user.
      // But because we might not have a dropdown of users built out here,
      // we accept integer ID inputs for this prototype
      await assignGuardShiftApi({
        guard: parseInt(guardId, 10),
        shift_name: shiftName,
        status: "On Duty",
      });
      notifications.show({
        title: "Success",
        message: "Assigned successfully!",
      });
      closeAssign();
      loadGuards();
    } catch (err) {
      notifications.show({
        title: "Error",
        message:
          "Failed to assign personnel. Ensure the ID is a valid ExtraInfo user ID.",
        color: "red",
      });
      console.error(err);
    }
  };

  const rows = guards.map((guard) => (
    <Table.Tr key={guard.id}>
      <Table.Td>{guard.guard_id}</Table.Td>
      <Table.Td>{guard.guard_name}</Table.Td>
      <Table.Td>{guard.shift_name}</Table.Td>
      <Table.Td>
        <Badge color={guard.status === "On Duty" ? "green" : "gray"}>
          {guard.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Button size="xs" variant="outline">
          Edit
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper shadow="sm" p="md" withBorder>
      <Group position="apart" mb="md">
        <Title order={3}>Manage Security Personnel</Title>
        <Button onClick={openAssign}>Assign Personnel</Button>
      </Group>

      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Shift</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.length > 0 ? (
            rows
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} style={{ textAlign: "center" }}>
                No Security Personnel shifts found.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      <Modal
        opened={assignOpened}
        onClose={closeAssign}
        title="Assign Guard Shift"
      >
        <TextInput
          label="Personnel ExtraInfo ID"
          placeholder="Enter User ExtraInfo Integer ID (e.g. 1)"
          value={guardId}
          onChange={(e) => setGuardId(e.target.value)}
          required
          mb="sm"
        />
        <Select
          label="Shift Designation"
          data={["Morning", "Evening", "Night"]}
          value={shiftName}
          onChange={setShiftName}
          mb="lg"
        />
        <Group position="right">
          <Button onClick={handleAssign} color="green">
            Confirm Assignment
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}
