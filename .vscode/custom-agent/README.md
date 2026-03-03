# Fast Custom Claude Agent

Lightning-fast Claude integration for VSCode using AWS Bedrock.

## Features

✅ Direct AWS Bedrock API calls (no bloated extensions)
✅ Smart caching (5min TTL) for instant repeated queries
✅ Intelligent context handling (auto-truncates large files)
✅ VSCode keybindings for instant access
✅ Optimized for speed

## Setup

1. **Install dependencies:**
```bash
cd .vscode/custom-agent
npm install
```

2. **Configure AWS credentials** (if not already done):
```bash
aws configure
```

3. **Test it:**
```bash
node cli.js "Hello Claude"
```

## Usage

### Command Line

```bash
# Ask without context
node cli.js "What is React?"

# Ask with file context
node cli.js "Explain this code" ../../components/GreetingModal.tsx

# Bypass cache
node cli.js "Latest info" --no-cache
```

### VSCode Keybindings

- **Ctrl+Shift+C**: Ask Claude about current file
- **Ctrl+Shift+Alt+C**: Ask Claude without context

### VSCode Tasks

1. Press **Ctrl+Shift+P**
2. Type "Run Task"
3. Select "Ask Claude (Current File)" or "Ask Claude (No Context)"

## Performance

- **First query**: ~1-2 seconds (API call)
- **Cached query**: ~50ms (instant!)
- **Large files**: Auto-truncated to 500 lines for speed

## Cache Management

Cache automatically:
- Expires after 5 minutes
- Keeps max 50 entries
- Clears oldest entries when full

## Troubleshooting

**Error: "Bedrock API Error"**
- Check AWS credentials: `aws sts get-caller-identity`
- Verify Bedrock model access in AWS Console

**Slow responses?**
- First query is always slower (API call)
- Subsequent identical queries use cache
- Check your AWS region (us-east-1 is fastest)

## Customization

Edit `agent.js` to:
- Change cache TTL (default: 5 minutes)
- Adjust max tokens (default: 4096)
- Modify temperature (default: 0.7)
- Change model version
