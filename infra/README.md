# Khalele AWS Infrastructure

## Manual Setup (Phase 1)

### 1. Amazon Bedrock
- Enable Bedrock in AWS Console (us-east-1)
- Request model access: Claude 3 Haiku, Claude 3 Sonnet
- Note your model ID for `.env.local`

### 2. IAM Policy (minimal)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "transcribe:*",
        "polly:SynthesizeSpeech",
        "s3:PutObject",
        "s3:GetObject",
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query"
      ],
      "Resource": "*"
    }
  ]
}
```

### 3. S3 Buckets
- `khalele-training-data` — training data, transcriptions
- Enable CORS if needed for uploads

### 4. DynamoDB Tables (optional for Phase 1)
- `khalele-users` — PK: userId
- `khalele-corrections` — PK: id, GSI: userId-createdAt-index
- `khalele-conversations` — PK: conversationId

App works without DynamoDB; corrections stored in-memory as fallback.
