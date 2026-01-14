---
description: Configure Linear API key and project settings
allowed-tools: Bash(curl:*), Bash(mkdir:*), Bash(cat:*), Write, Read, AskUserQuestion
---

# Linear Simple Setup

Set up Linear API configuration.

## Step 1: Check User Config (API Key)

Check if API key exists:
```bash
cat ~/.config/linear-simple/config.json 2>/dev/null
```

If no API key configured:
1. Ask user for their Linear API key (from Linear Settings > API)
2. Create user config directory and save:
```bash
mkdir -p ~/.config/linear-simple
```
3. Use Write tool to create `~/.config/linear-simple/config.json`:
```json
{
  "api_key": "USER_API_KEY"
}
```

## Step 2: Fetch Available Teams

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'
```

## Step 3: Check Project Config

Check if project config exists:
```bash
cat .claude/linear-simple.json 2>/dev/null
```

If project config doesn't exist, use **AskUserQuestion** with these options:
- Question: "Set up Linear team/project for this workspace?"
- Options:
  - **Yes** - "Configure team and project for this workspace"
  - **No** - "Use default settings from user config"

### If Yes:
1. Show available teams from Step 2
2. Ask which team to use
3. Fetch projects for selected team:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{projects(filter:{accessibleTeams:{id:{eq:\"TEAM_ID\"}}}){nodes{id name}}}"}'
```
4. Ask which project to use (or "All projects")
5. Create `.claude` directory if needed:
```bash
mkdir -p .claude
```
6. Use Write tool to create `.claude/linear-simple.json`:
```json
{
  "team_id": "TEAM_UUID",
  "team_key": "TEAM_KEY",
  "team_name": "TEAM_NAME",
  "project_id": "PROJECT_UUID_OR_NULL",
  "project_name": "PROJECT_NAME_OR_NULL"
}
```
7. Add to `.gitignore`:
```bash
echo ".claude/linear-simple.json" >> .gitignore
```

### If No:
1. If user config has no default team, save the first team as default:
```json
{
  "api_key": "...",
  "default_team_id": "TEAM_UUID",
  "default_team_key": "TEAM_KEY",
  "default_team_name": "TEAM_NAME"
}
```
2. Inform user that default team will be used

## Step 4: Confirmation Message

After setup complete, show:
```
✓ API key: configured
✓ Workspace config: .claude/linear-simple.json (added to .gitignore)

Available workflow states: [list states]

To share settings with your team, remove ".claude/linear-simple.json" from .gitignore.
You can view and edit settings at:
- User config: ~/.config/linear-simple/config.json
- Project config: .claude/linear-simple.json
```

Now begin setup by checking if API key exists.
