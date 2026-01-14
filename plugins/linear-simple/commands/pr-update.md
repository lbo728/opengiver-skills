---
description: Create PR and update Linear issue (add comment + change status to In Review)
allowed-tools: Bash(curl:*), Bash(cat:*), Bash(git:*), Bash(gh:*), AskUserQuestion
---

# PR Update - Combined Action

Create a PR and update the associated Linear issue with comment and status change.

## Step 1: Load Config (Hierarchical)

```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# Fallback to user config
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
```

If no config found, prompt: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)

## Step 2: Identify Linear Issue

Check current branch name for issue identifier:
```bash
git branch --show-current
```

Expected format: `feature/BYU-125-some-feature` or `fix/BYU-125-bug-fix`

If no issue identifier found in branch name:
- Use AskUserQuestion: "Which Linear issue should I update?"

## Step 3: Create PR

```bash
# Push if not already pushed
git push -u origin $(git branch --show-current)

# Create PR
gh pr create --title "PR_TITLE" --body "PR_BODY"
```

Capture the PR URL from the output.

## Step 4: Extract API Key

```bash
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)
```

## Step 5: Get Issue UUID

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"ISSUE_IDENTIFIER\"){id}}"}'
```

## Step 6: Add PR Link as Comment

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"ISSUE_UUID\",body:\"🔗 PR created: PR_URL\\n\\nPR_SUMMARY\"}){comment{id url}}}"}'
```

## Step 7: Get "In Review" State UUID

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Review\"}}){nodes{id name}}}"}'
```

## Step 8: Update Issue Status to "In Review"

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"ISSUE_UUID\",input:{stateId:\"IN_REVIEW_STATE_UUID\"}){issue{identifier state{name}}}}"}'
```

## Step 9: Confirm

Show summary:
- ✓ PR created: [PR_URL]
- ✓ Comment added to [ISSUE_IDENTIFIER]
- ✓ Status changed to "In Review"
