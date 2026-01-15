---
description: Get a Linear issue by identifier (e.g., BYU-125)
argument-hint: [issue-identifier]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Get Linear Issue

Fetch issue details for: $ARGUMENTS

## Step 1: Check Configs

```bash
# Check user config (API key)
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)

# Check project config
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)
```

## Step 2: Validate API Key

If `USER_CONFIG` is empty or doesn't contain `api_key`:
- Tell user: "Linear API 키가 설정되지 않았습니다. `/linear-simple:setup`을 실행해주세요."
- **STOP HERE** - do not proceed

## Step 3: Check Project Config (IMPORTANT!)

**If `PROJECT_CONFIG` is empty (file doesn't exist):**

You MUST use **AskUserQuestion** to ask:
- Question: "이 워크스페이스에 Linear 팀/프로젝트 설정이 없습니다. 지금 설정할까요?"
- Options:
  - **Yes** - "워크스페이스별 설정을 생성합니다"
  - **No** - "기본 팀 설정으로 진행합니다"

**If user selects Yes:**
- Tell user to run `/linear-simple:setup` first
- **STOP HERE**

**If user selects No:**
- Check if `USER_CONFIG` has `default_team_key`
- If no default team, tell user to run `/linear-simple:setup`
- **STOP HERE**

## Step 4: Check Issue Identifier Parameter

If `$ARGUMENTS` is empty or doesn't contain a valid issue identifier (e.g., `XXX-123` format):
- Use AskUserQuestion: "어떤 이슈를 조회할까요? (예: BYU-125)"
- Wait for response before proceeding

## Step 5: Extract Values

Only proceed here if config is valid:

```bash
# API key from user config
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Team info: project config first, then user config fallback
if [ -n "$PROJECT_CONFIG" ]; then
  TEAM_KEY=$(echo $PROJECT_CONFIG | grep -o '"team_key":"[^"]*"' | cut -d'"' -f4)
else
  TEAM_KEY=$(echo $USER_CONFIG | grep -o '"default_team_key":"[^"]*"' | cut -d'"' -f4)
fi
```

## Step 6: Fetch Issue

```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"$ARGUMENTS\"){id identifier title description state{name} priority url assignee{name} project{name} createdAt updatedAt}}"}'
```

## Step 7: Display

Parse and display the issue information in a readable format.

## Step 8: Suggest Status Change (Post-Read Workflow)

After displaying the issue, check if the status is eligible for change:

**Skip this step if:**
- Issue status is already "In Progress", "In Review", "Done", or "Canceled"

**Otherwise, use AskUserQuestion:**
- Question: "해당 이슈를 지금 진행하실건가요?"
- Options:
  - **Yes** - "상태를 'In Progress'로 변경합니다"
  - **No** - "현재 상태를 유지합니다"

**If user selects Yes:**
1. Get the "In Progress" state UUID:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Progress\"}}){nodes{id name}}}"}'
```

2. Update the issue status:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"ISSUE_UUID\",input:{stateId:\"STATE_UUID\"}){issue{identifier state{name}}}}"}'
```

3. Confirm: "✅ [ISSUE_ID] 상태가 'In Progress'로 변경되었습니다."

**If user selects No:**
- Do nothing, proceed normally.
