---
description: Configure Linear API key and team settings
allowed-tools: Bash(curl:*), Bash(mkdir:*), Bash(echo:*), Bash(cat:*)
---

# Linear Simple Setup

Set up Linear API configuration.

## Steps

1. Ask user for their Linear API key (from Linear Settings > API)

2. Create config directory and save API key:
```bash
mkdir -p ~/.config/linear-simple
echo 'export LINEAR_API_KEY="USER_PROVIDED_KEY"' > ~/.config/linear-simple/config
```

3. Source config and fetch team info:
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'
```

4. Extract team ID and key, append to config:
```bash
echo 'export LINEAR_TEAM_ID="TEAM_UUID"' >> ~/.config/linear-simple/config
echo 'export LINEAR_TEAM_KEY="TEAM_KEY"' >> ~/.config/linear-simple/config
```

5. Fetch workflow states:
```bash
source ~/.config/linear-simple/config
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: $LINEAR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}'
```

6. Confirm setup complete and show team info to user

Now ask the user for their Linear API key to begin setup.
