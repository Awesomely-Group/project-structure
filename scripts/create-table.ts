import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME ?? "erp-dashboard";
const REGION = process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? "eu-west-1";
const ENDPOINT = process.env.DYNAMODB_ENDPOINT ?? "http://localhost:8000";

async function createTable(): Promise<void> {
  const client = new DynamoDBClient({ region: REGION, endpoint: ENDPOINT });

  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`Table "${TABLE_NAME}" already exists. Skipping creation.`);
    return;
  } catch (error: unknown) {
    const isNotFound =
      error instanceof Error && error.name === "ResourceNotFoundException";
    if (!isNotFound) throw error;
  }

  console.log(`Creating table "${TABLE_NAME}"...`);

  await client.send(
    new CreateTableCommand({
      TableName: TABLE_NAME,
      KeySchema: [
        { AttributeName: "PK", KeyType: "HASH" },
        { AttributeName: "SK", KeyType: "RANGE" },
      ],
      AttributeDefinitions: [
        { AttributeName: "PK", AttributeType: "S" },
        { AttributeName: "SK", AttributeType: "S" },
        { AttributeName: "GSI1PK", AttributeType: "S" },
        { AttributeName: "GSI1SK", AttributeType: "S" },
        { AttributeName: "GSI2PK", AttributeType: "S" },
        { AttributeName: "GSI2SK", AttributeType: "S" },
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            { AttributeName: "GSI1PK", KeyType: "HASH" },
            { AttributeName: "GSI1SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
        {
          IndexName: "GSI2",
          KeySchema: [
            { AttributeName: "GSI2PK", KeyType: "HASH" },
            { AttributeName: "GSI2SK", KeyType: "RANGE" },
          ],
          Projection: { ProjectionType: "ALL" },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
    }),
  );

  console.log(`Table "${TABLE_NAME}" created with GSI1 and GSI2.`);
}

createTable().catch((error: unknown) => {
  console.error("Failed to create table:", error);
  process.exit(1);
});
