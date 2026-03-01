import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET = process.env.S3_TRAINING_BUCKET || "khalele-training-data";

export async function uploadTrainingData(key: string, content: string): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: content,
      ContentType: "application/jsonl",
    })
  );
  return `s3://${BUCKET}/${key}`;
}

export async function getTrainingData(key: string): Promise<string> {
  const result = await client.send(
    new GetObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
  return (await result.Body?.transformToString()) ?? "";
}

export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string
): Promise<string> {
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  return `s3://${BUCKET}/${key}`;
}
