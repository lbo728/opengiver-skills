---
description: List recent Linear issues
argument-hint: [count]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# List Linear Issues

List recent issues. Count: $ARGUMENTS

## Steps

1. Check if count is provided in arguments
   - If `$ARGUMENTS` is empty or not a number, ask the user: "How many issues would you like to see?"
   - Wait for user response before proceeding

2. Read config:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
TEAM_KEY=$(echo $CONFIG | grep -o '"teamKey":"[^"]*"' | cut -d'"' -f4)
```

3. Once count is determined, fetch issues:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:COUNT,filter:{team:{key:{eq:\\\"$TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority}}}\"}"
```

Replace `COUNT` with the user-specified number.

4. Display issues in a table format with columns:
   - Identifier
   - Title
   - Status
   - Priority
