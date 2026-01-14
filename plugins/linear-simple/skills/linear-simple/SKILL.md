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

Direct Linear GraphQL API call guide.

## Config Location

`~/.config/linear-simple/config.json`

```json
{
  "apiKey": "lin_api_xxxxx",
  "teamId": "uuid",
  "teamKey": "BYU",
  "teamName": "Team Name"
}
```

Read config before any API call:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
TEAM_ID=$(echo $CONFIG | grep -o '"teamId":"[^"]*"' | cut -d'"' -f4)
TEAM_KEY=$(echo $CONFIG | grep -o '"teamKey":"[^"]*"' | cut -d'"' -f4)
```

## Setup Command

When user says `/linear setup` or needs to configure Linear:

1. Ask user for their Linear API key (get from Linear Settings > API)
2. Create config directory: `mkdir -p ~/.config/linear-simple`
3. Fetch team info:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'
```
4. Save as JSON to `~/.config/linear-simple/config.json`
5. Tell user: "Settings saved to `~/.config/linear-simple/config.json`. You can view and edit your configuration there."

## API Endpoint

`https://api.linear.app/graphql`

## Quick Reference

### Get Issue (by identifier)
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issue(id:\\\"BYU-125\\\"){id identifier title description state{name} priority url}}\"}"
```

### List Issues
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority}}}\"}"
```

### Create Issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$TEAM_ID\\\" description:\\\"Description\\\" priority:3}){issue{id identifier title url}}}\"}"
```

Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low

### Update Issue Status
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{stateId:\"state-uuid\"}){issue{id identifier state{name}}}}"}'
```

### Add Comment
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"issue-uuid\",body:\"Comment content\"}){comment{id body}}}"}'
```

### Delete Issue
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueDelete(id:\"issue-uuid\"){success}}"}'
```

## Get Workflow States

To find state IDs for status changes:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}'
```

Common state types: `backlog`, `unstarted`, `started`, `completed`, `canceled`

## Workflow Examples

### 1. Get Issue and Update Status
```bash
# 1. Get issue to obtain ID
ISSUE=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"BYU-125\"){id}}"}')

# 2. Get "In Progress" state ID
STATES=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Progress\"}}){nodes{id}}}"}')

# 3. Update status
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-id\",input:{stateId:\"state-id\"}){issue{state{name}}}}"}'
```

### 2. PR + Comment + Status Update (Combined)

When user says "Create PR and update Linear issue":

1. Identify issue from branch name or context (e.g., `feature/BYU-125-feature-name`)
2. Create PR using `gh pr create`
3. Add PR URL as comment to Linear issue
4. Update issue status to "In Review"

```bash
# Add comment with PR link
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"issue-uuid\",body:\"PR created: https://github.com/...\"}){comment{id}}}"}'

# Get "In Review" state ID and update
IN_REVIEW_STATE=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Review\"}}){nodes{id}}}"}')

curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{stateId:\"in-review-state-id\"}){issue{state{name}}}}"}'
```

## Error Handling

- **401**: Check API key - run `/linear setup` again
- **400**: GraphQL query syntax error
- **429**: Rate limit, retry later
- **Config not found**: Run `/linear setup` first

## Advanced Queries

See [references/graphql-patterns.md](references/graphql-patterns.md) for detailed query patterns.
