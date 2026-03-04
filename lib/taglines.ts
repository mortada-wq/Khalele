import {
  CreateTableCommand,
  DescribeTableCommand,
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

/**
 * Tagline storage/config persisted in DynamoDB.
 * Falls back to in-memory defaults for read paths when DynamoDB is unavailable.
 */

export interface Tagline {
  id: string;
  text: string;
  order: number;
  active: boolean;
  createdAt: string;
}

export interface TaglineConfig {
  taglines: Tagline[];
  rotationEnabled: boolean;
  rotationIntervalMinutes: number;
  activeTaglineId: string | null;
}

const DEFAULT_TAGLINES: Tagline[] = [
  {
    id: "1",
    text: "حضر الأصيل .. اشطبوا الوكلاء، تعرف على خليل",
    order: 0,
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    text: "ذكاء اصطناعي عربي — يفهم كل اللهجات ويرد بالفصحى أو العربية السهلة",
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_CONFIG: TaglineConfig = {
  taglines: [...DEFAULT_TAGLINES],
  rotationEnabled: false,
  rotationIntervalMinutes: 60, // 1 hour default
  activeTaglineId: "1",
};

const TABLE = process.env.DYNAMODB_TAGLINES_TABLE || "khalele-taglines";
const CONFIG_ID = "tagline-config-v1";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const docClient = DynamoDBDocumentClient.from(client);

let inMemoryConfig: TaglineConfig = clone(DEFAULT_CONFIG);
let tableEnsured = false;

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

function normalizeConfig(value: unknown): TaglineConfig {
  const cfg = (value ?? {}) as Partial<TaglineConfig>;
  const taglinesRaw = Array.isArray(cfg.taglines) ? cfg.taglines : DEFAULT_CONFIG.taglines;
  const taglines = taglinesRaw
    .map((t, i) => {
      const current = t as Partial<Tagline>;
      if (!current?.id || typeof current.text !== "string") return null;
      return {
        id: String(current.id),
        text: current.text.trim(),
        order: Number.isFinite(current.order) ? Number(current.order) : i,
        active: typeof current.active === "boolean" ? current.active : true,
        createdAt: typeof current.createdAt === "string" ? current.createdAt : new Date().toISOString(),
      } satisfies Tagline;
    })
    .filter((t): t is Tagline => !!t && t.text.length > 0)
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i }));

  const activeTaglineId =
    typeof cfg.activeTaglineId === "string" && taglines.some((t) => t.id === cfg.activeTaglineId)
      ? cfg.activeTaglineId
      : taglines[0]?.id ?? null;

  const rotationInterval =
    typeof cfg.rotationIntervalMinutes === "number" && cfg.rotationIntervalMinutes >= 1
      ? Math.min(cfg.rotationIntervalMinutes, 120)
      : DEFAULT_CONFIG.rotationIntervalMinutes;

  return {
    taglines: taglines.length > 0 ? taglines : clone(DEFAULT_CONFIG.taglines),
    rotationEnabled: typeof cfg.rotationEnabled === "boolean" ? cfg.rotationEnabled : DEFAULT_CONFIG.rotationEnabled,
    rotationIntervalMinutes: rotationInterval,
    activeTaglineId,
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
      // Wait for table propagation.
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Tagline table is not active yet");
}

async function readConfig(): Promise<TaglineConfig> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE,
        Key: { id: CONFIG_ID },
      })
    );
    const dbConfig = normalizeConfig(result.Item?.config);
    inMemoryConfig = clone(dbConfig);
    return clone(dbConfig);
  } catch (error) {
    if (isTableMissingError(error)) {
      return clone(inMemoryConfig);
    }
    throw error;
  }
}

async function writeConfig(config: TaglineConfig): Promise<TaglineConfig> {
  const normalized = normalizeConfig(config);
  await ensureTableExists();
  await docClient.send(
    new PutCommand({
      TableName: TABLE,
      Item: {
        id: CONFIG_ID,
        config: normalized,
        updatedAt: new Date().toISOString(),
      },
    })
  );
  inMemoryConfig = clone(normalized);
  return clone(normalized);
}

export async function getTaglineConfig(): Promise<TaglineConfig> {
  return readConfig();
}

export async function setTaglineConfig(newConfig: Partial<TaglineConfig>): Promise<TaglineConfig> {
  const current = await readConfig();
  return writeConfig({ ...current, ...newConfig });
}

export async function addTagline(text: string): Promise<Tagline> {
  const current = await readConfig();
  const tagline: Tagline = {
    id: crypto.randomUUID(),
    text,
    order: current.taglines.length,
    active: true,
    createdAt: new Date().toISOString(),
  };
  const next = await writeConfig({ ...current, taglines: [...current.taglines, tagline] });
  return next.taglines.find((t) => t.id === tagline.id) || tagline;
}

export async function updateTagline(id: string, updates: Partial<Tagline>): Promise<Tagline | null> {
  const current = await readConfig();
  const idx = current.taglines.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const updatedTaglines = [...current.taglines];
  updatedTaglines[idx] = { ...updatedTaglines[idx], ...updates, id: updatedTaglines[idx].id };
  const next = await writeConfig({ ...current, taglines: updatedTaglines });
  return next.taglines.find((t) => t.id === id) || null;
}

export async function deleteTagline(id: string): Promise<boolean> {
  const current = await readConfig();
  const filtered = current.taglines.filter((t) => t.id !== id);
  if (filtered.length === current.taglines.length) return false;
  const next = await writeConfig({
    ...current,
    taglines: filtered,
    activeTaglineId: current.activeTaglineId === id ? filtered[0]?.id ?? null : current.activeTaglineId,
  });
  return next.taglines.every((t) => t.id !== id);
}

export async function reorderTaglines(orderedIds: string[]): Promise<void> {
  const current = await readConfig();
  const taglines = current.taglines
    .map((t) => {
      const newOrder = orderedIds.indexOf(t.id);
      return { ...t, order: newOrder === -1 ? t.order : newOrder };
    })
    .sort((a, b) => a.order - b.order)
    .map((t, i) => ({ ...t, order: i }));

  await writeConfig({ ...current, taglines });
}

/**
 * Returns the tagline to display based on config.
 * When rotation: uses last 5 active taglines (or all if fewer than 5), rotates hourly.
 * When fixed: returns activeTaglineId.
 */
export async function getCurrentTagline(): Promise<string> {
  const config = await readConfig();
  const active = config.taglines.filter((t) => t.active);
  if (active.length === 0) return "خليلي — ذكاء اصطناعي عربي";

  if (config.rotationEnabled && active.length > 1) {
    // Use last 5 taglines (most recently added) or all if fewer than 5
    const sortedByDate = [...active].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const rotationPool = sortedByDate.slice(0, Math.min(5, sortedByDate.length));
    
    // Rotate every hour (60 minutes)
    const intervalMs = 60 * 60 * 1000; // 1 hour in milliseconds
    const idx = Math.floor(Date.now() / intervalMs) % rotationPool.length;
    return rotationPool[idx].text;
  }

  const fixed = config.taglines.find((t) => t.id === config.activeTaglineId);
  return fixed?.text ?? active[0].text;
}
