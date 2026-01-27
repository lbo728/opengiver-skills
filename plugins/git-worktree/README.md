# Git Worktree

[English](README.md) | [한국어](README.ko.md)

| | |
|---|---|
| **Name** | git-worktree |
| **Description** | Git Worktree Protocol - Parallel development with isolated workspaces, wt CLI, and environment management |
| **Version** | 1.0.0 |
| **Triggers** | "worktree", "wt", "구현 시작", "작업 시작", "feature 브랜치", "Start implementing", "Create feature branch", "parallel development" |

---

A Claude Code skill for Git Worktree Protocol. Enables safe parallel development with isolated workspaces, preventing branch conflicts and uncommitted changes loss across multiple agents.

## Features

- **Isolated Workspaces**: Each feature/fix gets its own worktree directory
- **Parallel Development**: Multiple agents work simultaneously without conflicts
- **Environment Management**: Automatic symlink of .env files and secrets
- **Project Type Detection**: Auto-install dependencies (Node.js, Flutter, Go, Python, Rust)
- **Disk Optimization**: Shared build caches and global package managers
- **Dev Server Management**: `wt` CLI for managing multiple dev servers
- **Flutter Support**: `wtf` command for easy worktree switching on mobile
- **Automatic Cleanup**: Remove worktrees after PR merge

## Installation

### Method 1: Marketplace (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add lbo728/opengiver-skills

# Step 2: Install the plugin
/plugin install git-worktree@opengiver-skills

# Step 3: Restart Claude Code
```

### Method 2: Interactive UI

```bash
# Open plugin manager
/plugin

# Navigate to "Marketplaces" tab → Add → Enter: lbo728/opengiver-skills
# Then go to "Discover" tab → Find "git-worktree" → Install
```

### Method 3: Manual Installation

```bash
# Clone and copy to your skills directory
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/git-worktree ~/.claude/plugins/
```

## Quick Start

### 1. Create a Worktree for Feature Work

```bash
# Agent automatically creates worktree when you say:
"Start implementing feature/BYU-123-add-login"

# Or manually:
PROJECT_NAME=$(basename $PWD)
BRANCH_NAME="feature/BYU-123-add-login"
WORKTREE_DIR="../${PROJECT_NAME}-worktrees/${BRANCH_NAME//\//-}"
BASE_BRANCH=$(git branch --show-current)

mkdir -p "../${PROJECT_NAME}-worktrees"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
cd "$WORKTREE_DIR"
```

### 2. Link Environment Files (MANDATORY)

```bash
# Link .env, .env.local, google-services.json, etc.
wt link-env

# Or for all worktrees at once
wt link-env-all
```

### 3. Install Dependencies

```bash
# Auto-detected by project type
pnpm install    # Node.js
flutter pub get # Flutter
go mod download # Go
cargo fetch     # Rust
poetry install  # Python
```

### 4. Work and Commit

```bash
# All work happens in the worktree
git add .
git commit -m "feat: add login feature"
git push -u origin feature/BYU-123-add-login
```

### 5. Create PR and Cleanup

```bash
# Create PR
gh pr create --title "feature/BYU-123-add-login"

# After merge, cleanup
cd ../my-app  # Back to original
git worktree remove ../my-app-worktrees/feature-BYU-123-add-login
```

## Worktree Structure

```
my-app/                                    # Original (daily branch, read-only)
├── .git/
├── (daily/2026-01-26 checked out)
└── ...

../my-app-worktrees/                       # Worktree directory (work here!)
├── feature-BYU-123-add-auth/              # Issue BYU-123 work
├── feature-BYU-124-fix-ui/                # Issue BYU-124 work
└── fix-BYU-125-login-bug/                 # Issue BYU-125 work
```

## Dev Server Management

### Start All Dev Servers

```bash
wt dev-all
```

### Attach to tmux Session

```bash
wt attach
```

### Switch Between Worktrees (in tmux)

| Key | Action |
|----|--------|
| `Ctrl+b, n` | Next worktree |
| `Ctrl+b, p` | Previous worktree |
| `Ctrl+b, 0-9` | Jump to specific worktree |
| `Ctrl+b, w` | List all worktrees |
| `Ctrl+b, d` | Detach (servers keep running) |

### Check Status

```bash
wt ls
```

### Stop Servers

```bash
# Stop all
wt stop all

