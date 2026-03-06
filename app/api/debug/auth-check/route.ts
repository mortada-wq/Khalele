import { NextResponse } from "next/server";
import { DynamoDBClient, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

export async function GET() {
  const results: Record<string, unknown> = {
    env: {
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION || "us-east-1",
      nextauthSecret: !!process.env.NEXTAUTH_SECRET,
      nextauthUrl: process.env.NEXTAUTH_URL || "(not set)",
    },
  };

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

  const table = process.env.DYNAMODB_USERS_TABLE || "khalele-users";
  try {
    const desc = await client.send(new DescribeTableCommand({ TableName: table }));
    results.dynamodb = {
      status: "connected",
      table,
      tableStatus: desc.Table?.TableStatus,
      itemCount: desc.Table?.ItemCount,
    };
  } catch (err) {
    results.dynamodb = {
      status: "error",
      table,
      error: err instanceof Error ? err.message : String(err),
      name: err instanceof Error ? err.name : "unknown",
    };
  }

  return NextResponse.json(results);
}
