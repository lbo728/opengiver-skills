---
description: List recent Linear issues
argument-hint: [count]
allowed-tools: Bash(curl:*), Bash(source:*), Bash(cat:*)
---

# List Linear Issues

List recent issues. Count: $ARGUMENTS (default: 10)

```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title state{name} priority}}}\"}"
```

Display issues in a table format.
