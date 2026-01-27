---
name: git-worktree
description: |
  Git Worktree Protocol for parallel development with isolated workspaces.
  Use when: (1) Starting implementation/feature work, (2) Creating feature branches,
  (3) Managing multiple parallel development tasks, (4) Setting up dev server debugging,
  (5) Optimizing disk usage across worktrees, (6) User mentions "worktree", "wt", "구현 시작", "작업 시작"
  Trigger examples: "Start implementing", "Create feature branch", "Set up worktree",
  "구현 시작해줘", "feature 브랜치 만들어", "워크트리 설정", "병렬 개발"
---

# Git Worktree Protocol

## Core Principle

**모든 에이전트의 구현 작업은 전용 worktree에서 진행한다.**

이 규칙은 다음 문제를 방지함:
- ❌ Agent A가 Agent B의 브랜치에 커밋
- ❌ 여러 에이전트가 같은 working directory에서 충돌
- ❌ 브랜치 전환 중 uncommitted changes 손실
- ❌ **daily 브랜치에 직접 커밋하여 이력 오염**

## Daily 브랜치 기반 워크플로우

```
                    ┌─────────────────────────────────────────────┐
                    │            전체 Git 워크플로우                │
                    └─────────────────────────────────────────────┘

    [메인 디렉토리]                           [워크트리들]
    daily/2026-01-26 ◄────────────────┬──── feature/BYU-123-login (워크트리)
         │                            │          ↓ PR 머지
         │ (읽기 전용, 직접 커밋 금지)  │     daily/2026-01-26에 머지됨
         │                            │
         │                            └──── feature/BYU-124-signup (워크트리)
         │                                       ↓ PR 머지
         │                                  daily/2026-01-26에 머지됨
         ↓
    daily → dev PR 머지 (하루 작업 통합)
```

## Trigger Condition

다음 조건 중 하나라도 해당하면 **Worktree 모드 활성화**:

1. 코드 구현/수정 작업 시작
2. Linear 이슈 구현
3. 버그 수정
4. 리팩토링

## Worktree Structure

```
my-app/                                    # 원본 (daily 브랜치, 직접 작업 금지)
├── .git/
├── (daily/2026-01-26 체크아웃됨)
└── ...

../my-app-worktrees/                       # Worktree 디렉토리 (여기서만 작업!)
├── feature-BYU-123-add-auth/              # 이슈 BYU-123 작업
├── feature-BYU-124-fix-ui/                # 이슈 BYU-124 작업
└── fix-BYU-125-login-bug/                 # 이슈 BYU-125 작업
```

## MANDATORY Workflow

### Step 1: Worktree 생성

```bash
# 변수 설정
PROJECT_NAME=$(basename $PWD)
BRANCH_NAME="feature/<context>"  # 또는 fix/<context>
WORKTREE_DIR="../${PROJECT_NAME}-worktrees/${BRANCH_NAME//\//-}"
BASE_BRANCH=$(git branch --show-current)  # daily/YYYY-MM-DD 또는 dev
ORIGINAL_DIR=$PWD

# Worktree 디렉토리 생성
mkdir -p "../${PROJECT_NAME}-worktrees"

# Worktree 생성 및 브랜치 체크아웃
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"

# Worktree로 이동
cd "$WORKTREE_DIR"
```

### Step 1.5: 환경 파일 Symlink (MANDATORY - 빌드 실패 방지)

`.gitignore`에 있는 환경 파일들(`.env`, `google-services.json` 등)은 워크트리에 자동 복사되지 않음.

**⚠️ 이 단계를 건너뛰면 빌드 실패!** (예: `No file or variants found for asset: .env`)

**`wt link-env` 명령어 사용 (권장):**

```bash
# 현재 워크트리에 환경 파일 링크
wt link-env

# 또는 모든 워크트리에 한 번에
wt link-env-all
```

