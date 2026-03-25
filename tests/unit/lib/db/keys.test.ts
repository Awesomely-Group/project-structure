import { describe, expect, it } from "vitest";
import {
  accountPK,
  projectPK,
  invoicePK,
  invoiceLineSK,
  userPK,
  syncPK,
  syncEventSK,
  gsi1AccountSK,
  gsi1InvoiceLineSK,
  gsi2ProjectStatusSK,
  METADATA_SK,
  GSI1_ACCOUNTS,
  GSI1_UNASSIGNED_LINES,
  GSI2_PROJECTS,
} from "@/lib/db/keys";

describe("DynamoDB key generators", () => {
  it("generates account PK correctly", () => {
    expect(accountPK("jira", "acc-123")).toBe("ACCOUNT#jira#acc-123");
    expect(accountPK("holded", "acc-456")).toBe("ACCOUNT#holded#acc-456");
  });

  it("generates project PK correctly", () => {
    expect(projectPK("proj-1")).toBe("PROJECT#proj-1");
  });

  it("generates invoice PK and line SK correctly", () => {
    expect(invoicePK("inv-1")).toBe("INVOICE#inv-1");
    expect(invoiceLineSK(1)).toBe("LINE#0001");
    expect(invoiceLineSK(42)).toBe("LINE#0042");
  });

  it("generates user PK correctly", () => {
    expect(userPK("user-1")).toBe("USER#user-1");
  });

  it("generates sync keys correctly", () => {
    expect(syncPK("acc-1")).toBe("SYNC#acc-1");
    expect(syncEventSK("2026-03-25T10:00:00Z")).toBe(
      "EVENT#2026-03-25T10:00:00Z",
    );
  });

  it("generates GSI1 keys correctly", () => {
    expect(gsi1AccountSK("jira", "acc-1")).toBe("jira#acc-1");
    expect(gsi1InvoiceLineSK("inv-1", 3)).toBe("inv-1#LINE#0003");
  });

  it("generates GSI2 keys correctly", () => {
    expect(gsi2ProjectStatusSK("active", "proj-1")).toBe("active#proj-1");
  });

  it("exports constants correctly", () => {
    expect(METADATA_SK).toBe("METADATA");
    expect(GSI1_ACCOUNTS).toBe("ACCOUNTS");
    expect(GSI1_UNASSIGNED_LINES).toBe("INVOICELINES#UNASSIGNED");
    expect(GSI2_PROJECTS).toBe("PROJECTS");
  });
});
