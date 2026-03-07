import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

export interface DocsTopic {
  id: string;
  title: string;
  content: string;
  order: number;
  published: boolean;
  updatedAt: string;
}

export interface KhaleelDocsConfig {
  topics: DocsTopic[];
  updatedAt: string;
}

const DEFAULT_DOCS: KhaleelDocsConfig = {
  topics: [
    {
      id: "intro",
      title: "ما هو خليل؟",
      content:
        "خليل مساعد عربي ذكي يفهم اللهجات ويقدّم إجابات عملية. هذه الصفحة هي المرجع الرسمي لفهم المنتج واستخدامه.\n\nيمكن للإدارة تعديل كل موضوع من لوحة التحكم.",
      order: 0,
      published: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: "style",
      title: "أسلوب خليل",
      content:
        "لغة خليل مرنة: فصحى رسمية أو عربية سهلة. الهدف أن يفهمك بسرعة ويرد بطريقة واضحة بدون تعقيد.",
      order: 1,
      published: true,
      updatedAt: new Date().toISOString(),
    },
  ],
  updatedAt: new Date().toISOString(),
};

const TABLE = process.env.DYNAMODB_DOCS_TABLE || "kheleel-docs";
const CONFIG_ID = "tahseen-khaleel-v1";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(client);

let tableEnsured = false;
let inMemoryConfig: KhaleelDocsConfig = JSON.parse(JSON.stringify(DEFAULT_DOCS)) as KhaleelDocsConfig;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isTableMissingError(error: unknown): boolean {
  const name = error instanceof Error ? error.name : "";
  const msg = error instanceof Error ? error.message : String(error);
  return (
    name === "ResourceNotFoundException" ||
    msg.includes("ResourceNotFoundException") ||
    msg.includes("Requested resource not found") ||
    msg.includes("Cannot do operations on a non-existent table")
  );
}

function sanitizeTopic(raw: unknown, index: number): DocsTopic | null {
  const topic = (raw ?? {}) as Partial<DocsTopic>;
  const title = typeof topic.title === "string" ? topic.title.trim() : "";
  const content = typeof topic.content === "string" ? topic.content.trim() : "";
  if (!title) return null;

  return {
    id: typeof topic.id === "string" && topic.id.trim() ? topic.id.trim() : `topic_${crypto.randomUUID()}`,
    title: title.slice(0, 120),
    content: content.slice(0, 12000),
    order: Number.isFinite(topic.order) ? Number(topic.order) : index,
    published: typeof topic.published === "boolean" ? topic.published : true,
    updatedAt: typeof topic.updatedAt === "string" && topic.updatedAt ? topic.updatedAt : new Date().toISOString(),
  };
}

function normalizeConfig(rawConfig: unknown): KhaleelDocsConfig {
  const config = (rawConfig ?? {}) as Partial<KhaleelDocsConfig>;
  const topicsRaw = Array.isArray(config.topics) ? config.topics : DEFAULT_DOCS.topics;
  const topics = topicsRaw
    .map((item, i) => sanitizeTopic(item, i))
    .filter((item): item is DocsTopic => !!item)
    .sort((a, b) => a.order - b.order)
    .map((topic, i) => ({ ...topic, order: i }));

  const fallbackTopics = clone(DEFAULT_DOCS.topics);
  return {
    topics: topics.length > 0 ? topics : fallbackTopics,
    updatedAt: typeof config.updatedAt === "string" && config.updatedAt ? config.updatedAt : new Date().toISOString(),
  };
}

async function ensureTableExists(): Promise<void> {
  if (tableEnsured) return;
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE }));
    tableEnsured = true;
    return;
  } catch (error) {
    if (!isTableMissingError(error)) throw error;
  }

  await client.send(
    new CreateTableCommand({
      TableName: TABLE,
      AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
      KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
      BillingMode: "PAY_PER_REQUEST",
    })
  );

  for (let i = 0; i < 20; i++) {
    try {
      const described = await client.send(new DescribeTableCommand({ TableName: TABLE }));
      if (described.Table?.TableStatus === "ACTIVE") {
        tableEnsured = true;
        return;
      }
    } catch {
      // Wait until table is active.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Docs table is not active yet");
}

async function readConfig(): Promise<KhaleelDocsConfig> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { id: CONFIG_ID },
      })
    );
    const config = normalizeConfig(result.Item?.config);
    inMemoryConfig = clone(config);
    return clone(config);
  } catch (error) {
    if (isTableMissingError(error)) {
      return clone(inMemoryConfig);
    }
    throw error;
  }
}

async function writeConfig(next: KhaleelDocsConfig): Promise<KhaleelDocsConfig> {
  const normalized = normalizeConfig(next);
  normalized.updatedAt = new Date().toISOString();
  await ensureTableExists();
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        id: CONFIG_ID,
        config: normalized,
      },
    })
  );
  inMemoryConfig = clone(normalized);
  return clone(normalized);
}

export async function getKhaleelDocsConfig(includeUnpublished = false): Promise<KhaleelDocsConfig> {
  const config = await readConfig();
  if (includeUnpublished) return config;
  return {
    ...config,
    topics: config.topics.filter((topic) => topic.published),
  };
}

export async function setKhaleelDocsTopics(topics: unknown[]): Promise<KhaleelDocsConfig> {
  const current = await readConfig();
  const normalizedTopics = normalizeConfig({ topics, updatedAt: current.updatedAt }).topics;
  return writeConfig({
    topics: normalizedTopics,
    updatedAt: new Date().toISOString(),
  });
}