**지원하는 파일 패턴:**
- `.env`, `.env.*` (`.env.local`, `.env.development` 등)
- `*.local`
- `google-services.json` (Firebase Android)
- `GoogleService-Info.plist` (Firebase iOS)
- `.secret*`

**주의사항:**
- Symlink된 파일 수정 시 **원본도 변경됨**
- 워크트리별 다른 환경이 필요하면 symlink 대신 **복사** 사용

### Step 2: 프로젝트 타입별 의존성 설치 (자동)

```bash
# 프로젝트 타입 감지 함수
detect_project_type() {
  if [[ -f "pubspec.yaml" ]]; then
    echo "flutter"
  elif [[ -f "package.json" ]]; then
    echo "nodejs"
  elif [[ -f "go.mod" ]]; then
    echo "go"
  elif [[ -f "Cargo.toml" ]]; then
    echo "rust"
  elif [[ -f "requirements.txt" ]] || [[ -f "pyproject.toml" ]]; then
    echo "python"
  else
    echo "generic"
  fi
}

# 타입별 설치
PROJECT_TYPE=$(detect_project_type)

case $PROJECT_TYPE in
  flutter)
    flutter pub get
    ;;
  nodejs)
    if command -v pnpm &> /dev/null; then
      pnpm install
    elif [[ -f "yarn.lock" ]]; then
      yarn install
    else
      npm install
    fi
    ;;
  go)
    go mod download
    ;;
  rust)
    cargo fetch
    ;;
  python)
    if [[ -f "poetry.lock" ]]; then
      poetry install
    else
      pip install -r requirements.txt
    fi
    ;;
esac
```

### Step 3: 작업 수행

- 모든 코드 수정은 worktree 내에서
- 커밋, 푸시 모두 worktree에서 실행
- 원본 디렉토리 접근 금지

### Step 4: 작업 완료 후 자동 정리

```bash
# PR 생성 완료 후
ORIGINAL_DIR=$(git worktree list | head -1 | awk '{print $1}')
CURRENT_WORKTREE=$PWD
BRANCH_NAME=$(git branch --show-current)

# 원본 디렉토리로 복귀
cd "$ORIGINAL_DIR"

# Worktree 삭제
git worktree remove "$CURRENT_WORKTREE"

# 로컬 브랜치 삭제 (PR 머지 후)
# git branch -d "$BRANCH_NAME"

echo "✅ Worktree 정리 완료"
```

## Disk Optimization by Project Type

### 1. Flutter/Dart ✅ (이미 최적화됨)

```bash
# Dart pub는 전역 캐시 (~/.pub-cache/) 자동 사용
flutter pub get  # ← 추가 설정 불필요!

# 선택적: 빌드 캐시 공유
mkdir -p ~/.cache/$PROJECT_NAME/flutter-build
ln -s ~/.cache/$PROJECT_NAME/flutter-build ./build
```

### 2. Node.js ⚠️ (pnpm 권장)

```bash
# pnpm 사용 시 (권장) - 자동 하드링크로 디스크 60%+ 절약
pnpm install

# npm/yarn 사용 시 - 조건부 symlink
ORIGINAL_DIR=$(git worktree list | head -1 | awk '{print $1}')
if diff package.json "$ORIGINAL_DIR/package.json" &> /dev/null; then
  # package.json 동일 → symlink로 공유
  ln -s "$ORIGINAL_DIR/node_modules" ./node_modules
  echo "✅ node_modules symlink 생성 (디스크 절약)"
else
  # package.json 변경됨 → 별도 설치
  npm install
  echo "⚠️ node_modules 별도 설치 (의존성 변경됨)"
fi
```

### 3. Go/Rust/Swift/Java ✅ (이미 최적화됨)

```bash
# 전역 캐시 자동 사용
go mod download    # ~/.go/pkg/mod/
cargo fetch        # ~/.cargo/registry/
gradle build       # ~/.gradle/caches/
```

