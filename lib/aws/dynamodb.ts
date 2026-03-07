import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

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

const TABLE_USERS = process.env.DYNAMODB_USERS_TABLE || "kheleel-users";
const TABLE_CORRECTIONS = process.env.DYNAMODB_CORRECTIONS_TABLE || "kheleel-corrections";
const TABLE_CONVERSATIONS = process.env.DYNAMODB_CONVERSATIONS_TABLE || "kheleel-conversations";
const TABLE_TRAINING = process.env.DYNAMODB_TRAINING_TABLE || "kheleel-training-sessions";
const TABLE_NOTEBOOKS = process.env.DYNAMODB_NOTEBOOKS_TABLE || "kheleel-notebooks";
const TABLE_STUDIES = process.env.DYNAMODB_STUDIES_TABLE || "kheleel-studies";
const TABLE_SETTINGS = process.env.DYNAMODB_SETTINGS_TABLE || "kheleel-settings";
const TABLE_INVITES = process.env.DYNAMODB_INVITES_TABLE || "kheleel-invites";
const inMemoryProfiles = new Map<string, UserProfile>();
const inMemoryAuthUsers = new Map<string, AuthUser>();

export interface AuthUser {
  email: string;
  name: string;
  passwordHash: string;
  authProvider: "credentials";
  createdAt: string;
  hasReceivedGreeting?: boolean;
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
  const name = error instanceof Error ? error.name : "";
  return (
    msg.includes("ResourceNotFoundException") ||
    msg.includes("Cannot do operations on a non-existent table") ||
    msg.includes("Requested resource not found") ||
    name === "ResourceNotFoundException"
  );
}

function isCredentialError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";
  return (
    name === "CredentialsProviderError" ||
    name === "UnrecognizedClientException" ||
    msg.includes("Could not load credentials") ||
    msg.includes("UnrecognizedClientException") ||
    msg.includes("InvalidClientTokenId") ||
    msg.includes("InvalidSignatureException") ||
    msg.includes("ECONNREFUSED") ||
    msg.includes("ENOTFOUND") ||
    msg.includes("getaddrinfo")
  );
}

let _usersTableEnsured = false;

async function ensureUsersTable(): Promise<void> {
  if (_usersTableEnsured) return;
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_USERS }));
    _usersTableEnsured = true;
  } catch (err) {
    if (!isMissingTableError(err)) return; // credential error or other — skip
    try {
      await client.send(new CreateTableCommand({
        TableName: TABLE_USERS,
        AttributeDefinitions: [{ AttributeName: "userId", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "userId", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      }));
      // Wait up to 15s for table to become active
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const desc = await client.send(new DescribeTableCommand({ TableName: TABLE_USERS }));
          if (desc.Table?.TableStatus === "ACTIVE") break;
        } catch { /* still creating */ }
      }
      _usersTableEnsured = true;
    } catch (createErr) {
      console.error("Failed to auto-create users table:", createErr);
    }
  }
}

export type GoldVerdict = "perfect" | "needs_tweak" | "wrong_level";

export interface Correction {
  id: string;
  userId: string;
  originalResponse: string;
  correctedResponse: string;
  correctionType: "dialect_authenticity" | "grammar" | "cultural_context" | "factual" | "positive" | "negative" | "needs_tweak" | string;
  region?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  /** User prompt that triggered the AI response (for few-shot gold examples) */
  inputPrompt?: string;
  /** Target language style for this correction */
  languageStyle?: "easy_arabic" | "formal_msa";
  /** Volunteer verdict: perfect, needs_tweak, or wrong_level */
  verdict?: GoldVerdict;
  /** Optional message ID for traceability */
  messageId?: string;
}

