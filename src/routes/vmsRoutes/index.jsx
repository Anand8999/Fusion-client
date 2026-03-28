import { host } from "../globalRoutes";

export const getRecentVisitsRoute = `${host}/vms/recent/`;
export const registerVisitorRoute = `${host}/vms/register/`;
export const verifyIdentityRoute = `${host}/vms/verify/`;
export const denyEntryRoute = `${host}/vms/deny/`;
export const issuePassRoute = `${host}/vms/pass/`;
export const logSecurityIssueRoute = `${host}/vms/incidents/`;
export const getGuardsRoute = `${host}/vms/guards/`;
export const getVIPRulesRoute = `${host}/vms/vip-rules/`;
export const getReportsRoute = `${host}/vms/reports/`;

export const getMarkEntryExitRoute = (endpoint) => `${host}/vms/${endpoint}/`;
export const overridesRoute = `${host}/vms/overrides/`;
