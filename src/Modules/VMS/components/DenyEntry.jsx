import React, { useState } from "react";
import PropTypes from "prop-types";
import { Paper, Textarea, Select, Button, Group, Alert } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import axios from "axios";
import { host } from "../../../routes/globalRoutes";

function DenyEntry({ visitId, onClose, onRefresh }) {
  const [reason, setReason] = useState("");
  const [category, setCategory] = useState("");

  const handleDenial = async () => {
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
        `${host}/vms/deny/`,
        {
          visit_id: visitId,
          reason: category,
          remarks: reason,
          escalated: true,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      notifications.show({
        title: "Denied",
        message: "Entry denied successfully.",
        color: "red",
      });
      if (onRefresh) onRefresh();
      if (onClose) onClose();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: "Denial log failed",
        color: "red",
      });
    }
  };

  return (
    <Paper p="md">
      <Alert color="red" title="Entry Denial Action" mb="md">
        You are about to log a formal entry denial (UC-003). This will generate
        a report for the Security Supervisor.
      </Alert>
      <Select
        label="Denial Category (BR-011)"
        placeholder="Select Reason Category"
        data={[
          "Invalid ID",
          "Blacklisted",
          "No Host Approval",
          "Security Threat",
        ]}
        value={category}
        onChange={setCategory}
        mb="sm"
      />
      <Textarea
        label="Detailed Justification"
        placeholder="Explain why the visitor was turned away..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        mb="md"
        minRows={3}
      />
      <Group position="right">
        <Button color="red" onClick={handleDenial}>
          Confirm Denial & Log Escort
        </Button>
      </Group>
    </Paper>
  );
}

DenyEntry.propTypes = {
  visitId: PropTypes.number.isRequired,
  onClose: PropTypes.func,
  onRefresh: PropTypes.func,
};

DenyEntry.defaultProps = {
  onClose: null,
  onRefresh: null,
};

export default DenyEntry;
