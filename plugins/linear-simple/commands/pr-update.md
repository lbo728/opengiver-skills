---
description: Create PR and update Linear issue (add comment + change status to In Review)
allowed-tools: Bash(curl:*), Bash(cat:*), Bash(git:*), Bash(gh:*)
---

# PR Update - Combined Action

Create a PR and update the associated Linear issue with comment and status change.

## Steps

1. **Identify the Linear issue** from context:
   - Check current branch name for issue identifier (e.g., `feature/BYU-125-some-feature`)
   - Or ask user which issue to update

2. **Create the PR** using standard git/gh workflow:
   - `git push` if not already pushed
   - `gh pr create` with appropriate title and body
   - Capture the PR URL

3. **Read config and get issue UUID**:
```bash
CONFIG=$(cat ~/.config/linear-simple/config.json)
API_KEY=$(echo $CONFIG | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)

curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"ISSUE_IDENTIFIER\"){id}}"}'
```

4. **Add PR link as comment**:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{commentCreate(input:{issueId:\"ISSUE_UUID\",body:\"PR created: PR_URL\\n\\nPR_SUMMARY\"}){comment{id url}}}"}'
```

5. **Get "In Review" state UUID**:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates(filter:{name:{eq:\"In Review\"}}){nodes{id name}}}"}'
```

6. **Update issue status to "In Review"**:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"ISSUE_UUID\",input:{stateId:\"IN_REVIEW_STATE_UUID\"}){issue{identifier state{name}}}}"}'
```

7. **Confirm to user**:
   - Show PR URL
   - Confirm comment was added to Linear issue
   - Confirm status changed to "In Review"
