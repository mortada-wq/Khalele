# Kheleel AWS Infrastructure

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
- `kheleel-training-data` — training data, transcriptions
- Enable CORS if needed for uploads

### 4. DynamoDB Tables (optional for Phase 1)
- `kheleel-users` — PK: userId
- `kheleel-corrections` — PK: id, GSI: userId-createdAt-index. For few-shot gold examples, add optional attributes: `inputPrompt`, `languageStyle`, `verdict`. Approved corrections with these fields are injected into LLM prompts.
- `kheleel-conversations` — see below

App works without DynamoDB; corrections stored in-memory as fallback. Add `dynamodb:Scan` to IAM for gold example retrieval.

#### kheleel-conversations (chat archive)

Full conversation persistence for the chat archive. Create manually or via IaC.

**Table name:** `kheleel-conversations`  
**Environment variable:** `DYNAMODB_CONVERSATIONS_TABLE` (default: `kheleel-conversations`)

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
  --table-name kheleel-conversations \
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

#### kheleel-training-sessions (Phase 3: training data collection)

Volunteer-contributed training sessions for dialect improvement.

**Table name:** `kheleel-training-sessions`  
**Environment variable:** `DYNAMODB_TRAINING_TABLE` (default: `kheleel-training-sessions`)

**Key schema:**
| Attribute  | Type   | Key |
|------------|--------|-----|
| sessionId  | String | PK  |

**Attributes:**
| Attribute   | Type   | Description                          |
|-------------|--------|--------------------------------------|
| sessionId   | String | Primary key (e.g. `ts-<timestamp>-<id>`) |
| userId      | String | User ID (anon_ or incognito)          |
| nativeSpeaker | Boolean | Whether participant is native speaker |
| dialect     | String | Optional dialect (e.g. بغدادي)       |
| region      | String | Optional region                       |
| gender      | String | Optional (male/female)                |
| audioFiles  | List   | S3 URIs of recorded audio            |
| transcripts | List   | User-provided or auto transcripts    |
| status      | String | pending | approved | rejected          |
| metadata    | Map    | Optional (e.g. prompts)               |
| createdAt   | String | ISO 8601                              |
| updatedAt   | String | ISO 8601                              |

**AWS CLI creation example:**
```bash
aws dynamodb create-table \
  --table-name kheleel-training-sessions \
  --attribute-definitions AttributeName=sessionId,AttributeType=S \
  --key-schema AttributeName=sessionId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```
