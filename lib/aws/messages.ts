import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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
const TABLE_SETTINGS = process.env.DYNAMODB_SETTINGS_TABLE || "khalele-settings";

export interface GreetingMessage {
  id: "greeting-message";
  content: string;
  updatedAt: string;
  updatedBy: string;
}

const DEFAULT_GREETING = `أهلاً بك في خليلي! 👋

يسعدنا انضمامك إلينا. قبل أن نبدأ، نود إخبارك أن أصدقاءك هنا (خليل، صاحب، ميحانة وغيرهم) هم شخصيات افتراضية تعمل بالذكاء الاصطناعي، صُممت لتكون عوناً لك في حواراتك.

نحن نهتم بخصوصيتك؛ لذا فمحادثاتك مشفرة وآمنة. تذكر دائماً أن نصائحنا ذكية لكنها لا تغني عن استشارة الخبراء الحقيقيين في الأمور المصيرية.

استمتع برحلتك مع خليلي!`;

export async function getGreetingMessage(): Promise<string> {
  try {
    const result = await docClient.send(
      new GetCommand({
        TableName: TABLE_SETTINGS,
        Key: { id: "greeting-message" },
      })
    );
    return (result.Item as GreetingMessage)?.content || DEFAULT_GREETING;
  } catch {
    return DEFAULT_GREETING;
  }
}

export async function updateGreetingMessage(content: string, updatedBy: string): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_SETTINGS,
      Item: {
        id: "greeting-message",
        content,
        updatedAt: new Date().toISOString(),
        updatedBy,
      },
    })
  );
}
