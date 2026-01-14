---
description: Get a Linear issue by identifier (e.g., BYU-125)
argument-hint: [issue-identifier]
allowed-tools: Bash(curl:*), Bash(source:*), Bash(cat:*)
---

# Get Linear Issue

Fetch issue details for: $ARGUMENTS

```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"$ARGUMENTS\"){id identifier title description state{name} priority url assignee{name} createdAt updatedAt}}"}'
```

Parse and display the issue information in a readable format.
