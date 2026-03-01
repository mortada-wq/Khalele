import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_USERS = process.env.DYNAMODB_USERS_TABLE || "khalele-users";
const TABLE_CORRECTIONS = process.env.DYNAMODB_CORRECTIONS_TABLE || "khalele-corrections";
const TABLE_CONVERSATIONS = process.env.DYNAMODB_CONVERSATIONS_TABLE || "khalele-conversations";
const TABLE_TRAINING = process.env.DYNAMODB_TRAINING_TABLE || "khalele-training-sessions";

export interface UserProfile {
  userId: string;
  preferences: {
    dialectRegion?: "baghdad" | "basra" | "mosul";
    languageStyle?: "formal_msa" | "easy_arabic";
  };
  createdAt: string;
  updatedAt: string;
}

export interface Correction {
  id: string;
  userId: string;
  originalResponse: string;
  correctedResponse: string;
  correctionType: "dialect_authenticity" | "grammar" | "cultural_context" | "factual";
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
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_USERS,
      Key: { userId },
    })
  );
  return (result.Item as UserProfile) ?? null;
}

export async function putUserProfile(profile: UserProfile): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_USERS,
      Item: profile,
    })
  );
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
}

export async function saveConversationSummary(summary: ConversationSummary): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_CONVERSATIONS,
      Item: summary,
    })
  );
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

export { TABLE_USERS, TABLE_CORRECTIONS, TABLE_CONVERSATIONS, TABLE_TRAINING };
