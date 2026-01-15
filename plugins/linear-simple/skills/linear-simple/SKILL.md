---
name: linear-simple
description: |
  Direct Linear GraphQL API calls without MCP. Performs issue CRUD via curl.
  Use when: (1) Creating/reading/updating/deleting Linear issues, (2) Adding comments,
  (3) XXX-NNN format identifier mentioned (e.g., BYU-125, TEAM-42),
  (4) "linear" keyword included, (5) User says "/linear setup" to configure API key and team,
  (6) User mentions "이슈" (issue) in Korean - e.g., "이슈 확인해봐", "이슈를 읽어봐", "이 이슈", "해당 이슈"
  Trigger examples: "Get BYU-125", "Create issue", "Change status to Done", "/linear setup",
  "이슈 확인해봐", "이 이슈를 읽어봐", "이슈 조회", "이슈 생성해줘"
---

# Linear Simple Skill

Direct Linear GraphQL API calls with hierarchical config.

## ⚠️ Ambiguous Issue Request Handling (MUST FOLLOW)

When user says generic issue-related phrases like:
- "이슈 확인해봐", "이 이슈를 읽어봐", "이슈 조회해줘"
- "Check this issue", "Read the issue", "Look at this issue"

**WITHOUT** specifying an issue identifier (e.g., BYU-125) or GitHub URL:

### You MUST ask to clarify the issue type:

```
어떤 이슈를 확인할까요?

1. **Linear 이슈** - 이슈 식별자를 알려주세요 (예: BYU-125, TEAM-42)
2. **GitHub 이슈** - 이슈 URL을 알려주세요 (예: https://github.com/owner/repo/issues/1)

또는 현재 저장소의 GitHub 이슈 번호만 알려주셔도 됩니다 (예: #123)
```

### Detection Rules:
- **Linear issue**: `XXX-NNN` format (e.g., BYU-125, PROJ-42) → Proceed with Linear API
- **GitHub issue**: URL containing `github.com/.../issues/` or `#N` format → Use `gh issue view` command
- **Ambiguous**: No identifier provided → **MUST ASK** before proceeding

---

## ⚠️ Session Context: Issue Number Memory

When you work with a Linear issue in this session (via get, create, comment, status, or pr-update):
- **REMEMBER** the issue identifier (e.g., `BYU-125`) for the rest of the session
- If user says "이 이슈에", "해당 이슈", "linear issue에", "이슈에 코멘트", etc. without specifying the identifier:
  - Use the **most recently worked issue** from this session
  - If no issue was worked on yet, ask user for the identifier

**Example flow:**
1. User: "BYU-125 조회해줘" → You get BYU-125, remember it
2. User: "이 이슈에 코멘트 추가해" → Use BYU-125 (no need to ask)
3. User: "상태를 In Progress로 변경해" → Use BYU-125 (no need to ask)

---

## ⚠️ CRITICAL: Config Check Flow (MUST FOLLOW)

Before ANY Linear operation, you MUST:

### Step 1: Check Configs
```bash
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)
```

### Step 2: Validate API Key
If `USER_CONFIG` is empty or has no `api_key`:
- Tell user: "Linear API 키가 설정되지 않았습니다. `/linear-simple:setup`을 실행해주세요."
- **STOP** - Do not proceed

### Step 3: Check Project Config (MANDATORY!)

**If `PROJECT_CONFIG` is empty (`.claude/linear-simple.json` does not exist):**

You **MUST** use **AskUserQuestion** tool to ask:
```
Question: "이 워크스페이스에 Linear 팀/프로젝트 설정이 없습니다. 지금 설정할까요?"
Options:
  - Yes: "워크스페이스별 설정을 생성합니다"
  - No: "기본 팀 설정으로 진행합니다"
```

**DO NOT SKIP THIS STEP. DO NOT PROCEED WITHOUT ASKING.**

- **If user selects Yes:** Tell them to run `/linear-simple:setup` → **STOP**
- **If user selects No:** Check if `USER_CONFIG` has `default_team_key`
  - If no default team → Tell user to run `/linear-simple:setup` → **STOP**
  - If default team exists → Continue with user config

## Config Structure

### User Config (`~/.config/linear-simple/config.json`)
```json
{
  "api_key": "lin_api_xxxxx",
  "default_team_id": "uuid",
  "default_team_key": "BYU",
  "default_team_name": "Team Name"
}
```

### Project Config (`.claude/linear-simple.json`)
```json
{
  "team_id": "uuid",
  "team_key": "BYU",
  "team_name": "Team Name",
  "project_id": "uuid",
  "project_name": "Project Name"
}
```

### Config Loading
```bash
# API key always from user config
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Team info: project config first, user config fallback
if [ -n "$PROJECT_CONFIG" ]; then
  TEAM_ID=$(echo $PROJECT_CONFIG | grep -o '"team_id":"[^"]*"' | cut -d'"' -f4)
  TEAM_KEY=$(echo $PROJECT_CONFIG | grep -o '"team_key":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=$(echo $PROJECT_CONFIG | grep -o '"project_id":"[^"]*"' | cut -d'"' -f4)
else
  TEAM_ID=$(echo $USER_CONFIG | grep -o '"default_team_id":"[^"]*"' | cut -d'"' -f4)
  TEAM_KEY=$(echo $USER_CONFIG | grep -o '"default_team_key":"[^"]*"' | cut -d'"' -f4)
  PROJECT_ID=""
fi
```

## API Endpoint

`https://api.linear.app/graphql`

## Operations

### Get Issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"BYU-125\"){id identifier title description state{name} priority url project{name}}}"}'
```

### List Issues
```bash
# With project filter (if project_id set)
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}},project:{id:{eq:\\\"$PROJECT_ID\\\"}}}){nodes{id identifier title state{name}}}}\"}"

# Without project filter
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}}}){nodes{id identifier title state{name}}}}\"}"
```

### Create Issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$TEAM_ID\\\" description:\\\"Desc\\\" priority:3}){issue{id identifier url}}}\"}"
```

### Update Status
```bash
# Get state UUID first
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Progress\"}}){nodes{id}}}"}'

# Update
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{stateId:\"state-uuid\"}){issue{state{name}}}}"}'
```

### Add Comment
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"issue-uuid\",body:\"Comment\"}){comment{id url}}}"}'
```

## Fetch Teams/Projects

```bash
# Teams
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'

# Projects for team
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{projects(filter:{accessibleTeams:{id:{eq:\"TEAM_ID\"}}}){nodes{id name}}}"}'
```

## Error Handling

- **401**: Invalid API key → `/linear-simple:setup`
- **Config not found**: → `/linear-simple:setup`

## GitHub Issue Handling

When user specifies a GitHub issue (URL or `#N` format), use `gh` CLI:

### Get GitHub Issue
```bash
# By URL
gh issue view https://github.com/owner/repo/issues/123

# By number (current repo)
gh issue view 123

# With JSON output for parsing
gh issue view 123 --json title,body,state,labels,assignees,url
```

### List GitHub Issues
```bash
# List open issues
gh issue list

# List with limit
gh issue list --limit 10

# List with state filter
gh issue list --state all
```

**Note**: GitHub issue handling is a convenience feature. For full GitHub workflow, consider dedicated GitHub tools.
