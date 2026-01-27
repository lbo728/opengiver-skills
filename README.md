# Opengiver Skills

[English](README.md) | [한국어](README.ko.md)

A collection of productivity plugins for Claude Code. Built for developers who want AI-powered automation for project management, content creation, and workflow optimization.

**Contributions welcome!** Found a way to improve a plugin or have a new one to add? [Open a PR](#contributing).

## What are Plugins?

Plugins are specialized tools that extend Claude Code's capabilities. Each plugin provides commands, skills, and workflows for specific tasks. When installed, Claude Code can recognize when you're working on related tasks and apply the right tools automatically.

## Available Plugins

| Plugin | Description | Commands |
|--------|-------------|----------|
| [linear-simple](plugins/linear-simple) | Linear GraphQL API for issue management | `/linear-simple:setup`, `/linear-simple:get`, `/linear-simple:create` |
| [blog-material-gen](plugins/blog-material-gen) | Auto-generate blog material from Git branches to Notion | `/blog-material-gen:setup`, `/blog-material-gen` |
| [product-launch-strategist](plugins/product-launch-strategist) | Product launch strategy advisor for indie developers | `/product-launch-strategist:analyze`, `:pricing`, `:risk` |
| [git-worktree](plugins/git-worktree) | Git worktree protocol for parallel development with isolated workspaces | Skill-only (no commands) |
| [db-safety](plugins/db-safety) | Database safety protocol to prevent accidental data loss | Skill-only (no commands) |

## Installation

### Option 1: Claude Code Plugin (Recommended)

Install via Claude Code's built-in plugin system:

```bash
# Add the marketplace
/plugin marketplace add lbo728/opengiver-skills

# Install specific plugin
/plugin install linear-simple@opengiver-skills
/plugin install blog-material-gen@opengiver-skills
/plugin install product-launch-strategist@opengiver-skills
```

### Option 2: Interactive UI

```bash
# Open plugin manager
/plugin

# Navigate to "Marketplaces" tab → Add → Enter: lbo728/opengiver-skills
# Then go to "Discover" tab → Find plugin → Install
```

### Option 3: Clone and Copy

Clone the entire repo and copy the plugins folder:

```bash
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/* ~/.claude/plugins/
```

## Plugin Details

### linear-simple

Direct Linear GraphQL API calls without MCP, improving token efficiency by 50-70%.

**Features:**
- Issue CRUD (Create, Read, Update, Delete)
- Comment management
- Status updates
- PR + Linear sync

**Setup:**
```bash
/linear-simple:setup
```

[View full documentation →](plugins/linear-simple/README.md)

---

### blog-material-gen

Automatically analyze daily Git branches and generate blog material to Notion database.

**Features:**
- Git branch/commit analysis
- Notion page auto-creation
- Sensitive data masking
- Slack notifications (optional)

**Setup:**
```bash
/blog-material-gen:setup
```

[View full documentation →](plugins/blog-material-gen/README.md)

---

### product-launch-strategist

Strategic advisor for product launches, optimized for indie developers and small teams.

**Features:**
- Competitive analysis (Porter's 5 Forces, differentiation)
- Pricing strategy (Freemium, SaaS, benchmarks)
- Cost analysis (CAC/LTV, break-even)
- Launch checklist (pre/day/post)
- Risk assessment (matrix, pre-mortem)

**Triggers:**
```
"Should I launch this app?"
"How should I price this?"
"경쟁사 대비 강점이 뭐야?"
"비즈니스 모델 검토해줘"
```

[View full documentation →](plugins/product-launch-strategist/README.md)

---

### git-worktree

Git Worktree Protocol for safe parallel development with isolated workspaces.

**Features:**
- Isolated workspaces for each feature/fix branch
- Automatic environment file management (.env, secrets)
- Dev server management with `wt` CLI
- Flutter worktree switcher (`wtf`) for mobile development
- Disk optimization with shared build caches
- Automatic cleanup after PR merge

**Triggers:**
```
"worktree"
"wt"
"Start implementing"
"구현 시작"
"parallel development"
"feature branch"
```

[View full documentation →](plugins/git-worktree/README.md)

---

### db-safety

Database Safety Protocol to prevent accidental data loss and enforce safe migrations.

**Features:**
- Dangerous operation blocking (DROP, ALTER, DELETE, TRUNCATE)
- SQL query safety guide with safe vs. unsafe patterns
- Safe migration patterns (3-step deletion, Expand-Contract)
- Risk level classification (LOW, MEDIUM, HIGH, CRITICAL)
- Environment separation (Dev DB vs. Prod DB)
- Rollback procedures for migration failures

**Triggers:**
```
"DROP TABLE"
"ALTER COLUMN"
"DELETE FROM"
"마이그레이션"
"SQL"
"dangerous operation"
```

[View full documentation →](plugins/db-safety/README.md)

## Repository Structure

```
opengiver-skills/
├── .claude-plugin/
│   └── marketplace.json          # Marketplace registry
├── plugins/
│   ├── linear-simple/            # Linear API plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   ├── blog-material-gen/        # Blog material generator plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   ├── scripts/
│   │   └── README.md
│   ├── product-launch-strategist/ # Product launch advisor plugin
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   ├── git-worktree/             # Git worktree protocol plugin
│   │   ├── .claude-plugin/
│   │   ├── skills/
│   │   └── README.md
│   └── db-safety/                # Database safety protocol plugin
│       ├── .claude-plugin/
│       ├── skills/
│       └── README.md
├── README.md
└── README.ko.md
```

## Contributing

Found a way to improve a plugin? Have a new plugin to suggest? PRs and issues welcome!

**Ideas for contributions:**
- Improve existing plugin instructions
- Add new features to existing plugins
- Fix bugs or clarify documentation
- Suggest new plugins (open an issue first to discuss)

**How to contribute:**

1. Fork the repo
2. Create a new branch
3. Make your changes
4. Submit a PR with a clear description

### Plugin Structure

Each plugin follows this structure:

```
plugins/
  plugin-name/
    .claude-plugin/
      plugin.json           # Plugin manifest
    commands/
      setup.md              # /plugin-name:setup
      command.md            # /plugin-name:command
    skills/
      plugin-name/
        SKILL.md            # Natural language skill
    README.md               # Plugin documentation
    README.ko.md            # Korean documentation
```

## License

MIT - Use these however you want.
