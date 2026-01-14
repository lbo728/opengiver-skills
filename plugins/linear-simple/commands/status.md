---
description: Update issue status (e.g., In Progress, Done)
argument-hint: [issue-identifier] [status]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Update Issue Status

Update status for: $ARGUMENTS

## Step 1: Load Config (Hierarchical)

```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# Fallback to user config
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
```

If no config found, prompt: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)

## Step 2: Parse Arguments

Parse issue identifier and target status from arguments.
- If status not provided, ask user which status to set

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

## Step 5: Get Target State UUID

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"TARGET_STATUS\"}}){nodes{id name}}}"}'
```

## Step 6: Update Issue

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"ISSUE_UUID\",input:{stateId:\"STATE_UUID\"}){issue{id identifier state{name}}}}"}'
```

## Step 7: Confirm

Confirm the status change to user:
- Issue identifier
- New status
