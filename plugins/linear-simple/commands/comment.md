---
description: Add a comment to a Linear issue
argument-hint: [issue-identifier] [comment]
allowed-tools: Bash(curl:*), Bash(cat:*)
---

# Add Comment to Issue

Add comment to: $ARGUMENTS

## Steps

1. Parse issue identifier and comment text from arguments
   - If issue identifier not provided, check conversation context for current working issue

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

4. Add comment:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"ISSUE_UUID\",body:\"COMMENT_TEXT\"}){comment{id body url}}}"}'
```

5. Confirm comment was added and show the comment URL.
