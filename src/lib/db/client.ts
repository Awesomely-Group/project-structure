import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

function createClient(): DynamoDBDocumentClient {
  const endpoint = process.env.DYNAMODB_ENDPOINT;
  const region = process.env.DYNAMODB_REGION ?? process.env.AWS_REGION ?? "eu-west-1";

  const baseClient = new DynamoDBClient({
    region,
    ...(endpoint ? { endpoint } : {}),
  });

  return DynamoDBDocumentClient.from(baseClient, {
    marshallOptions: {
      removeUndefinedValues: true,
      convertEmptyValues: false,
    },
    unmarshallOptions: {
      wrapNumbers: false,
    },
  });
}

let _client: DynamoDBDocumentClient | undefined;

export function getDocClient(): DynamoDBDocumentClient {
  _client ??= createClient();
  return _client;
}

export function getTableName(): string {
  return process.env.DYNAMODB_TABLE_NAME ?? "erp-dashboard";
}
