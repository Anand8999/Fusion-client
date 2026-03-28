import React, { useState, useEffect } from "react";
import {
  Container,
  Title,
  Paper,
  Table,
  Button,
  Grid,
  Badge,
  Group,
  Modal,
  TextInput,
  Select,
  Textarea,
  NumberInput,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  fetchRecentVisitsApi,
  registerVisitorApi,
  markEntryExitApi,
  createOverrideRequestApi,
  fetchAllOverridesApi,
} from "./components/api";

import VisitorRecords from "./components/VisitorRecords";
import Reports from "./components/Reports";
import SecurityPersonnel from "./components/SecurityPersonnel";
import VIPPermissions from "./components/VIPPermissions";
import ReviewEscalations from "./components/ReviewEscalations";
import VisitorMovement from "./components/VisitorMovement";
import VerifyIdentity from "./components/VerifyIdentity";
import DenyEntry from "./components/DenyEntry";
import SecurityIssue from "./components/SecurityIssue";
import HandleSecurityIssues from "./components/HandleSecurityIssues";
import IssuePass from "./components/IssuePass";

export default function VMSDashboard() {
  const [visits, setVisits] = useState([]);

  const userRole = useSelector((state) => state.user.role);
  const checkRole = (roleKeyword) => {
    if (!userRole) return false;
    if (typeof userRole === "string")
      return userRole.toLowerCase().includes(roleKeyword.toLowerCase());
    if (Array.isArray(userRole))
      return userRole.some(
        (r) =>
          typeof r === "string" &&
          r.toLowerCase().includes(roleKeyword.toLowerCase()),
      );
    return false;
  };
  const isSupervisor = checkRole("supervisor");
  const isGuard =
    (checkRole("guard") || checkRole("security")) && !isSupervisor;

  // Modals state
  const [registerOpened, { open: openRegister, close: closeRegister }] =
    useDisclosure(false);
  const [verifyOpened, { open: openVerify, close: closeVerify }] =
    useDisclosure(false);
  const [issuePassOpened, { open: openIssuePass, close: closeIssuePass }] =
    useDisclosure(false);
  const [denyOpened, { open: openDeny, close: closeDeny }] =
    useDisclosure(false);
  const [incidentOpened, { open: openIncident, close: closeIncident }] =
    useDisclosure(false);
  const [escalateOpened, { open: openEscalate, close: closeEscalate }] =
    useDisclosure(false);

  // Admin/Supervisor Component Modals state
  const [recordsOpened, { open: openRecords, close: closeRecords }] =
    useDisclosure(false);
  const [reportsOpened, { open: openReports, close: closeReports }] =
    useDisclosure(false);
  const [
    securityPersonnelOpened,
    { open: openSecurityPersonnel, close: closeSecurityPersonnel },
  ] = useDisclosure(false);
  const [
    vipPermissionOpened,
    { open: openVipPermission, close: closeVipPermission },
  ] = useDisclosure(false);
  const [movementOpened, { open: openMovement, close: closeMovement }] =
    useDisclosure(false);
  const [
    handleIncidentOpened,
    { open: openHandleIncident, close: closeHandleIncident },
  ] = useDisclosure(false);
  const [
    reviewEscalationOpened,
    { open: openReviewEscalation, close: closeReviewEscalation },
  ] = useDisclosure(false);

  const [activeVisitor, setActiveVisitor] = useState(null);
  const [activeVisitId, setActiveVisitId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [regForm, setRegForm] = useState({
    full_name: "",
    id_number: "",
    id_type: "aadhaar",
    contact_phone: "",
    purpose: "",
    host_name: "",
    host_department: "",
    expected_duration_minutes: 60,
  });
  const [escalationPolledStatus, setEscalationPolledStatus] = useState(null);

  const getRegistrationPayload = (approvedBySupervisor = false) => ({
    full_name: regForm.full_name,
    id_number: regForm.id_number,
    id_type: regForm.id_type,
    contact_phone: regForm.contact_phone || "9999999999",
    purpose: regForm.purpose || "Visit",
    host_name: regForm.host_name || "Admin",
    host_department: regForm.host_department || "General",
    expected_duration_minutes: regForm.expected_duration_minutes,
    approved_by_supervisor: approvedBySupervisor,
  });

  const fetchVisits = async () => {
    try {
      const data = await fetchRecentVisitsApi();
      setVisits(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVisits();
  }, []);

  const handleRegisterSubmit = async () => {
    try {
      await registerVisitorApi(getRegistrationPayload());
      notifications.show({ title: "Success", message: "Visitor registered!" });
      closeRegister();
      fetchVisits();
    } catch (err) {
      console.error("REGISTER API ERROR:", err, err?.response?.data);
      const errData = err?.response?.data;
      const errMsg = errData?.error || errData?.message || err?.message || "";

      if (
        String(errMsg).toUpperCase().includes("BLACKLISTED") ||
        String(errData).toUpperCase().includes("BLACKLISTED")
      ) {
        setEscalationPolledStatus(null);
        openEscalate();
      } else {
        notifications.show({
          title: "Error",
          message:
            String(errMsg) || "Failed to register. ID may be blacklisted.",
          color: "red",
        });
      }
    }
  };

  const handleSupervisorEscalation = async () => {
    try {
      await createOverrideRequestApi({
        full_name: regForm.full_name,
        id_number: regForm.id_number,
        reason: "Blacklisted",
      });
      notifications.show({
        title: "Success",
        message: "Escalation request sent to Supervisor",
      });
      setEscalationPolledStatus("pending");
    } catch (err) {
      console.error("DEBUG ESCALATION ERROR: ", err.response || err);
      const errMsg =
        err.response?.data?.error || err.message || "Unknown error";
      if (
        errMsg === "An escalation request is already pending for this visitor."
      ) {
        setEscalationPolledStatus("pending");
        notifications.show({
          title: "Info",
          message: "Request already pending.",
        });
      } else {
        notifications.show({
          title: "Error",
          message:
            typeof errMsg === "object"
              ? JSON.stringify(errMsg)
              : String(errMsg),
          color: "red",
          autoClose: 10000,
        });
      }
    }
  };

  const handleCheckPermission = async () => {
    try {
      const reqs = await fetchAllOverridesApi();
      const user_id_number = regForm.id_number || activeVisitor?.id_number;
      const myReq = reqs.find((r) => r.id_number === user_id_number);
      if (myReq) {
        setEscalationPolledStatus(myReq.status);
        if (myReq.status === "approved") {
          notifications.show({
            title: "Permission Granted!",
            message: "Supervisor approved entry. Registering...",
            color: "green",
          });
          try {
            const payload = getRegistrationPayload(true);
            console.log("DEBUG: Registration payload with approval:", payload);
            await registerVisitorApi(payload);
            notifications.show({
              title: "Success",
              message: "Visitor registered!",
            });
            closeEscalate();
            closeRegister();
            fetchVisits();
          } catch (regErr) {
            console.error(
              "DEBUG: Registration error:",
              regErr,
              regErr?.response?.data,
            );
            const errMsg =
              regErr?.response?.data?.error ||
              regErr?.response?.data ||
              regErr?.message ||
              "Registration failed";
            notifications.show({
              title: "Registration Failed",
              message: String(errMsg),
              color: "red",
              autoClose: 15000,
            });
          }
        } else if (myReq.status === "rejected") {
          notifications.show({
            title: "Permission Denied",
            message: "Supervisor rejected entry. Visitor cannot be registered.",
            color: "red",
          });
          closeEscalate();
          closeRegister();
        } else {
          notifications.show({
            title: "Pending",
            message: "Supervisor has not responded yet.",
            color: "yellow",
          });
        }
      } else {
        notifications.show({
          title: "Wait",
          message: "No escalation request found for this ID.",
          color: "red",
        });
      }
    } catch (error) {
      console.error("DEBUG: Check permission error:", error);
      notifications.show({
        title: "Error",
        message: `Failed to check status: ${error?.message || ""}`,
        color: "red",
      });
    }
  };

  const handleStatusChange = async (visit_id, endpoint) => {
    try {
      await markEntryExitApi(endpoint, { visit_id, gate_name: "Main Gate" });
      notifications.show({
        title: "Success",
        message: `Marked ${endpoint} successfully`,
      });
      fetchVisits();
    } catch (err) {
      notifications.show({
        title: "Error",
        message: `Failed to mark ${endpoint}`,
        color: "red",
      });
    }
  };

  const statusColors = {
    registered: "yellow",
    id_verified: "grape",
    pass_issued: "cyan",
    inside: "green",
    exited: "gray",
    denied: "red",
  };

  const filteredVisits = visits.filter(
    (v) =>
      v?.visitor?.full_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      v?.purpose?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v?.host_name &&
        v.host_name.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <Container size="xl" mt="md">
      <Group position="apart" align="flex-start" mb="md">
        <Title order={2}>Visitor Management System (VMS)</Title>
        <Group>
          <Badge color="blue" size="lg">
            {userRole}
          </Badge>
        </Group>
      </Group>

      {/* ADMIN CONTROLS */}
      {(userRole === "Admin" ||
        userRole === "admin" ||
        userRole === "administrator") && (
        <Paper shadow="xs" p="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Administrator Actions
          </Title>
          <Group>
            <Button variant="outline" color="violet" onClick={openRecords}>
              View Visitor Records
            </Button>
            <Button variant="outline" color="violet" onClick={openReports}>
              Generate Reports
            </Button>
            <Button
              variant="outline"
              color="violet"
              onClick={openSecurityPersonnel}
            >
              Manage Security Personnel
            </Button>
            <Button
              variant="outline"
              color="violet"
              onClick={openVipPermission}
            >
              Manage VIP Permission
            </Button>
          </Group>
        </Paper>
      )}

      {/* SUPERVISOR CONTROLS */}
      {isSupervisor && (
        <Paper shadow="xs" p="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Security Supervisor Actions
          </Title>
          <Group>
            <Button color="blue" onClick={openMovement}>
              Monitor Visitor Movement
            </Button>
            <Button color="orange" onClick={openHandleIncident}>
              Handle Security Issues
            </Button>{" "}
            <Button color="violet" onClick={openReviewEscalation}>
              Review Escalations
            </Button>{" "}
            <Button
              color="red"
              variant="outline"
              onClick={() =>
                notifications.show({
                  title: "CRITICAL",
                  message: "Global Emergency Lockdown Triggered!",
                  color: "red",
                })
              }
            >
              Initiate Lockdown
            </Button>
          </Group>
        </Paper>
      )}

      {/* SECURITY GUARD CONTROLS */}
      {isGuard && (
        <Paper shadow="xs" p="md" withBorder mb="lg">
          <Title order={4} mb="md">
            Security Personnel Actions
          </Title>
          <Group>
            <Button color="blue" onClick={openRegister}>
              Register Visitor
            </Button>
            <Button color="red" variant="outline" onClick={openDeny}>
              Deny Entry
            </Button>
            <Button color="orange" variant="light" onClick={openIncident}>
              Log Security Issue
            </Button>
          </Group>
        </Paper>
      )}

      <Paper shadow="xs" p="md" withBorder>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "1rem",
            alignItems: "center",
          }}
        >
          <Title order={4}>Recent Visits & Actions</Title>
          <Group>
            <TextInput
              placeholder="Search visitor by name, purpose, or host..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
              style={{ width: "300px" }}
            />
            <Button variant="light" size="sm" onClick={fetchVisits}>
              Refresh List
            </Button>
          </Group>
        </div>

        <Table.ScrollContainer minWidth={1000}>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Role / Purpose</Table.Th>
                <Table.Th>Host</Table.Th>
                <Table.Th>Entry Time</Table.Th> <Table.Th>Exit Time</Table.Th>{" "}
                <Table.Th>Status</Table.Th>
                {isGuard && <Table.Th>Actions (Guard workflow)</Table.Th>}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {filteredVisits.length > 0 ? (
                filteredVisits.map((b) => (
                  <Table.Tr key={b.id}>
                    <Table.Td>{b?.visitor?.full_name}</Table.Td>
                    <Table.Td>{b?.purpose}</Table.Td>
                    <Table.Td>{b?.host_name || "N/A"}</Table.Td>
                    <Table.Td>
                      {new Date(
                        b?.entry_at || b?.registered_at,
                      ).toLocaleString()}
                    </Table.Td>{" "}
                    <Table.Td>
                      {b?.exit_at ? new Date(b?.exit_at).toLocaleString() : "-"}
                    </Table.Td>{" "}
                    <Table.Td>
                      <Badge color={statusColors[b?.status]}>{b?.status}</Badge>
                    </Table.Td>
                    {isGuard && (
                      <Table.Td>
                        <Group gap="5px" wrap="nowrap">
                          <Button
                            color="yellow"
                            size="xs"
                            onClick={() => {
                              setActiveVisitId(b.id);
                              setActiveVisitor(b.visitor);
                              openVerify();
                            }}
                          >
                            Verify
                          </Button>
                          <Button
                            color="red"
                            size="xs"
                            onClick={() => {
                              setActiveVisitId(b.id);
                              openDeny();
                            }}
                          >
                            Deny
                          </Button>
                          <Button
                            size="xs"
                            onClick={() => {
                              setActiveVisitId(b.id);
                              openIssuePass();
                            }}
                          >
                            Issue Pass
                          </Button>
                          <Button
                            color="green"
                            size="xs"
                            onClick={() => {
                              handleStatusChange(b.id, "entry");
                            }}
                          >
                            Mark Entry
                          </Button>
                          <Button
                            color="gray"
                            size="xs"
                            onClick={() => {
                              handleStatusChange(b.id, "exit");
                            }}
                          >
                            Mark Exit
                          </Button>
                        </Group>
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td
                    colSpan={isGuard ? 7 : 6}
                    style={{ textAlign: "center" }}
                  >
                    No visitors found.
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* --- GUARD COMPONENT MODALS ---  */}
      <Modal
        opened={registerOpened}
        onClose={closeRegister}
        title="Register Walk-in Visitor"
        size="lg"
      >
        <Grid>
          <Grid.Col span={6}>
            <TextInput
              label="Full Name"
              value={regForm.full_name}
              onChange={(e) =>
                setRegForm({ ...regForm, full_name: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="ID Number"
              value={regForm.id_number}
              onChange={(e) =>
                setRegForm({ ...regForm, id_number: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <Select
              label="ID Type"
              value={regForm.id_type}
              onChange={(val) => setRegForm({ ...regForm, id_type: val })}
              data={[
                { value: "aadhaar", label: "Aadhaar" },
                { value: "passport", label: "Passport" },
                { value: "national_id", label: "National ID" },
                { value: "driver_license", label: "Driver License" },
              ]}
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Contact Phone"
              value={regForm.contact_phone}
              onChange={(e) =>
                setRegForm({ ...regForm, contact_phone: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label="Purpose of Visit"
              value={regForm.purpose}
              onChange={(e) =>
                setRegForm({ ...regForm, purpose: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Host Name"
              value={regForm.host_name}
              onChange={(e) =>
                setRegForm({ ...regForm, host_name: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={6}>
            <TextInput
              label="Host Department"
              value={regForm.host_department}
              onChange={(e) =>
                setRegForm({ ...regForm, host_department: e.target.value })
              }
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <NumberInput
              label="Expected Duration (minutes for Pass validity/Exit approx)"
              value={regForm.expected_duration_minutes}
              onChange={(val) =>
                setRegForm({ ...regForm, expected_duration_minutes: val })
              }
              min={5}
            />
          </Grid.Col>
        </Grid>
        <Group position="right" mt="md">
          <Button onClick={handleRegisterSubmit}>Submit</Button>
        </Group>
      </Modal>

      {/* --- SUPPLEMENTARY COMPONENT MODALS ---  */}
      <Modal
        opened={recordsOpened}
        onClose={closeRecords}
        title="Visitor Records"
        size="xl"
      >
        <VisitorRecords />
      </Modal>

      <Modal
        opened={reportsOpened}
        onClose={closeReports}
        title="VMS Reports"
        size="lg"
      >
        <Reports />
      </Modal>

      <Modal
        opened={securityPersonnelOpened}
        onClose={closeSecurityPersonnel}
        title="Security Roster"
        size="xl"
      >
        <SecurityPersonnel />
      </Modal>

      <Modal
        opened={vipPermissionOpened}
        onClose={closeVipPermission}
        title="VIP Permissions"
        size="lg"
      >
        <VIPPermissions />
      </Modal>

      <Modal
        opened={movementOpened}
        onClose={closeMovement}
        title="Visitor Movement Log"
        size="lg"
      >
        <VisitorMovement />
      </Modal>

      <Modal
        opened={verifyOpened}
        onClose={closeVerify}
        title="Verify Visitor Identity"
        size="md"
      >
        <VerifyIdentity
          visitId={activeVisitId}
          onClose={closeVerify}
          onRefresh={fetchVisits}
          onBlacklisted={() => {
            closeVerify();
            openEscalate();
          }}
        />
      </Modal>

      <Modal
        opened={denyOpened}
        onClose={closeDeny}
        title="Deny Visitor Entry"
        size="md"
      >
        <DenyEntry
          visitId={activeVisitId}
          onClose={closeDeny}
          onRefresh={fetchVisits}
        />
      </Modal>

      <Modal
        opened={incidentOpened}
        onClose={closeIncident}
        title="Log Security Issue"
        size="lg"
      >
        <SecurityIssue onClose={closeIncident} onRefresh={fetchVisits} />
      </Modal>
      <Modal
        opened={handleIncidentOpened}
        onClose={closeHandleIncident}
        title="Handle Security Incidents"
        size="xl"
      >
        <HandleSecurityIssues onClose={closeHandleIncident} />
      </Modal>
      <Modal
        opened={escalateOpened}
        onClose={closeEscalate}
        title="Security Supervisor Escalation"
        size="md"
      >
        <p style={{ color: "red", fontWeight: "bold" }}>
          Alert: The provided ID is flagged on the security Blacklist.
        </p>
        {escalationPolledStatus === "pending" ? (
          <>
            <p style={{ color: "orange", fontWeight: "bold" }}>
              Escalation in progress: Awaiting Supervisor Approval.
            </p>
            <p>Please wait for the security personnel to grant permission.</p>
            <Group position="right" mt="md">
              <Button color="blue" onClick={handleCheckPermission}>
                Check Permission Status
              </Button>
            </Group>
          </>
        ) : escalationPolledStatus === "rejected" ? (
          <>
            <p style={{ color: "red", fontWeight: "bold" }}>
              Permission Denied.
            </p>
            <p>
              The supervisor rejected this request. Visitor cannot be registered
              for further action.
            </p>
            <Group position="right" mt="md">
              <Button
                color="gray"
                onClick={() => {
                  closeEscalate();
                  closeRegister();
                }}
              >
                Close
              </Button>
            </Group>
          </>
        ) : (
          <>
            <p>
              Please contact the Security Supervisor to review this visitor.
              Click below to send an escalation request for the supervisor to
              approve.
            </p>
            <Group position="right" mt="md">
              <Button color="red" onClick={handleSupervisorEscalation}>
                Send Escalation Request
              </Button>
            </Group>
          </>
        )}
      </Modal>
      <Modal
        opened={reviewEscalationOpened}
        onClose={closeReviewEscalation}
        title="Review Escalation Requests"
        size="xl"
      >
        <ReviewEscalations onClose={closeReviewEscalation} />
      </Modal>
      <Modal
        opened={issuePassOpened}
        onClose={closeIssuePass}
        title="Issue Visitor Pass"
        size="md"
      >
        <IssuePass
          visitId={activeVisitId}
          onClose={closeIssuePass}
          onRefresh={fetchVisits}
        />
      </Modal>
    </Container>
  );
}
