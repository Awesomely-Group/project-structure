export type Provider = "jira" | "holded";

export type AccountSyncStatus =
  | "success"
  | "error"
  | "in_progress"
  | null;

export interface Account {
  id: string;
  provider: Provider;
  name: string;
  baseUrl: string;
  webhookSecret?: string;
  lastSyncAt: string | null;
  lastSyncStatus: AccountSyncStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "active" | "archived";

export interface Project {
  id: string;
  accountId: string;
  jiraProjectId: string;
  name: string;
  key: string;
  status: ProjectStatus;
  responsible: string | null;
  issueCount: number;
  sprintCount: number;
  estimatedHours: number;
  loggedHours: number;
  billableHours: number;
  hourlyRate: number;
  totalCost: number;
  totalBilled: number;
  margin: number;
  marginPercent: number;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue";

export interface Invoice {
  id: string;
  accountId: string;
  holdedInvoiceId: string;
  invoiceNumber: string;
  clientName: string;
  status: InvoiceStatus;
  totalAmount: number;
  currency: string;
  issueDate: string;
  dueDate: string;
  lineCount: number;
  assignedLineCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceLine {
  invoiceId: string;
  lineNumber: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  tax: number;
  assignedProjectId: string | null;
  assignedProjectName: string | null;
  assignedAt: string | null;
}

export interface SyncEvent {
  accountId: string;
  timestamp: string;
  type: "full" | "webhook" | "manual";
  status: "success" | "error";
  message: string;
  itemsSynced: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalCosts: number;
  avgMargin: number;
  projectCount: number;
  invoiceCount: number;
  unassignedLineCount: number;
}
