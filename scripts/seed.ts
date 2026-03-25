import { PutCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { getDocClient, getTableName } from "../src/lib/db/client";
import { METADATA_SK, userPK, GSI1_USERS } from "../src/lib/db/keys";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@company.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "change-me-on-first-login";
const SALT_ROUNDS = 12;

async function seed(): Promise<void> {
  const client = getDocClient();
  const tableName = getTableName();
  const userId = uuidv4();
  const now = new Date().toISOString();

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: {
        PK: userPK(userId),
        SK: METADATA_SK,
        GSI1PK: GSI1_USERS,
        GSI1SK: ADMIN_EMAIL,
        entityType: "USER",
        id: userId,
        email: ADMIN_EMAIL,
        passwordHash,
        name: "Admin",
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: "attribute_not_exists(PK)",
    }),
  );

  console.log(`Admin user created: ${ADMIN_EMAIL}`);
}

seed().catch((error: unknown) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
