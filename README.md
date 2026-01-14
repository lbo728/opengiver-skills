# Linear Simple Skill

[English](README.md) | [한국어](README.ko.md)

A Claude Code plugin for Linear GraphQL API. Direct curl calls without MCP, improving token efficiency by 50-70%.

## Features

- **Create Issue**: Set title, description, priority
- **Get Issue**: Query by identifier (e.g., BYU-125)
- **Update Issue**: Change status (In Progress, Done, etc.)
- **Add Comment**: Post comments to issues
- **PR Update**: Create PR + add comment + update status in one command
- **Auto Setup**: Configure with a single command

## Installation

### Method 1: Marketplace (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add lbo728/linear-simple-skill

# Step 2: Install the plugin
/plugin install linear-simple@opengiver

# Step 3: Restart Claude Code
```

### Method 2: Interactive UI

```bash
# Open plugin manager
/plugin

# Navigate to "Marketplaces" tab → Add → Enter: lbo728/linear-simple-skill
# Then go to "Discover" tab → Find "linear-simple" → Install
```

### Method 3: Manual Installation

```bash
# Clone and copy to your skills directory
git clone https://github.com/lbo728/linear-simple-skill.git
cp -r linear-simple-skill/plugins/linear-simple ~/.claude/plugins/
```

## Setup (Required)

After installation, configure your Linear API:

### Option 1: Slash Command
```bash
/linear-simple:setup
```

### Option 2: Natural Language
```
"Configure Linear API"
"Set up Linear integration"
```

Claude will:
1. Ask for your Linear API key (get from Linear Settings > API)
2. Automatically fetch your team info
3. Save configuration to `~/.config/linear-simple/config.json`

You can view and edit your settings in `~/.config/linear-simple/config.json`.

## Usage

### Slash Commands
```bash
/linear-simple:setup                        # Configure API
/linear-simple:get BYU-125                  # Get issue details
/linear-simple:list                         # List recent issues (asks for count)
/linear-simple:list 10                      # List recent 10 issues
/linear-simple:create "Fix API bug"         # Create new issue
/linear-simple:status BYU-125 "In Progress" # Update status
/linear-simple:comment BYU-125 "Done!"      # Add comment
/linear-simple:pr-update                    # PR + comment + status update
```

### Natural Language

**Get Issue**
```
"Read issue BYU-125 and help me plan the implementation"
"What's in BYU-125? I need to understand the requirements"
"Show me BYU-125 details"
```

**List Issues**
```
"Show me the recent 10 issues"
"What issues are currently in progress?"
"List all backlog items"
```

**Create Issue**
```
"Create an issue"
→ Agent: "What title and description should I use?"
→ You: "Title: [Product] Implement checkout flow
        Description: (generate something appropriate based on the title)"

"Make a new issue for the login bug we just discussed"
"Add an issue: API rate limiting implementation"
```

**Update Status**
```
"Change BYU-125 to In Progress"
"Mark BYU-125 as Done"
"Set BYU-125 to In Review"
```

**Add Comment**
```
"Create a PR and add a comment to this task's issue"
→ Agent checks context for issue number, creates PR, and posts PR details as comment

"Comment on BYU-125: Started implementation"
"Add note to BYU-125 with today's progress"
```

**PR + Update (Combined)**
```
"Create PR and update the Linear issue"
→ Agent: Creates PR, adds PR link as comment, changes status to "In Review"

"Push this PR and sync with Linear"
"Finish this task - create PR and mark issue as In Review"
```

Both methods work interchangeably!

## Token Efficiency: MCP vs Skill

| Method | Tokens (10 operations) |
|--------|------------------------|
| MCP | ~570,000 tokens |
| Skill | ~520,000 tokens |
| **Saved** | **~50,000 tokens (9%)** |

In longer conversations, efficiency gains increase significantly (up to 99% savings).

## Configuration

Config file location: `~/.config/linear-simple/config.json`

```json
{
  "apiKey": "lin_api_xxxxx",
  "teamId": "uuid",
  "teamKey": "BYU",
  "teamName": "Your Team Name"
}
```

To reconfigure, run `/linear-simple:setup` again or edit the JSON file directly.

## Repository Structure

```
linear-simple-skill/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace registry
├── plugins/
│   └── linear-simple/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin manifest
│       ├── commands/
│       │   ├── setup.md          # /linear-simple:setup
│       │   ├── get.md            # /linear-simple:get
│       │   ├── list.md           # /linear-simple:list
│       │   ├── create.md         # /linear-simple:create
│       │   ├── status.md         # /linear-simple:status
│       │   ├── comment.md        # /linear-simple:comment
│       │   └── pr-update.md      # /linear-simple:pr-update
│       └── skills/
│           └── linear-simple/
│               ├── SKILL.md      # Natural language skill
│               └── references/
│                   └── graphql-patterns.md
├── README.md
└── README.ko.md
```

## License

MIT