### 4. Python ⚠️

```bash
# Poetry 사용 시 (권장)
poetry config virtualenvs.in-project false
poetry install

# venv 사용 시 - 공유 가상환경
VENV_DIR="$HOME/.venvs/$PROJECT_NAME"
if [[ ! -d "$VENV_DIR" ]]; then
  python -m venv "$VENV_DIR"
fi
ln -s "$VENV_DIR" .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Universal Build Cache Sharing

**모든 프로젝트 타입에 적용**:

```bash
share_build_cache() {
  PROJECT_NAME=$(basename $(git worktree list | head -1 | awk '{print $1}'))
  CACHE_DIR="$HOME/.cache/worktree-builds/$PROJECT_NAME"
  
  # 공유 가능한 빌드 디렉토리
  SHARED_DIRS=("build" "target" ".next/cache" ".turbo" "__pycache__" ".dart_tool/build")
  
  for DIR in "${SHARED_DIRS[@]}"; do
    if grep -q "^${DIR%/*}" .gitignore 2>/dev/null; then
      mkdir -p "$CACHE_DIR/$DIR"
      rm -rf "$DIR"
      ln -s "$CACHE_DIR/$DIR" "$DIR"
    fi
  done
}
```

## Disk Usage Comparison

| 프로젝트 타입 | 최적화 전 (3 worktrees) | 최적화 후 | 절약률 |
|--------------|------------------------|-----------|--------|
| Flutter | 150MB × 3 = 450MB | 170MB | 62% |
| Node.js (pnpm) | 500MB × 3 = 1.5GB | 540MB | 64% |
| Go/Rust | 100MB × 3 = 300MB | 110MB | 63% |
| Python | 300MB × 3 = 900MB | 320MB | 64% |

## Agent Behavior Rules

| 상황 | Agent 행동 |
|------|-----------|
| 구현 작업 시작 | Worktree 생성 → 해당 디렉토리에서 작업 |
| 이미 해당 브랜치 worktree 존재 | 기존 worktree 재사용 |
| PR 머지 완료 | Worktree 자동 삭제 |
| 원본 디렉토리 | 읽기 전용 (브랜치 확인, 상태 조회만) |

## Exception Cases

**Worktree 없이 작업 가능한 경우** (사용자 명시적 요청 시):

1. 단순 조회/분석 작업 (코드 수정 없음)
2. 긴급 핫픽스 (기존 작업 중단)
3. 사용자가 명시적으로 현재 디렉토리에서 작업 요청

```
⚠️ 현재 디렉토리에서 직접 작업하시겠습니까?

주의: 다른 에이전트가 동시에 작업 중이면 브랜치 충돌이 발생할 수 있습니다.

