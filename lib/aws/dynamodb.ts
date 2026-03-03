import {
  DynamoDBClient,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_USERS = process.env.DYNAMODB_USERS_TABLE || "khalele-users";
const TABLE_CORRECTIONS = process.env.DYNAMODB_CORRECTIONS_TABLE || "khalele-corrections";
const TABLE_CONVERSATIONS = process.env.DYNAMODB_CONVERSATIONS_TABLE || "khalele-conversations";
const TABLE_TRAINING = process.env.DYNAMODB_TRAINING_TABLE || "khalele-training-sessions";
const inMemoryProfiles = new Map<string, UserProfile>();
const inMemoryAuthUsers = new Map<string, AuthUser>();

export interface AuthUser {
  email: string;
  name: string;
  passwordHash: string;
  authProvider: "credentials";
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  preferences: {
    dialectRegion?: "baghdad" | "basra" | "mosul";
    languageStyle?: "formal_msa" | "easy_arabic";
    nickname?: string;
  };
  nicknameSuggestion?: {
    value: string;
    generatedAt: string;
    status: "pending" | "accepted" | "rejected";
  };
  nicknameFeedback?: {
    nickname: string;
    reason: string;
    action: "rejected_suggestion" | "deleted_active";
    createdAt: string;
  }[];
  behaviorSnapshot?: {
    totalMessages: number;
    avgCharsPerMessage: number;
    questionRatio: number;
    lateNightRatio: number;
  };
  createdAt: string;
  updatedAt: string;
}

function isMissingTableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("ResourceNotFoundException") ||
    msg.includes("Cannot do operations on a non-existent table") ||
    msg.includes("Requested resource not found")
  );
}

export interface Correction {
  id: string;
  userId: string;
  originalResponse: string;
  correctedResponse: string;
  correctionType: "dialect_authenticity" | "grammar" | "cultural_context" | "factual" | "positive" | "negative" | string;
  region?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  userId: string;
  summary: string;
  lastMessageAt: string;
}

export interface ConversationRecord {
  conversationId: string;
  userId: string;
  title: string;
  messages: { id: string; role: "user" | "assistant"; content: string }[];
  characterId?: string;
  factCheckMode?: "off" | "notify" | "notify_with_reason";
  updatedAt: string;
  createdAt: string;
}

export async function saveConversation(conversation: ConversationRecord): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_CONVERSATIONS,
      Item: conversation,
    })
  );
}

export async function getConversation(conversationId: string): Promise<ConversationRecord | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_CONVERSATIONS,
      Key: { conversationId },
    })
  );
  return (result.Item as ConversationRecord) ?? null;
}

export async function listConversationsByUser(
  userId: string,
  limit = 50
): Promise<ConversationRecord[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_CONVERSATIONS,
        IndexName: "userId-updatedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        Limit: limit,
        ScanIndexForward: false,
      })
    );
    return (result.Items as ConversationRecord[]) ?? [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("specified index") || msg.includes("ValidationException")) {
      // GSI not created — fall back to Scan with filter
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_CONVERSATIONS,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
          Limit: limit,
        })
      );
      const items = (result.Items as ConversationRecord[]) ?? [];
      return items.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)).slice(0, limit);
    }
    throw err;
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_USERS,
        Key: { userId },
      })
    );
    return (result.Item as UserProfile) ?? inMemoryProfiles.get(userId) ?? null;
  } catch (error) {
    if (isMissingTableError(error)) {
      return inMemoryProfiles.get(userId) ?? null;
    }
    throw error;
  }
}

export async function putUserProfile(profile: UserProfile): Promise<void> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_USERS,
        Item: profile,
      })
    );
  } catch (error) {
    if (!isMissingTableError(error)) {
      throw error;
    }
  }
  inMemoryProfiles.set(profile.userId, profile);
}

const inMemoryCorrections: Correction[] = [];

export async function saveCorrection(correction: Correction): Promise<void> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_CORRECTIONS,
        Item: correction,
      })
    );
  } catch {
    inMemoryCorrections.push(correction);
  }
}

export function getInMemoryCorrections(): Correction[] {
  return [...inMemoryCorrections];
}

export async function getCorrectionsByUser(userId: string, limit = 50): Promise<Correction[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_CORRECTIONS,
        IndexName: "userId-createdAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        Limit: limit,
        ScanIndexForward: false,
      })
    );
    return (result.Items as Correction[]) ?? [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("specified index") || msg.includes("ValidationException")) {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_CORRECTIONS,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
          Limit: limit,
        })
      );
      const items = (result.Items as Correction[]) ?? [];
      return items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1)).slice(0, limit);
    }
    throw err;
  }
}

export interface TrainingSession {
  sessionId: string;
  userId: string;
  nativeSpeaker: boolean;
  dialect?: string;
  region?: string;
  gender?: string;
  audioFiles: string[];
  transcripts: string[];
  status: "pending" | "approved" | "rejected";
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export async function saveTrainingSession(session: TrainingSession): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_TRAINING,
      Item: session,
    })
  );
}

export async function getTrainingSession(sessionId: string): Promise<TrainingSession | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_TRAINING,
      Key: { sessionId },
    })
  );
  return (result.Item as TrainingSession) ?? null;
}

export async function listTrainingSessions(status?: "pending" | "approved" | "rejected"): Promise<TrainingSession[]> {
  const result = status
    ? await docClient.send(
        new ScanCommand({
          TableName: TABLE_TRAINING,
          FilterExpression: "#s = :status",
          ExpressionAttributeNames: { "#s": "status" },
          ExpressionAttributeValues: { ":status": status },
        })
      )
    : await docClient.send(
        new ScanCommand({
          TableName: TABLE_TRAINING,
        })
      );
  const items = (result.Items as TrainingSession[]) ?? [];
  return items.sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
}

export async function updateTrainingSessionStatus(
  sessionId: string,
  status: "approved" | "rejected"
): Promise<TrainingSession | null> {
  const session = await getTrainingSession(sessionId);
  if (!session) return null;
  const updated = { ...session, status, updatedAt: new Date().toISOString() };
  await saveTrainingSession(updated);
  return updated;
}

export async function getAuthUserByEmail(email: string): Promise<AuthUser | null> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_USERS,
        Key: { userId: `auth#${normalizedEmail}` },
      })
    );
    if (result.Item) return result.Item as AuthUser;
    return inMemoryAuthUsers.get(normalizedEmail) ?? null;
  } catch (error) {
    if (isMissingTableError(error)) {
      return inMemoryAuthUsers.get(normalizedEmail) ?? null;
    }
    throw error;
  }
}

export async function createAuthUser(user: AuthUser): Promise<void> {
  const normalizedEmail = user.email.toLowerCase().trim();
  const item = { ...user, userId: `auth#${normalizedEmail}`, email: normalizedEmail };
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_USERS,
        Item: item,
        ConditionExpression: "attribute_not_exists(userId)",
      })
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes("ConditionalCheckFailedException")) {
      throw new Error("EMAIL_EXISTS");
    }
    if (isMissingTableError(error)) {
      if (inMemoryAuthUsers.has(normalizedEmail)) {
        throw new Error("EMAIL_EXISTS");
      }
      inMemoryAuthUsers.set(normalizedEmail, { ...user, email: normalizedEmail });
      return;
    }
    throw error;
  }
}