# Stop specific
wt stop feature-auth
```

## Flutter Development

### Switch Worktrees While Debugging

```bash
# Start Flutter worktree switcher
wtf

# Or specify device
wtf "iPhone 15 Pro"
```

**In wtf menu:**
- `1-3` - Select worktree
- `r` - Hot reload
- `R` - Hot restart
- `q` - Quit and return to menu

### Run Multiple Simulators

```bash
# Terminal 1: Worktree 1
cd $(wt cd feature-auth)
flutter run -d "iPhone 15 Pro"

# Terminal 2: Worktree 2
cd $(wt cd feature-ui)
flutter run -d "iPhone 15"
```

## Disk Optimization

### Automatic Caching by Project Type

| Type | Cache Location | Savings |
|------|---|---|
| **Node.js (pnpm)** | Global hardlinks | 60%+ |
| **Flutter** | `~/.pub-cache/` | 62% |
| **Go** | `~/.go/pkg/mod/` | 63% |
| **Rust** | `~/.cargo/registry/` | 63% |
| **Python** | `~/.venvs/` | 64% |

### Build Cache Sharing

```bash
# Automatically shared across worktrees
build/
target/
.next/cache/
.turbo/
__pycache__/
.dart_tool/build/
```

## Agent Behavior Rules

| Situation | Agent Action |
|-----------|--------------|
| Start implementation work | Create worktree → work in that directory |
| Worktree already exists | Reuse existing worktree |
| PR merged | Auto-delete worktree |
| Original directory | Read-only (branch check, status only) |

## Exception Cases

**Work without worktree** (user explicit request):

1. Simple read/analysis (no code changes)
2. Emergency hotfix (pause existing work)
3. User explicitly requests current directory work

```
⚠️ Work in current directory?

Warning: Other agents working simultaneously may cause branch conflicts.

(yes/no)
```

## Plugin Structure

```
git-worktree/
├── .claude-plugin/
│   └── plugin.json           # Plugin manifest
├── skills/
│   └── git-worktree/
│       └── SKILL.md          # Worktree protocol skill
├── README.md
└── README.ko.md
```

## Key Principles

### 1. Isolated Workspaces

Each agent gets its own worktree to prevent:
- ❌ Agent A committing to Agent B's branch
- ❌ Multiple agents in same directory conflict
- ❌ Uncommitted changes loss during branch switch
- ❌ Polluting daily branch with direct commits

### 2. Environment Files (MANDATORY)

```bash
# MUST link environment files after worktree creation
wt link-env

# Supported patterns:
# - .env, .env.*, .env.local, .env.development
# - *.local
# - google-services.json (Firebase Android)
# - GoogleService-Info.plist (Firebase iOS)
# - .secret*
```

### 3. Dependency Installation

Auto-detected by project type:

```bash
# Node.js
pnpm install  # Recommended (hardlinks, 60%+ savings)
npm install
yarn install

# Flutter
flutter pub get

# Go
go mod download

# Rust
cargo fetch

# Python
poetry install
pip install -r requirements.txt
```

### 4. Clean Workflow

```
1. Create worktree from base branch
2. Link environment files
3. Install dependencies
4. Work and commit
5. Push and create PR
6. After merge, delete worktree
```

## Troubleshooting

### Build Fails: "No file or variants found for asset: .env"

**Solution**: Run `wt link-env` after creating worktree

```bash
cd ../my-app-worktrees/feature-xyz
wt link-env
```

### Worktree Already Exists

```bash
# List all worktrees
git worktree list

# Remove old worktree
git worktree remove ../my-app-worktrees/feature-old
```

### Port Already in Use

```bash
# Check port assignments
wt ports

# Kill process on port
lsof -ti:3000 | xargs kill -9
```

### Symlink Issues

```bash
# If symlink is broken, recreate it
rm -f .env
wt link-env

# Or copy instead of symlink (for different env per worktree)
cp ../.env .env
```

## Best Practices

1. **Always use worktrees for implementation** - Never commit directly to daily/dev branch
2. **Link environment files immediately** - Before running build/dev server
3. **Use pnpm for Node.js** - Best disk optimization (hardlinks)
4. **Reuse worktrees** - Don't delete and recreate for same branch
5. **Clean up after merge** - Delete worktree to free disk space
6. **Check status before switching** - Use `wt ls` to see active servers

## License

MIT
