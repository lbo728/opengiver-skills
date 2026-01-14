---
description: List recent Linear issues
argument-hint: [count]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# List Linear Issues

List recent issues. Count: $ARGUMENTS

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

If no config found, prompt: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)

## Step 2: Check Count Parameter

If `$ARGUMENTS` is empty or not a number:
- Use AskUserQuestion: "How many issues would you like to see?"
- Options: "5", "10", "20", "50"

## Step 3: Extract Values

```bash
# API key from user config
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Team/Project from project config or user config fallback
if [ -n "$PROJECT_CONFIG" ]; then
  TEAM_KEY=$(echo $PROJECT_CONFIG | grep -o '"team_key":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=$(echo $PROJECT_CONFIG | grep -o '"project_id":"[^"]*"' | cut -d'"' -f4)
else
  TEAM_KEY=$(echo $USER_CONFIG | grep -o '"default_team_key":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=""
fi
```

## Step 4: Fetch Issues

**If project_id is set** (filter by project for efficiency):
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:COUNT,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}},project:{id:{eq:\\\"$PROJECT_ID\\\"}}}){nodes{id identifier title state{name} priority project{name}}}}\"}"
```

**If no project_id** (all issues in team):
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:COUNT,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority project{name}}}}\"}"
```

Replace `COUNT` with the user-specified number.

## Step 5: Display

Display issues in a table format with columns:
- Identifier
- Title
- Status
- Priority
- Project (if showing all)
