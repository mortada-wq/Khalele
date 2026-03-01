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
- `khalele-conversations` — see below

App works without DynamoDB; corrections stored in-memory as fallback.

#### khalele-conversations (chat archive)

Full conversation persistence for the chat archive. Create manually or via IaC.

**Table name:** `khalele-conversations`  
**Environment variable:** `DYNAMODB_CONVERSATIONS_TABLE` (default: `khalele-conversations`)

**Key schema:**
| Attribute       | Type   | Key   |
|----------------|--------|-------|
| conversationId | String | PK    |

**Attributes:**
| Attribute   | Type   | Description                    |
|-------------|--------|--------------------------------|
| conversationId | String | Primary key (UUID)           |
| userId      | String | User ID (e.g. `anon_<uuid>` until Cognito) |
| title       | String | Conversation title            |
| messages    | List   | Array of `{ id, role, content }` |
| updatedAt   | String | ISO 8601 timestamp            |
| createdAt   | String | ISO 8601 timestamp            |

**GSI (required for listing by user):**

| Name                    | Partition Key | Sort Key   | Projection |
|-------------------------|---------------|------------|------------|
| userId-updatedAt-index  | userId (S)    | updatedAt (S) | ALL     |

**AWS CLI creation example:**
```bash
aws dynamodb create-table \
  --table-name khalele-conversations \
  --attribute-definitions \
    AttributeName=conversationId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
    AttributeName=updatedAt,AttributeType=S \
  --key-schema AttributeName=conversationId,KeyType=HASH \
  --global-secondary-indexes '[
    {
      "IndexName": "userId-updatedAt-index",
      "KeySchema": [
        {"AttributeName": "userId", "KeyType": "HASH"},
        {"AttributeName": "updatedAt", "KeyType": "RANGE"}
      ],
      "Projection": {"ProjectionType": "ALL"}
    }
  ]' \
  --billing-mode PAY_PER_REQUEST
```

**IAM:** Add `dynamodb:PutItem` to the policy (already included in the minimal policy above).
