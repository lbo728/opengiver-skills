---
description: Open config.json in editor for direct editing
allowed-tools: Read, AskUserQuestion
---

# Open Config File

**Command**: `/blog-material-gen:config`

**Purpose**: Open the config.json file in your editor for direct editing.

**Prerequisites**:
- Configuration file exists at `~/.config/blog-material-gen/config.json`

**Workflow**:
1. Check if config file exists
2. Read current config
3. Show current config to user
4. Ask if user wants to open in editor
5. If yes, open the file

---

## Step 1: Check Config File

Check if config file exists:

```bash
ls ~/.config/blog-material-gen/config.json
```

### If config.json doesn't exist:
- Show message: "❌ Config file not found. Please run `/blog-material-gen:setup` first."
- Exit command

### If config exists:
- Proceed to Step 2

---

## Step 2: Read Current Config

Use Read tool to load `~/.config/blog-material-gen/config.json`.

Parse and display current configuration:

```
📝 Current Configuration:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Notion:
  ✓ API Key: secret_xxx...
  ✓ Database ID: abc123...
  ✓ Database Name: {name}

Slack:
  {✓ or ✗} Webhook URL: {url or "Not configured"}

LLM:
  {✓ or ✗} Provider: {provider or "Not configured"}
  {✓ or ✗} Model: {model}
  {✓ or ✗} API Key: {api_key first 10 chars}...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Config Location: ~/.config/blog-material-gen/config.json
```

---

## Step 3: Ask User

Use **AskUserQuestion**:
- Question: "Do you want to open config.json in editor for direct editing?"
- Options:
  - **Yes** - "Open in editor"
  - **No** - "Cancel"

### If Yes:
- Show message:
```
Opening config file in editor...

📝 Config file location:
~/.config/blog-material-gen/config.json

💡 Tips:
- Available providers: "openai", "anthropic", "google"
- After editing, save the file
- Changes take effect on next run

⚠️  Important:
- Ensure valid JSON format
- Required fields: api_key, database_id
- LLM config is optional
```

- Open file: `~/.config/blog-material-gen/config.json`

### If No:
- Exit command

---

## Config Schema Reference

### Minimal Config (Notion only)
```json
{
  "api_key": "secret_xxx",
  "database_id": "abc123"
}
```

### Full Config (All features)
```json
{
  "api_key": "secret_xxx",
  "database_id": "abc123",
  "database_name": "Blog Ideas",
  "slack_webhook_url": "https://hooks.slack.com/services/...",
  "llm": {
    "provider": "google",
    "api_key": "AIza...",
    "model": "gemini-1.5-flash"
  }
}
```

### LLM Providers

**OpenAI**:
```json
"llm": {
  "provider": "openai",
  "api_key": "sk-...",
  "model": "gpt-4o-mini"
}
```

**Anthropic**:
```json
"llm": {
  "provider": "anthropic",
  "api_key": "sk-ant-...",
  "model": "claude-3-5-haiku-20241022"
}
```

**Google Gemini** (Recommended - Free tier):
```json
"llm": {
  "provider": "google",
  "api_key": "AIza...",
  "model": "gemini-1.5-flash"
}
```

---

## Tips

1. **Backup before editing**: Copy config.json before making changes
2. **JSON Validation**: Ensure valid JSON syntax (use jsonlint.com)
3. **API Keys**: Get keys from provider websites:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys
   - Google: https://aistudio.google.com/app/apikey
4. **Test after editing**: Run `/blog-material-gen` to verify changes

---

## Troubleshooting

### Invalid JSON
- Error message will show syntax error location
- Use online JSON validator to fix
- Restore from backup if needed

### Missing Required Fields
- `api_key` and `database_id` are required
- Other fields are optional
