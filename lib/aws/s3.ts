import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
});

const BUCKET = process.env.S3_TRAINING_BUCKET || "kheleel-training-data";
export const S3_BUCKET = BUCKET;

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

export async function getObjectAsBuffer(bucket: string, key: string): Promise<{ body: Buffer; contentType?: string }> {
  const result = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  const chunks: Uint8Array[] = [];
  if (result.Body) {
    for await (const chunk of result.Body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk);
    }
  }
  return {
    body: Buffer.concat(chunks),
    contentType: result.ContentType ?? undefined,
  };
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
