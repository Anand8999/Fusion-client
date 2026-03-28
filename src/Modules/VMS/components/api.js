import axios from "axios";
import {
  getRecentVisitsRoute,
  registerVisitorRoute,
  verifyIdentityRoute,
  denyEntryRoute,
  issuePassRoute,
  logSecurityIssueRoute,
  getMarkEntryExitRoute,
  getGuardsRoute,
  getVIPRulesRoute,
  getReportsRoute,
  overridesRoute,
} from "../../../routes/vmsRoutes";

export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    headers: {
      Authorization: `Token ${token}`,
    },
  };
};

export const fetchRecentVisitsApi = async () => {
  const res = await axios.get(getRecentVisitsRoute, getAuthHeaders());
  return res.data;
};

export const registerVisitorApi = async (data) => {
  const res = await axios.post(registerVisitorRoute, data, getAuthHeaders());
  return res.data;
};

export const verifyIdentityApi = async (data) => {
  const res = await axios.post(verifyIdentityRoute, data, getAuthHeaders());
  return res.data;
};

export const denyEntryApi = async (data) => {
  const res = await axios.post(denyEntryRoute, data, getAuthHeaders());
  return res.data;
};

export const issuePassApi = async (data) => {
  const res = await axios.post(issuePassRoute, data, getAuthHeaders());
  return res.data;
};

export const logSecurityIssueApi = async (data) => {
  const res = await axios.post(logSecurityIssueRoute, data, getAuthHeaders());
  return res.data;
};

export const markEntryExitApi = async (endpoint, data) => {
  const res = await axios.post(
    getMarkEntryExitRoute(endpoint),
    data,
    getAuthHeaders(),
  );
  return res.data;
};

export const fetchGuardsApi = async () => {
  const res = await axios.get(getGuardsRoute, getAuthHeaders());
  return res.data;
};

export const fetchVIPRulesApi = async () => {
  const res = await axios.get(getVIPRulesRoute, getAuthHeaders());
  return res.data;
};

export const fetchReportsApi = async (filter = "all") => {
  const res = await axios.get(
    `${getReportsRoute}?filter=${filter}`,
    getAuthHeaders(),
  );
  return res.data;
};

export const assignGuardShiftApi = async (data) => {
  const res = await axios.post(getGuardsRoute, data, getAuthHeaders());
  return res.data;
};

export const createOverrideRequestApi = async (data) => {
  const res = await axios.post(overridesRoute, data, getAuthHeaders());
  return res.data;
};

export const fetchPendingOverridesApi = async () => {
  const res = await axios.get(
    `${overridesRoute}?status=pending&_t=${Date.now()}`,
    getAuthHeaders(),
  );
  return res.data;
};

export const fetchAllOverridesApi = async () => {
  const res = await axios.get(
    `${overridesRoute}?_t=${Date.now()}`,
    getAuthHeaders(),
  );
  return res.data;
};

export const updateOverrideStatusApi = async (id, statusData) => {
  const res = await axios.patch(
    `${overridesRoute + id}/`,
    statusData,
    getAuthHeaders(),
  );
  return res.data;
};
