---
description: Add a comment to a Linear issue
argument-hint: [issue-identifier] [comment]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Add Comment to Issue

Add comment to: $ARGUMENTS

## Step 1: Load Config (Hierarchical)

```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# Fallback to user config
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
```

If no config found, prompt: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)

## Step 2: Parse Arguments

Parse issue identifier and comment text from arguments.
- If issue identifier not provided, check conversation context for current working issue (e.g., from branch name like `feature/BYU-125-xxx`)
- If comment text not provided, ask user what to comment

## Step 3: Extract API Key

```bash
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
```

## Step 4: Get Issue UUID

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"IDENTIFIER\"){id}}"}'
```

## Step 5: Add Comment

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"ISSUE_UUID\",body:\"COMMENT_TEXT\"}){comment{id body url}}}"}'
```

## Step 6: Confirm

Confirm comment was added:
- Issue identifier
- Comment preview
- Comment URL
