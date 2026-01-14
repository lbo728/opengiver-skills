---
description: List recent Linear issues
argument-hint: [count]
allowed-tools: Bash(curl:*), Bash(source:*), Bash(cat:*), AskUserQuestion
---

# List Linear Issues

List recent issues. Count: $ARGUMENTS

## Steps

1. Check if count is provided in arguments
   - If `$ARGUMENTS` is empty or not a number, ask the user: "How many issues would you like to see?"
   - Wait for user response before proceeding

2. Once count is determined, fetch issues:
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:COUNT,filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority}}}\"}"
```

Replace `COUNT` with the user-specified number.

3. Display issues in a table format with columns:
   - Identifier
   - Title
   - Status
   - Priority