/** Gold example for few-shot injection: input -> output pair */
export interface GoldExample {
  inputPrompt: string;
  correctedResponse: string;
  languageStyle: "easy_arabic" | "formal_msa";
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

/** Hardcoded gold examples used when DB has none (immediate "aha" moment) */
const HARDCODED_GOLD_EXAMPLES: GoldExample[] = [
  // Easy Arabic
  { inputPrompt: "شلونك اليوم؟", correctedResponse: "أنا بخير الحمد لله، شكراً لسؤالك. وأنت كيف حالك؟", languageStyle: "easy_arabic" },
  { inputPrompt: "وين أقدر أروح أتعلم عربي؟", correctedResponse: "تقدر تتعلم العربية من تطبيقات مثل خليل، أو من قنوات على يوتيوب. المهم تمارس كل يوم ولو قليلاً.", languageStyle: "easy_arabic" },
  { inputPrompt: "Explain quantum physics in simple Arabic", correctedResponse: "ميكانيكا الكم تدرس أصغر الأشياء في الكون. الفكرة الأساسية: الجزيئات تتصرف أحياناً كجسيمات وأحياناً كأمواج. هذا غريب لكنه صحيح.", languageStyle: "easy_arabic" },
  { inputPrompt: "كيف أقول مرحبا بالإنجليزية؟", correctedResponse: "تقول \"Hello\" أو \"Hi\". للرسمية أكثر: \"Good morning\" أو \"Good afternoon\".", languageStyle: "easy_arabic" },
  { inputPrompt: "شو يعني كلمة ماشي؟", correctedResponse: "\"ماشي\" تعني موافق أو حسناً. يستخدمها الناس في مصر والعراق وبلاد الشام.", languageStyle: "easy_arabic" },
  // Formal MSA
  { inputPrompt: "ما رأيكم في التطور التكنولوجي؟", correctedResponse: "التطور التكنولوجي يُمثّل نقلة نوعية في حياة البشر. له إيجابيات كثيرة كتسهيل التواصل، كما أن له تحديات تتطلب وعياً وحكمة في الاستخدام.", languageStyle: "formal_msa" },
  { inputPrompt: "كيف أقدم نفسي في مقابلة عمل؟", correctedResponse: "ابدأ بالتحية والسلام، ثم قدّم اسمك وتخصصك بإيجاز. اذكر خبراتك ذات الصلة بوضوح، واظهر الثقة دون غرور.", languageStyle: "formal_msa" },
  { inputPrompt: "ما الفرق بين الفصحى والعامية؟", correctedResponse: "الفصحى لغة الكتابة والخطاب الرسمي، موحّدة في العالم العربي. العامية تختلف باختلاف المنطقة، وتُستخدم في الحياة اليومية.", languageStyle: "formal_msa" },
];

export async function listApprovedGoldExamples(
  languageStyle: "easy_arabic" | "formal_msa",
  limit = 5
): Promise<GoldExample[]> {
  try {
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_CORRECTIONS,
        FilterExpression: "#s = :status AND #ls = :style AND attribute_exists(inputPrompt)",
        ExpressionAttributeNames: { "#s": "status", "#ls": "languageStyle" },
        ExpressionAttributeValues: { ":status": "approved", ":style": languageStyle },
        Limit: 100,
      })
    );
    const items = (result.Items as Correction[]) ?? [];
    const gold: GoldExample[] = items
      .filter((c) => c.inputPrompt && c.correctedResponse)
      .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
      .slice(0, limit)
      .map((c) => ({
        inputPrompt: c.inputPrompt!,
        correctedResponse: c.correctedResponse,
        languageStyle: c.languageStyle!,
      }));
    if (gold.length > 0) return gold;
  } catch {
    // Fall through to hardcoded
  }
  return HARDCODED_GOLD_EXAMPLES.filter((e) => e.languageStyle === languageStyle).slice(0, limit);
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
    await ensureUsersTable();
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_USERS,
        Key: { userId: `auth#${normalizedEmail}` },
      })
    );
    if (result.Item) return result.Item as AuthUser;
    return inMemoryAuthUsers.get(normalizedEmail) ?? null;
  } catch (error) {
    if (isMissingTableError(error) || isCredentialError(error)) {
      return inMemoryAuthUsers.get(normalizedEmail) ?? null;
    }
    throw error;
  }
}

export async function createAuthUser(user: AuthUser): Promise<void> {
  const normalizedEmail = user.email.toLowerCase().trim();
  const item = { ...user, userId: `auth#${normalizedEmail}`, email: normalizedEmail };
  try {
    await ensureUsersTable();
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
    if (isMissingTableError(error) || isCredentialError(error)) {
      if (inMemoryAuthUsers.has(normalizedEmail)) {
        throw new Error("EMAIL_EXISTS");
      }
      inMemoryAuthUsers.set(normalizedEmail, { ...user, email: normalizedEmail });
      return;
    }
    throw error;
  }
}

export async function updateAuthUser(email: string, updates: Partial<AuthUser>): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  const existing = await getAuthUserByEmail(normalizedEmail);
  if (!existing) throw new Error("USER_NOT_FOUND");
  
  const updated = { ...existing, ...updates };
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_USERS,
        Item: { ...updated, userId: `auth#${normalizedEmail}` },
      })
    );
  } catch (error) {
    if (isMissingTableError(error) || isCredentialError(error)) {
      inMemoryAuthUsers.set(normalizedEmail, updated);
      return;
    }
    throw error;
  }
}

// ─── Settings Management ─────────────────────────────────────────────────

export interface AppSettings {
  settingId: string;
  greetingMessage: string;
  updatedAt: string;
}

