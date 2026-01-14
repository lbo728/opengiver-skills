---
description: Configure Linear API key and team settings
allowed-tools: Bash(curl:*), Bash(mkdir:*), Bash(cat:*), Write
---

# Linear Simple Setup

Set up Linear API configuration.

## Steps

1. Ask user for their Linear API key (from Linear Settings > API)

2. Create config directory:
```bash
mkdir -p ~/.config/linear-simple
```

3. Fetch team info using the API key:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{teams{nodes{id name key}}}"}'
```

4. Extract team info from response and save as JSON config:

Use the Write tool to create `~/.config/linear-simple/config.json` with this structure:
```json
{
  "apiKey": "USER_API_KEY",
  "teamId": "TEAM_UUID",
  "teamKey": "TEAM_KEY",
  "teamName": "TEAM_NAME"
}
```

5. Fetch and display workflow states for reference:
```bash
curl -s -X POST https://api.linear.app/graphql \
  -H "Authorization: USER_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"query":"query{workflowStates{nodes{id name type}}}"}'
```

6. **Confirm setup complete and inform user:**
   - Show team name and key
   - Display available workflow states
   - **Important**: Tell the user that they can view and edit their settings at `~/.config/linear-simple/config.json`

Now ask the user for their Linear API key to begin setup.
