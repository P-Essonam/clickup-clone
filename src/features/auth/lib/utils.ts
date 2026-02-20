import { ManageType, WorkspaceType } from "./types";

export const WORKSPACE_TYPES: WorkspaceType[] = [
  { id: "work", label: "Work" },
  { id: "personal", label: "Personal" },
  { id: "school", label: "School" },
];

export const MANAGE_TYPES: ManageType[] = [
  { id: "professional_services", label: "Professional Services" },
  { id: "hr_recruiting", label: "HR & Recruiting" },
  { id: "personal_use", label: "Personal Use" },
  { id: "operations", label: "Operations" },
  { id: "startup", label: "Startup" },
  { id: "support", label: "Support" },
  { id: "software_development", label: "Software Development" },
  { id: "creative_design", label: "Creative & Design" },
  { id: "sales_crm", label: "Sales & CRM" },
  { id: "finance_accounting", label: "Finance & Accounting" },
  { id: "pmo", label: "PMO" },
  { id: "it", label: "IT" },
  { id: "marketing", label: "Marketing" },
  { id: "other", label: "Other" },
];