const DEFAULT_GREETING = `أهلاً بك في خليل! 👋

يسعدنا انضمامك إلينا. قبل أن نبدأ، نود إخبارك أن أصدقاءك هنا (خليل، صاحب، ميحانة وغيرهم) هم شخصيات افتراضية تعمل بالذكاء الاصطناعي، صُممت لتكون عوناً لك في حواراتك.

نحن نهتم بخصوصيتك؛ لذا فمحادثاتك مشفرة وآمنة. تذكر دائماً أن نصائحنا ذكية لكنها لا تغني عن استشارة الخبراء الحقيقيين في الأمور المصيرية.

استمتع برحلتك مع خليل!`;

let inMemorySettings: AppSettings = {
  settingId: "app-settings",
  greetingMessage: DEFAULT_GREETING,
  updatedAt: new Date().toISOString(),
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_SETTINGS,
        Key: { settingId: "app-settings" },
      })
    );
    if (result.Item) return result.Item as AppSettings;
    return inMemorySettings;
  } catch (error) {
    if (isMissingTableError(error)) {
      return inMemorySettings;
    }
    throw error;
  }
}

export async function updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getAppSettings();
  const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
  
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_SETTINGS,
        Item: updated,
      })
    );
  } catch (error) {
    if (isMissingTableError(error)) {
      inMemorySettings = updated;
      return;
    }
    throw error;
  }
}

// ─── Notebooks (دفاتر) ─────────────────────────────────────────────────────

const MAX_NOTEBOOK_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

export interface NotebookRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export async function saveNotebook(notebook: NotebookRecord): Promise<void> {
  const contentBytes = new TextEncoder().encode(notebook.content).length;
  if (contentBytes > MAX_NOTEBOOK_SIZE_BYTES) {
    throw new Error("NOTEBOOK_TOO_LARGE");
  }
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NOTEBOOKS,
        Item: notebook,
      })
    );
  } catch (err) {
    if (!isMissingTableError(err)) throw err;
    // Fallback: in-memory if table missing
    inMemoryNotebooks.set(notebook.id, notebook);
  }
}

const inMemoryNotebooks = new Map<string, NotebookRecord>();

export async function getNotebook(notebookId: string): Promise<NotebookRecord | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_NOTEBOOKS,
        Key: { id: notebookId },
      })
    );
    return (result.Item as NotebookRecord) ?? inMemoryNotebooks.get(notebookId) ?? null;
  } catch (err) {
    if (isMissingTableError(err)) return inMemoryNotebooks.get(notebookId) ?? null;
    throw err;
  }
}

export async function listNotebooksByUser(userId: string, limit = 50): Promise<NotebookRecord[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_NOTEBOOKS,
        IndexName: "userId-updatedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        Limit: limit,
        ScanIndexForward: false,
      })
    );
    const items = (result.Items as NotebookRecord[]) ?? [];
    return items;
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("specified index") || msg.includes("ValidationException")) {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_NOTEBOOKS,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
          Limit: limit,
        })
      );
      const items = (result.Items as NotebookRecord[]) ?? [];
      return items.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)).slice(0, limit);
    }
    if (isMissingTableError(err)) {
      return Array.from(inMemoryNotebooks.values())
        .filter((n) => n.userId === userId)
        .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
        .slice(0, limit);
    }
    throw err;
  }
}

export async function deleteNotebook(notebookId: string): Promise<void> {
  try {
    await docClient.send(
      new DeleteCommand({
        TableName: TABLE_NOTEBOOKS,
        Key: { id: notebookId },
      })
    );
  } catch {
    // Ignore if table missing
  }
  inMemoryNotebooks.delete(notebookId);
}

// ─── Studies (قضايا) ─────────────────────────────────────────────────────

export interface StudyRecord {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const inMemoryStudies = new Map<string, StudyRecord>();

export async function saveStudy(study: StudyRecord): Promise<void> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_STUDIES,
        Item: study,
      })
    );
  } catch (err) {
    if (!isMissingTableError(err)) throw err;
    inMemoryStudies.set(study.id, study);
  }
}

export async function getStudy(studyId: string): Promise<StudyRecord | null> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_STUDIES,
        Key: { id: studyId },
      })
    );
    return (result.Item as StudyRecord) ?? inMemoryStudies.get(studyId) ?? null;
  } catch (err) {
    if (isMissingTableError(err)) return inMemoryStudies.get(studyId) ?? null;
    throw err;
  }
}

