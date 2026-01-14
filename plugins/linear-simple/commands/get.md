---
description: Get a Linear issue by identifier (e.g., BYU-125)
argument-hint: [issue-identifier]
allowed-tools: Bash(curl:*), Bash(cat:*)
---

# Get Linear Issue

Fetch issue details for: $ARGUMENTS

## Steps

1. Read config:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
```

2. Fetch issue:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"$ARGUMENTS\"){id identifier title description state{name} priority url assignee{name} createdAt updatedAt}}"}'
```

3. Parse and display the issue information in a readable format.
