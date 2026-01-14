# Linear Simple Skill

[English](README.md) | [한국어](README.ko.md)

A Claude Code plugin for Linear GraphQL API. Direct curl calls without MCP, improving token efficiency by 50-70%.

## Features

- **Create Issue**: Set title, description, priority
- **Get Issue**: Query by identifier (e.g., BYU-125)
- **Update Issue**: Change status (In Progress, Done, etc.)
- **Add Comment**: Post comments to issues
- **Delete Issue**
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
3. Save configuration to `~/.config/linear-simple/config`

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
```

### Natural Language

**Get Issue**
```
"Get BYU-125"
"Show me issue BYU-125"
"What's the status of BYU-125?"
```

**List Issues**
```
"Show recent 10 issues"
"List the last 5 issues"
"What issues do we have?"
```

**Create Issue**
```
"Create an issue: Fix API bug"
"Make a new issue titled 'Update documentation'"
"Add issue: Refactor login module"
```

**Update Status**
```
"Change BYU-125 status to In Progress"
"Mark BYU-125 as Done"
"Set BYU-125 to In Review"
```

**Add Comment**
```
"Add comment 'Started working' to BYU-125"
"Comment on BYU-125: This is fixed now"
"Post 'Need more info' on BYU-125"
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

Config file location: `~/.config/linear-simple/config`

Contains:
- `LINEAR_API_KEY` - Your Linear API key
- `LINEAR_TEAM_ID` - Your team's UUID
- `LINEAR_TEAM_KEY` - Your team's key (e.g., BYU)

To reconfigure, run `/linear-simple:setup` again.

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
│       │   └── comment.md        # /linear-simple:comment
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
