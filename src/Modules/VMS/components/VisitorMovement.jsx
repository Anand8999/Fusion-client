import React from "react";
import { Paper, Title, Text, Button, Badge, Group } from "@mantine/core";

export default function VisitorMovement() {
  return (
    <Paper shadow="sm" p="md" withBorder>
      <Title order={3} mb="md">
        Monitor Visitor Movement
      </Title>
      <Text mb="sm">
        Track real-time location metrics of active visitors on premises.
      </Text>
      <Group>
        <Badge color="red" size="lg" radius="xs">
          Zone A: 12 Active
        </Badge>
        <Badge color="green" size="lg" radius="xs">
          Zone B: 5 Active
        </Badge>
        <Badge color="blue" size="lg" radius="xs">
          Zone C: 0 Active
        </Badge>
      </Group>
      <Button mt="md" variant="default">
        Refresh Map Data
      </Button>
    </Paper>
  );
}