(yes/no)
```

## Complete Worktree Creation Script

```bash
create_agent_worktree() {
  local BRANCH_NAME=$1
  local BASE_BRANCH=${2:-$(git branch --show-current)}
  
  # 1. 변수 설정
  local PROJECT_NAME=$(basename $PWD)
  local WORKTREE_DIR="../${PROJECT_NAME}-worktrees/${BRANCH_NAME//\//-}"
  
  # 2. Worktree 생성
  mkdir -p "../${PROJECT_NAME}-worktrees"
  git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
  cd "$WORKTREE_DIR"
  
  # 3. 환경 파일 링크 (MANDATORY - 빌드 실패 방지!)
  wt link-env
  
  # 4. 프로젝트 타입 감지 및 의존성 설치
  local PROJECT_TYPE=$(detect_project_type)
  
  case $PROJECT_TYPE in
    flutter)
      flutter pub get
      ;;
    nodejs)
      command -v pnpm &> /dev/null && pnpm install || npm install
      ;;
    go)
      go mod download
      ;;
    rust)
      cargo fetch
      ;;
    python)
      [[ -f "poetry.lock" ]] && poetry install || pip install -r requirements.txt
      ;;
  esac
  
  # 5. 빌드 캐시 공유
  share_build_cache
  
  echo "✅ Worktree 생성 완료: $WORKTREE_DIR"
  echo "📁 프로젝트 타입: $PROJECT_TYPE"
  pwd
}
```

## Worktree Cleanup Script

```bash
cleanup_agent_worktree() {
  local WORKTREE_PATH=$PWD
  local ORIGINAL_DIR=$(git worktree list | head -1 | awk '{print $1}')
  local BRANCH_NAME=$(git branch --show-current)
  
  # 원본 디렉토리로 이동
  cd "$ORIGINAL_DIR"
  
  # Worktree 삭제
  git worktree remove "$WORKTREE_PATH" --force
  
  echo "✅ Worktree 삭제 완료: $WORKTREE_PATH"
  
  # 머지된 브랜치면 로컬 브랜치도 삭제
  if git branch --merged | grep -q "$BRANCH_NAME"; then
    git branch -d "$BRANCH_NAME"
    echo "✅ 브랜치 삭제 완료: $BRANCH_NAME"
  fi
}
```

---

# Worktree Debugging Protocol (Dev Server Management)

## Overview

여러 worktree에서 동시에 dev 서버를 실행하고 쉽게 전환하기 위한 프로토콜.

**핵심 도구**: `wt` CLI (+ tmux 선택적)

## tmux vs Warp/iTerm

| 방식 | 장점 | 단점 |
|------|------|------|
| **tmux** | 스크립트 자동화, SSH 세션 유지 | 텍스트 UI |
| **Warp/iTerm 패널** | 모던 UI, 직관적 | 자동화 어려움 |

**Warp 사용 시**: tmux 없이 수동으로 각 패널에서 실행
```bash
# 패널 1
cd $(wt cd feature-auth) && npm run dev

# 패널 2
cd $(wt cd feature-ui) && npm run dev
```

## wt CLI 명령어

| 명령어 | 설명 |
|--------|------|
| `wt ls` | 모든 worktree 상태 표시 (포트, 실행 여부) |
| `wt link-env` | 현재 worktree에 .env 파일 symlink **(워크트리 생성 후 필수!)** |
| `wt link-env-all` | 모든 worktree에 .env 파일 symlink |
| `wt dev-all` | 모든 worktree의 dev 서버를 tmux에서 시작 |
| `wt attach` | tmux 세션에 연결 |
| `wt stop all` | 모든 dev 서버 중지 |
| `wt ports` | 포트 할당 현황 |
| `wt open <name>` | 브라우저에서 열기 |
| `cd $(wt cd <name>)` | 특정 worktree로 이동 |

## Port Assignment (자동)

각 worktree는 생성 순서에 따라 자동 포트 할당:

```
feature-auth  → localhost:3000
feature-ui    → localhost:3001
fix-bug       → localhost:3002
...
```

## Workflow

### 1. 모든 dev 서버 시작

```bash
wt dev-all
```

출력 예시:
```
🚀 Starting all worktrees...
  ✅ feature-auth → localhost:3000
  ✅ feature-ui → localhost:3001
  ✅ fix-bug → localhost:3002

All dev servers started!

Commands:
  wt attach        - Attach to tmux session
  Ctrl+b, n        - Next window (next worktree)
  Ctrl+b, p        - Previous window
  Ctrl+b, d        - Detach (servers keep running)
```

### 2. tmux 세션 연결

```bash
wt attach
```

### 3. Worktree 간 전환 (tmux 내에서)

| 키 | 동작 |
|----|------|
| `Ctrl+b, n` | 다음 worktree |
| `Ctrl+b, p` | 이전 worktree |
| `Ctrl+b, 0-9` | 특정 worktree로 이동 |
| `Ctrl+b, w` | worktree 목록 보기 |
| `Ctrl+b, d` | Detach (서버는 계속 실행) |

### 4. 브라우저에서 확인

```bash
# 특정 worktree 열기
wt open feature-auth

