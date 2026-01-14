---
description: Create a new Linear issue
argument-hint: [title]
allowed-tools: Bash(curl:*), Bash(cat:*), AskUserQuestion
---

# Create Linear Issue

Create new issue with title: $ARGUMENTS

## Steps

1. Check if title is provided
   - If `$ARGUMENTS` is empty, ask the user: "What title and description should I use for the issue?"
   - Wait for user response before proceeding

2. Read config:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
TEAM_ID=$(echo $CONFIG | grep -o '"teamId":"[^"]*"' | cut -d'"' -f4)
```

3. Create the issue:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"TITLE\\\" teamId:\\\"$TEAM_ID\\\" description:\\\"DESCRIPTION\\\" priority:3}){issue{id identifier title url}}}\"}"
```

If user provides description or priority, include them in the mutation.

Priority values: 0=none, 1=urgent, 2=high, 3=medium, 4=low

4. Show the created issue URL to user.
