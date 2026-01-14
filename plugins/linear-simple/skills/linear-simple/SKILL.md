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

## Setup Command

When user says `/linear setup` or needs to configure Linear:

1. Ask user for their Linear API key (get from Linear Settings > API)
2. Save to config and fetch team info automatically:

```bash
# Create config directory
mkdir -p ~/.config/linear-simple

# Save API key (replace with user's key)
echo 'export LINEAR_API_KEY="lin_api_xxxxx"' > ~/.config/linear-simple/config

# Fetch and save team info
source ~/.config/linear-simple/config
TEAM_DATA=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}')

# Extract team info (use jq or parse JSON)
TEAM_ID=$(echo $TEAM_DATA | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
TEAM_KEY=$(echo $TEAM_DATA | grep -o '"key":"[^"]*"' | head -1 | cut -d'"' -f4)

echo "export LINEAR_TEAM_ID=\"$TEAM_ID\"" >> ~/.config/linear-simple/config
echo "export LINEAR_TEAM_KEY=\"$TEAM_KEY\"" >> ~/.config/linear-simple/config

# Fetch and save workflow states
STATES=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}')

# Parse states and save (extract each state ID)
# Example: LINEAR_STATE_TODO="uuid", LINEAR_STATE_IN_PROGRESS="uuid", etc.
```

3. Confirm setup is complete and show team info to user

## Config Location

`~/.config/linear-simple/config`

Load before any API call:
```bash
source ~/.config/linear-simple/config
```

## API Endpoint

`https://api.linear.app/graphql`

## Quick Reference

### Get Issue (by identifier)
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issue(id:\\\"${LINEAR_TEAM_KEY}-125\\\"){id identifier title description state{name} priority url}}\"}"
```

### List Issues
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority}}}\"}"
```

### Create Issue
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$LINEAR_TEAM_ID\\\" description:\\\"Description\\\" priority:3}){issue{id identifier title url}}}\"}"
```

Priority: 0=none, 1=urgent, 2=high, 3=medium, 4=low

### Update Issue Status
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{stateId:\"state-uuid\"}){issue{id identifier state{name}}}}"}'
```

### Add Comment
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"issue-uuid\",body:\"Comment content\"}){comment{id body}}}"}'
```

### Delete Issue
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueDelete(id:\"issue-uuid\"){success}}"}'
```

## Get Workflow States

To find state IDs for status changes:
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}'
```

Common state types: `backlog`, `unstarted`, `started`, `completed`, `canceled`

## Workflow Examples

### 1. Get Issue and Update Status
```bash
source ~/.config/linear-simple/config

# 1. Get issue to obtain ID
ISSUE=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"BYU-125\"){id}}"}')

# 2. Get "In Progress" state ID
STATES=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Progress\"}}){nodes{id}}}"}')

# 3. Update status
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-id\",input:{stateId:\"state-id\"}){issue{state{name}}}}"}'
```

### 2. Update Issue After PR Merge
```bash
source ~/.config/linear-simple/config

# Add comment
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"issue-uuid\",body:\"PR merged: https://github.com/...\"}){comment{id}}}"}'

# Get "Done" state ID and update
DONE_STATE=$(curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"Done\"}}){nodes{id}}}"}')

curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{stateId:\"done-state-id\"}){issue{state{name}}}}"}'
```

## Error Handling

- **401**: Check API key - run `/linear setup` again
- **400**: GraphQL query syntax error
- **429**: Rate limit, retry later
- **Config not found**: Run `/linear setup` first

## Advanced Queries

See [references/graphql-patterns.md](references/graphql-patterns.md) for detailed query patterns.
