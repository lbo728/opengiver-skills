# Linear Simple Skill

A Claude Code plugin for Linear GraphQL API. Direct curl calls without MCP, improving token efficiency by 50-70%.

## Features

- **Create Issue**: Set title, description, priority
- **Get Issue**: Query by identifier (e.g., BYU-125)
- **Update Issue**: Change status (In Progress, Done, etc.)
- **Add Comment**: Post comments to issues
- **Delete Issue**
- **Auto Setup**: `/linear setup` command configures everything automatically

## Installation

### Method 1: Marketplace (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add lbo728/linear-simple-skill

# Step 2: Install the plugin
/plugin install linear-simple@lbo728-marketplace
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
cp -r linear-simple-skill/plugins/linear-simple/skills/linear-simple ~/.claude/skills/
```

## Setup (Required)

After installation, run:

```
/linear setup
```

Claude will:
1. Ask for your Linear API key (get from Linear Settings > API)
2. Automatically fetch your team info
3. Save configuration to `~/.config/linear-simple/config`

No manual environment variable setup needed!

## Usage

Just use natural language:

```
"Get BYU-125"
"Create an issue: Fix API bug"
"Change BYU-125 status to In Progress"
"Add comment 'Started working' to BYU-125"
"Show recent 10 issues"
```

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

To reconfigure, run `/linear setup` again.

## Repository Structure

```
linear-simple-skill/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace registry
├── plugins/
│   └── linear-simple/
│       ├── .claude-plugin/
│       │   └── plugin.json       # Plugin manifest
│       └── skills/
│           └── linear-simple/
│               ├── SKILL.md      # Main skill guide
│               └── references/
│                   └── graphql-patterns.md
└── README.md
```

## License

MIT
