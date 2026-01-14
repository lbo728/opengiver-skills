---
description: Update issue status (e.g., In Progress, Done)
argument-hint: [issue-identifier] [status]
allowed-tools: Bash(curl:*), Bash(cat:*)
---

# Update Issue Status

Update status for: $ARGUMENTS

## Steps

1. Parse issue identifier and target status from arguments

2. Read config:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
```

3. Get issue UUID:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"IDENTIFIER\"){id}}"}'
```

4. Get target state UUID:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"TARGET_STATUS\"}}){nodes{id name}}}"}'
```

5. Update issue:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"ISSUE_UUID\",input:{stateId:\"STATE_UUID\"}){issue{id identifier state{name}}}}"}'
```

6. Confirm the status change to user.