export async function listStudiesByUser(userId: string, limit = 50): Promise<StudyRecord[]> {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: TABLE_STUDIES,
        IndexName: "userId-updatedAt-index",
        KeyConditionExpression: "userId = :uid",
        ExpressionAttributeValues: { ":uid": userId },
        Limit: limit,
        ScanIndexForward: false,
      })
    );
    return (result.Items as StudyRecord[]) ?? [];
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("specified index") || msg.includes("ValidationException")) {
      const result = await docClient.send(
        new ScanCommand({
          TableName: TABLE_STUDIES,
          FilterExpression: "userId = :uid",
          ExpressionAttributeValues: { ":uid": userId },
          Limit: limit,
        })
      );
      const items = (result.Items as StudyRecord[]) ?? [];
      return items.sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1)).slice(0, limit);
    }
    if (isMissingTableError(err)) {
      return Array.from(inMemoryStudies.values())
        .filter((s) => s.userId === userId)
        .sort((a, b) => (b.updatedAt > a.updatedAt ? 1 : -1))
        .slice(0, limit);
    }
    throw err;
  }
}

// ─── Invites (الدعوات) ────────────────────────────────────────────────────

export interface InviteRecord {
  token: string;
  inviterEmail: string;
  inviterName: string;
  inviteeEmail: string;
  status: "pending" | "accepted";
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string;
}

const inMemoryInvites = new Map<string, InviteRecord>();

let _invitesTableEnsured = false;

async function ensureInvitesTable(): Promise<void> {
  if (_invitesTableEnsured) return;
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_INVITES }));
    _invitesTableEnsured = true;
  } catch (err) {
    if (!isMissingTableError(err)) return;
    try {
      await client.send(new CreateTableCommand({
        TableName: TABLE_INVITES,
        AttributeDefinitions: [{ AttributeName: "token", AttributeType: "S" }],
        KeySchema: [{ AttributeName: "token", KeyType: "HASH" }],
        BillingMode: "PAY_PER_REQUEST",
      }));
      for (let i = 0; i < 15; i++) {
        await new Promise((r) => setTimeout(r, 1000));
        try {
          const desc = await client.send(new DescribeTableCommand({ TableName: TABLE_INVITES }));
          if (desc.Table?.TableStatus === "ACTIVE") break;
        } catch { /* still creating */ }
      }
      _invitesTableEnsured = true;
    } catch (createErr) {
      console.error("Failed to auto-create invites table:", createErr);
    }
  }
}

export async function createInvite(data: Omit<InviteRecord, "createdAt" | "expiresAt" | "status">): Promise<InviteRecord> {
  const now = new Date();
  const invite: InviteRecord = {
    ...data,
    status: "pending",
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
  try {
    await ensureInvitesTable();
    await docClient.send(new PutCommand({ TableName: TABLE_INVITES, Item: invite }));
  } catch (err) {
    if (isMissingTableError(err) || isCredentialError(err)) {
      inMemoryInvites.set(invite.token, invite);
      return invite;
    }
    throw err;
  }
  return invite;
}

export async function getInviteByToken(token: string): Promise<InviteRecord | null> {
  try {
    await ensureInvitesTable();
    const result = await docClient.send(new GetCommand({ TableName: TABLE_INVITES, Key: { token } }));
    return (result.Item as InviteRecord) ?? inMemoryInvites.get(token) ?? null;
  } catch (err) {
    if (isMissingTableError(err) || isCredentialError(err)) {
      return inMemoryInvites.get(token) ?? null;
    }
    throw err;
  }
}

export async function markInviteAccepted(token: string): Promise<void> {
  const invite = await getInviteByToken(token);
  if (!invite) return;
  const updated: InviteRecord = { ...invite, status: "accepted", acceptedAt: new Date().toISOString() };
  try {
    await docClient.send(new PutCommand({ TableName: TABLE_INVITES, Item: updated }));
  } catch (err) {
    if (isMissingTableError(err) || isCredentialError(err)) {
      inMemoryInvites.set(token, updated);
      return;
    }
    throw err;
  }
  inMemoryInvites.set(token, updated);
}

export async function getPendingInviteByInviteeEmail(email: string): Promise<InviteRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    await ensureInvitesTable();
    const result = await docClient.send(
      new ScanCommand({
        TableName: TABLE_INVITES,
        FilterExpression: "inviteeEmail = :e AND #s = :s",
        ExpressionAttributeNames: { "#s": "status" },
        ExpressionAttributeValues: { ":e": normalizedEmail, ":s": "pending" },
        Limit: 1,
      })
    );
    const items = (result.Items as InviteRecord[]) ?? [];
    return items[0] ?? null;
  } catch (err) {
    if (isMissingTableError(err) || isCredentialError(err)) {
      for (const invite of inMemoryInvites.values()) {
        if (invite.inviteeEmail === normalizedEmail && invite.status === "pending") return invite;
      }
      return null;
    }
    throw err;
  }
}
