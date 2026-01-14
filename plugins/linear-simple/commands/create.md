---
description: Create a new Linear issue
argument-hint: [title]
allowed-tools: Bash(curl:*), Bash(source:*), Bash(cat:*)
---

# Create Linear Issue

Create new issue with title: $ARGUMENTS

```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"$ARGUMENTS\\\" teamId:\\\"$LINEAR_TEAM_ID\\\" priority:3}){issue{id identifier title url}}}\"}"
```

If user provides description or priority, include them in the mutation.

Priority values: 0=none, 1=urgent, 2=high, 3=medium, 4=low

Show the created issue URL to user.