# 또는 직접
open http://localhost:3000
open http://localhost:3001
```

### 5. 상태 확인

```bash
wt ls
```

출력 예시:
```
📁 Worktrees for my-app
========================================

  [main] /path/to/my-app
    Type: nodejs
    Branch: daily/2026-01-26

  [feature-auth]
    Path: ../my-app-worktrees/feature-auth
    Branch: feature/auth
    Type: nodejs
    Status: ● Running on :3000

  [feature-ui]
    Path: ../my-app-worktrees/feature-ui
    Branch: feature/ui
    Type: nodejs
    Status: ○ Stopped (port 3001)

----------------------------------------
  tmux: Session 'my-app-dev' active
  Attach: wt attach
```

### 6. 서버 중지

```bash
# 모든 서버 중지
wt stop all

# 특정 서버만 중지
wt stop feature-auth
```

## Flutter 프로젝트: `wtf` (Worktree Flutter Switcher)

Flutter는 디바이스당 하나의 앱만 실행 가능. **`wtf` 명령어로 손쉽게 워크트리 전환:**

```bash
# Flutter 워크트리 스위처 시작
wtf

# 특정 디바이스 지정
wtf "iPhone 15 Pro"
```

**`wtf` 실행 화면:**
```
╔══════════════════════════════════════════════════════════╗
║  🦋 Flutter Worktree Switcher  (my-flutter-app)          ║
╠══════════════════════════════════════════════════════════╣
║  ▶ Active: feature-auth                                  ║
║  📱 Device: iPhone 15 Pro                                ║
╚══════════════════════════════════════════════════════════╝

  Select worktree to debug:

  ▶ [1] feature-auth ← running
       feature/auth
    [2] feature-ui
       feature/ui
    [3] fix-login-bug
       fix/login-bug

  ──────────────────────────────────────────────────────
  [1-3] Select   [q] Quit

  Select [1-3] or Enter to run current: _
```

**워크플로우:**
1. `wtf` 실행 → 워크트리 목록 표시
2. 숫자 키로 워크트리 선택 → `flutter run` 자동 실행
3. Flutter 디버깅 중 `q` 입력 → 워크트리 선택 화면으로 복귀
4. 다른 워크트리 선택 → 해당 워크트리에서 `flutter run` 재시작

**Flutter 내 단축키 (flutter run 실행 중):**
| 키 | 동작 |
|----|------|
| `r` | Hot reload |
| `R` | Hot restart |
| `q` | 종료 → 워크트리 선택으로 복귀 |

**대안: 여러 시뮬레이터 동시 사용**
```bash
# Worktree 1: iPhone 15 Pro
cd $(wt cd feature-auth)
flutter run -d "iPhone 15 Pro"

# Worktree 2: iPhone 15 (다른 터미널에서)
cd $(wt cd feature-ui)
flutter run -d "iPhone 15"
```

## Agent Integration

Agent가 worktree에서 작업 시:

1. **작업 시작 전**: `wt ls`로 현재 상태 확인
2. **dev 서버 필요 시**: `wt dev <worktree-name>` 실행
3. **작업 완료 후**: 필요 시 `wt stop <name>` 또는 사용자에게 안내

```bash
# Agent 워크플로우 예시
# 1. Worktree 생성
git worktree add -b feature/new-feature ../my-app-worktrees/feature-new-feature daily/2026-01-26

# 2. 해당 worktree로 이동
cd ../my-app-worktrees/feature-new-feature

# 3. 환경 파일 링크 (MANDATORY - 빌드 실패 방지!)
wt link-env

# 4. 의존성 설치
pnpm install  # or flutter pub get

# 5. dev 서버 시작 (필요 시)
wt dev feature-new-feature

# 6. 작업 수행...

# 7. 작업 완료 후 정리
wt stop feature-new-feature
```
