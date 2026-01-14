---
description: Create a new Linear issue
argument-hint: [title]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Create Linear Issue

Create new issue with title: $ARGUMENTS

## Step 1: Load Config (Hierarchical)

```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# Fallback to user config
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
```

If no config found, prompt: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)

## Step 2: Check Title Parameter

If `$ARGUMENTS` is empty:
- Use AskUserQuestion: "What title and description should I use for the issue?"
- Wait for user response before proceeding

## Step 3: Extract Values

```bash
# API key from user config
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Team/Project from project config or user config fallback
if [ -n "$PROJECT_CONFIG" ]; then
  TEAM_ID=$(echo $PROJECT_CONFIG | grep -o '"team_id":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=$(echo $PROJECT_CONFIG | grep -o '"project_id":"[^"]*"' | cut -d'"' -f4)
else
  TEAM_ID=$(echo $USER_CONFIG | grep -o '"default_team_id":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=""
fi
```

## Step 4: Create Issue

**If project_id is set** (assign to specific project):
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"TITLE\\\" teamId:\\\"$TEAM_ID\\\" projectId:\\\"$PROJECT_ID\\\" description:\\\"DESCRIPTION\\\" priority:3}){issue{id identifier title url project{name}}}}\"}"
```

**If no project_id**:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"TITLE\\\" teamId:\\\"$TEAM_ID\\\" description:\\\"DESCRIPTION\\\" priority:3}){issue{id identifier title url}}}\"}"
```

Priority values: 0=none, 1=urgent, 2=high, 3=medium, 4=low

## Step 5: Confirm

Show the created issue:
- Identifier
- Title
- Project (if assigned)
- URL
