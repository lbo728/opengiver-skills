---
description: Add a comment to a Linear issue
argument-hint: [issue-identifier] [comment]
allowed-tools: Bash(curl:*), Bash(source:*), Bash(cat:*)
---

# Add Comment to Issue

Add comment to: $ARGUMENTS

## Steps

1. Parse issue identifier and comment text from arguments

2. Get issue UUID:
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"IDENTIFIER\"){id}}"}'
```

3. Add comment:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"ISSUE_UUID\",body:\"COMMENT_TEXT\"}){comment{id body url}}}"}'
```

Confirm comment was added.
