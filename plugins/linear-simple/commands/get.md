---
description: Get a Linear issue by identifier (e.g., BYU-125)
argument-hint: [issue-identifier]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Get Linear Issue

Fetch issue details for: $ARGUMENTS

## Step 1: Load Config (Hierarchical)

```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# Fallback to user config
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
```

**Config loading priority:**
1. `.claude/linear-simple.json` (project config) - for team_id, team_key, project_id
2. `~/.config/linear-simple/config.json` (user config) - for api_key, default_team

If no config found at all, prompt user:
- "Linear 설정이 없습니다. 지금 설정할까요?" with Yes/No options via AskUserQuestion
- If Yes → guide to run `/linear-simple:setup`
- If No → abort

## Step 2: Extract Values

```bash
# API key is always from user config
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Team info: project config first, then user config fallback
if [ -n "$PROJECT_CONFIG" ]; then
  TEAM_KEY=$(echo $PROJECT_CONFIG | grep -o '"team_key":"[^"]*"' | cut -d'"' -f4)
else
  TEAM_KEY=$(echo $USER_CONFIG | grep -o '"default_team_key":"[^"]*"' | cut -d'"' -f4)
fi
```

## Step 3: Fetch Issue

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"$ARGUMENTS\"){id identifier title description state{name} priority url assignee{name} project{name} createdAt updatedAt}}"}'
```

## Step 4: Display

Parse and display the issue information in a readable format, including:
- Identifier, Title
- Status, Priority
- Project (if any)
- Assignee
- Description
- URL
