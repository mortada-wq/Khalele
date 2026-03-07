import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export type FactCheckMode = "off" | "notify" | "notify_with_reason";

export interface FactCheckConfig {
  defaultMode: FactCheckMode;
  forceOn: boolean;
  updatedAt: string;
}

const TABLE = process.env.DYNAMODB_FACTCHECK_TABLE || "kheleel-factcheck-config";
const CONFIG_ID = "factcheck-config-v1";

const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const doc = DynamoDBDocumentClient.from(client);

let ensured = false;
let memoryConfig: FactCheckConfig = {
  defaultMode: "off",
  forceOn: false,
  updatedAt: new Date().toISOString(),
};

async function ensureTable() {
  if (ensured) return;
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }));
    ensured = true;
    return;
  } catch {
    // fall through
  }
  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );
  ensured = true;
}

export async function getFactCheckConfig(): Promise<FactCheckConfig> {
  try {
    await ensureTable();
    const res = await doc.send(
      new GetCommand({
        TableName: TABLE,
        Key: { id: CONFIG_ID },
      })
    );
    const cfg = (res.Item as FactCheckConfig | undefined) ?? memoryConfig;
    memoryConfig = cfg;
    return cfg;
  } catch {
    return memoryConfig;
  }
}

export async function setFactCheckConfig(update: Partial<FactCheckConfig>): Promise<FactCheckConfig> {
  const current = await getFactCheckConfig();
  const next: FactCheckConfig = {
    defaultMode: update.defaultMode ?? current.defaultMode,
    forceOn: update.forceOn ?? current.forceOn,
    updatedAt: new Date().toISOString(),
  };
  try {
    await ensureTable();
    await doc.send(
      new PutCommand({
        TableName: TABLE,
        Item: { id: CONFIG_ID, ...next },
      })
    );
    memoryConfig = next;
  } catch {
    memoryConfig = next;
  }
  return next;
}

