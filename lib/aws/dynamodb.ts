import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_USERS = process.env.DYNAMODB_USERS_TABLE || "khalele-users";
const TABLE_CORRECTIONS = process.env.DYNAMODB_CORRECTIONS_TABLE || "khalele-corrections";
const TABLE_CONVERSATIONS = process.env.DYNAMODB_CONVERSATIONS_TABLE || "khalele-conversations";

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

export { TABLE_USERS, TABLE_CORRECTIONS, TABLE_CONVERSATIONS };
