import type { Provider } from "@/lib/types";

// --- Base table keys ---

export function accountPK(provider: Provider, id: string): string {
  return `ACCOUNT#${provider}#${id}`;
}

export function projectPK(id: string): string {
  return `PROJECT#${id}`;
}

export function invoicePK(invoiceId: string): string {
  return `INVOICE#${invoiceId}`;
}

export function invoiceLineSK(lineNumber: number): string {
  return `LINE#${String(lineNumber).padStart(4, "0")}`;
}

export function userPK(id: string): string {
  return `USER#${id}`;
}

export function syncPK(accountId: string): string {
  return `SYNC#${accountId}`;
}

export function syncEventSK(timestamp: string): string {
  return `EVENT#${timestamp}`;
}

export const METADATA_SK = "METADATA";

// --- GSI1 keys ---

export const GSI1_ACCOUNTS = "ACCOUNTS";
export const GSI1_USERS = "USERS";
export const GSI1_UNASSIGNED_LINES = "INVOICELINES#UNASSIGNED";
export const GSI1_ASSIGNED_LINES = "INVOICELINES#ASSIGNED";

export function gsi1AccountSK(provider: Provider, id: string): string {
  return `${provider}#${id}`;
}

export function gsi1JiraAccountPK(accountId: string): string {
  return `ACCOUNT#jira#${accountId}`;
}

export function gsi1HoldedAccountPK(accountId: string): string {
  return `ACCOUNT#holded#${accountId}`;
}

export function gsi1ProjectSK(id: string): string {
  return `PROJECT#${id}`;
}

export function gsi1InvoiceSK(id: string): string {
  return `INVOICE#${id}`;
}

export function gsi1InvoiceLineSK(
  invoiceId: string,
  lineNumber: number,
): string {
  return `${invoiceId}#LINE#${String(lineNumber).padStart(4, "0")}`;
}

// --- GSI2 keys ---

export const GSI2_PROJECTS = "PROJECTS";
export const GSI2_INVOICES = "INVOICES";

export function gsi2ProjectStatusSK(status: string, id: string): string {
  return `${status}#${id}`;
}

export function gsi2InvoiceStatusSK(status: string, id: string): string {
  return `${status}#${id}`;
}

export function gsi2ProjectPK(projectId: string): string {
  return `PROJECT#${projectId}`;
}

export function gsi2InvoiceLineSK(
  invoiceId: string,
  lineNumber: number,
): string {
  return `INVOICELINE#${invoiceId}#LINE#${String(lineNumber).padStart(4, "0")}`;
}
