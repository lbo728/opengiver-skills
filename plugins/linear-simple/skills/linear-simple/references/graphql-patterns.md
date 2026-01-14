# Linear GraphQL Advanced Patterns

**Note**: All commands assume config is loaded: `source ~/.config/linear-simple/config`

## Filtering Queries

### Get Issues by Status
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(filter:{state:{name:{eq:\\\"In Progress\\\"}},team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title}}}\"}"
```

### Get Issues by Priority
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(filter:{priority:{eq:1},team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title priority}}}\"}"
```

### Get Recently Updated Issues
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,orderBy:updatedAt,filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title updatedAt}}}\"}"
```

## Detailed Queries

### Get Issue with Comments
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"ISSUE-ID\"){id identifier title description state{name} comments{nodes{body createdAt}}}}"}'
```

### Get Issue with Labels
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issue(id:\"ISSUE-ID\"){id identifier title labels{nodes{name color}}}}"}'
```

## Complex Mutations

### Create Issue (Full Options)
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"mutation{issueCreate(input:{title:\\\"Title\\\" teamId:\\\"$LINEAR_TEAM_ID\\\" description:\\\"Description\\\" priority:2}){issue{id identifier title url}}}\"}"
```

### Bulk Update Issue
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{title:\"New Title\" description:\"New Description\" priority:1 stateId:\"state-uuid\"}){issue{id identifier title state{name}}}}"}'
```

## Label Management

### List Labels
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{issueLabels{nodes{id name color}}}"}'
```

### Add Label to Issue
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{labelIds:[\"label-uuid\"]}){issue{id labels{nodes{name}}}}}"}'
```

## Search

### Text Search
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{searchIssues(term:\"bug\",first:10){nodes{id identifier title}}}"}'
```

## Pagination

### Cursor-based Pagination
```bash
source ~/.config/linear-simple/config

# First page
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title}pageInfo{hasNextPage endCursor}}}\"}"

# Next page (use endCursor value)
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{issues(first:10,after:\\\"cursor-value\\\",filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}}}){nodes{id identifier title}pageInfo{hasNextPage endCursor}}}\"}"
```

## Cycle/Sprint Management

### Get Active Cycle
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\":\"query{cycles(filter:{team:{key:{eq:\\\"$LINEAR_TEAM_KEY\\\"}},isActive:{eq:true}}){nodes{id name startsAt endsAt}}}\"}"
```

### Add Issue to Cycle
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"mutation{issueUpdate(id:\"issue-uuid\",input:{cycleId:\"cycle-uuid\"}){issue{id cycle{name}}}}"}'
```
