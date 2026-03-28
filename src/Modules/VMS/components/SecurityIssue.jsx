import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Paper,
  TextInput,
  Textarea,
  Select,
  Button,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

function SecurityIssue({ onClose, onRefresh }) {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const severityMap = {
        "Low - Routine Disturbance": "low",
        "Medium - Unauthorized Area Access": "medium",
        "High - Security Threat / Altercation": "high",
      };
      await axios.post(
        `${host}/vms/incidents/`,
        {
          severity: severityMap[level] || "low",
          issue_type: "other", // Must match one of: unauthorized_access, policy_violation, equipment_failure, suspicious_behavior, other
          description: `${title} - ${description}`,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      notifications.show({
        title: "Issue Logged",
        message: "The incident has been logged and the supervisor notified",
        color: "orange",
      });
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Failed to log incident",
        color: "red",
      });
    }
  };

  return (
    <Paper p="md">
      <Select
        label="Severity Classification (BR-038)"
        placeholder="Choose Severity Level"
        data={[
          "Low - Routine Disturbance",
          "Medium - Unauthorized Area Access",
          "High - Security Threat / Altercation",
        ]}
        value={level}
        onChange={setLevel}
        mb="sm"
      />
      <TextInput
        label="Incident Shortcut Title"
        placeholder="Brief title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        mb="sm"
      />
      <Textarea
        label="Detailed Report (BR-041)"
        placeholder="Document the evidence and response protocol..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        minRows={4}
        mb="md"
      />
      <Group position="right">
        <Button color="orange" onClick={handleSubmit}>
          Submit Security Logging
        </Button>
      </Group>
    </Paper>
  );
}

SecurityIssue.propTypes = {
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
};

SecurityIssue.defaultProps = {
  onClose: null,
  onRefresh: null,
};

export default SecurityIssue;
