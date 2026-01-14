# Linear Simple Skill

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
/linear-simple setup
```

### Option 2: Natural Language
```
"Linear setup 해줘"
"Configure Linear API"
```

Claude will:
1. Ask for your Linear API key (get from Linear Settings > API)
2. Automatically fetch your team info
3. Save configuration to `~/.config/linear-simple/config`

## Usage

### Slash Command
```bash
/linear-simple get BYU-125
/linear-simple create "Fix API bug"
/linear-simple status BYU-125 "In Progress"
```

### Natural Language
```
"Get BYU-125"
"BYU-125 조회해줘"
"Create an issue: Fix API bug"
"Change BYU-125 status to In Progress"
"Add comment 'Started working' to BYU-125"
"Show recent 10 issues"
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

To reconfigure, run `/linear-simple setup` again.

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
│       │   └── linear-simple.md  # Slash command definition
│       └── skills/
│           └── linear-simple/
│               ├── SKILL.md      # Natural language skill
│               └── references/
│                   └── graphql-patterns.md
└── README.md
```

## License

MIT
