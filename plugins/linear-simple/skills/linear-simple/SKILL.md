---
name: linear-simple
description: |
  Direct Linear GraphQL API calls without MCP. Performs issue CRUD via curl.
  Use when: (1) Creating/reading/updating/deleting Linear issues, (2) Adding comments,
  (3) XXX-NNN format identifier mentioned, (4) "linear" keyword included,
  (5) User says "/linear setup" to configure API key and team.
  Trigger examples: "Get BYU-125", "Create issue", "Change status to Done", "/linear setup"
---

# Linear Simple Skill

Direct Linear GraphQL API call guide with hierarchical config support.

## Config Structure (Hierarchical)

### User Config (`~/.config/linear-simple/config.json`)
```json
{
  "api_key": "lin_api_xxxxx",
  "default_team_id": "uuid",
  "default_team_key": "BYU",
  "default_team_name": "Team Name"
}
```
- API key is required (organization-level)
- Default team is optional (fallback when no project config)

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
- Team/project settings specific to this workspace
- Added to `.gitignore` by default
- Can be shared with team by removing from `.gitignore`

### Config Loading Priority
1. `.claude/linear-simple.json` (project config) - for team_id, team_key, project_id
2. `~/.config/linear-simple/config.json` (user config) - for api_key, default_team (fallback)

### Load Config Pattern
```bash
# Try project config first
PROJECT_CONFIG=$(cat .claude/linear-simple.json 2>/dev/null)

# User config (always needed for API key)
USER_CONFIG=$(cat ~/.config/linear-simple/config.json 2>/dev/null)

# Extract API key (always from user config)
API_KEY=$(echo $USER_CONFIG | grep -o '"api_key":"[^"]*"' | cut -d'"' -f4)

# Extract team info (project config first, then fallback)
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

## Setup Flow

### First-time Setup (no API key)
1. Ask user for Linear API key (from Linear Settings > API)
2. Save to `~/.config/linear-simple/config.json`
3. Fetch available teams
4. Ask: "Set up Linear team/project for this workspace?" (Yes/No via AskUserQuestion)
   - Yes → Select team/project → Save to `.claude/linear-simple.json` → Add to `.gitignore`
   - No → Save first team as default in user config

### Existing Setup (API key exists, no project config)
When user runs a Linear command without project config:
1. Check if default_team exists in user config → Use it
2. If no default_team → Ask: "Linear 설정이 없습니다. 지금 설정할까요?" (Yes/No)
   - Yes → Trigger project setup
   - No → Abort with message to run `/linear-simple:setup`

## API Endpoint

`https://api.linear.app/graphql`

## Quick Reference

### Get Issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"BYU-125\"){id identifier title description state{name} priority url project{name}}}"}'
```

### List Issues (with project filter if set)
```bash
# With project_id (efficient)
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}},project:{id:{eq:\\\"$PROJECT_ID\\\"}}}){nodes{id identifier title state{name}}}}\"}"

# Without project_id (all team issues)
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}}}){nodes{id identifier title state{name}}}}\"}"
```

### Create Issue (with project if set)
```bash
# With project_id
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$TEAM_ID\\\" projectId:\\\"$PROJECT_ID\\\" description:\\\"Desc\\\" priority:3}){issue{id identifier url}}}\"}"

# Without project_id
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$TEAM_ID\\\" description:\\\"Desc\\\" priority:3}){issue{id identifier url}}}\"}"
```

Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low

### Update Issue Status
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

## Workflow: PR + Comment + Status Update

When user says "Create PR and update Linear issue":

1. Get issue identifier from branch name (e.g., `feature/BYU-125-xxx`)
2. Create PR with `gh pr create`
3. Add PR URL as comment to Linear issue
4. Update issue status to "In Review"

## Fetch Available Teams/Projects

```bash
# Teams
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'

# Projects for a team
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{projects(filter:{accessibleTeams:{id:{eq:\"TEAM_ID\"}}}){nodes{id name}}}"}'

# Workflow states
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}'
```

## Error Handling

- **401**: Invalid API key - run `/linear-simple:setup`
- **400**: GraphQL syntax error
- **429**: Rate limit
- **Config not found**: Run `/linear-simple:setup`

## Advanced Queries

See [references/graphql-patterns.md](references/graphql-patterns.md) for detailed patterns.
