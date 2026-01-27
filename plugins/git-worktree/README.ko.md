# Git Worktree

[English](README.md) | [한국어](README.ko.md)

| | |
|---|---|
| **이름** | git-worktree |
| **설명** | Git Worktree 프로토콜 - 격리된 워크스페이스, wt CLI, 환경 파일 관리를 통한 병렬 개발 |
| **버전** | 1.0.0 |
| **트리거** | "worktree", "wt", "구현 시작", "작업 시작", "feature 브랜치", "병렬 개발", "워크트리 생성" |

---

Claude Code용 Git Worktree 프로토콜 스킬. 격리된 워크스페이스로 안전한 병렬 개발을 가능하게 하며, 여러 에이전트 간 브랜치 충돌과 미커밋 변경사항 손실을 방지합니다.

## 기능

- **격리된 워크스페이스**: 각 feature/fix마다 독립적인 워크트리 디렉토리
- **병렬 개발**: 여러 에이전트가 동시에 충돌 없이 작업
- **환경 파일 관리**: .env 파일과 시크릿 자동 symlink
- **프로젝트 타입 감지**: 의존성 자동 설치 (Node.js, Flutter, Go, Python, Rust)
- **디스크 최적화**: 빌드 캐시 공유 및 전역 패키지 매니저 활용
- **Dev 서버 관리**: `wt` CLI로 여러 dev 서버 관리
- **Flutter 지원**: `wtf` 명령어로 모바일 워크트리 쉽게 전환
- **자동 정리**: PR 머지 후 워크트리 자동 삭제

## 설치

### 방법 1: 마켓플레이스 (권장)

```bash
# 1단계: 마켓플레이스 추가
/plugin marketplace add lbo728/opengiver-skills

# 2단계: 플러그인 설치
/plugin install git-worktree@opengiver-skills

# 3단계: Claude Code 재시작
```

### 방법 2: UI로 설치

```bash
# 플러그인 매니저 열기
/plugin

# "Marketplaces" 탭 → Add → 입력: lbo728/opengiver-skills
# "Discover" 탭으로 이동 → "git-worktree" 찾기 → Install
```

### 방법 3: 수동 설치

```bash
# 저장소 클론 후 스킬 디렉토리로 복사
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/git-worktree ~/.claude/plugins/
```

## 빠른 시작

### 1. Feature 작업용 Worktree 생성

```bash
# 에이전트가 자동으로 생성:
"구현 시작해줘 feature/BYU-123-add-login"

# 또는 수동으로:
PROJECT_NAME=$(basename $PWD)
BRANCH_NAME="feature/BYU-123-add-login"
WORKTREE_DIR="../${PROJECT_NAME}-worktrees/${BRANCH_NAME//\//-}"
BASE_BRANCH=$(git branch --show-current)

mkdir -p "../${PROJECT_NAME}-worktrees"
git worktree add -b "$BRANCH_NAME" "$WORKTREE_DIR" "$BASE_BRANCH"
cd "$WORKTREE_DIR"
```

### 2. 환경 파일 링크 (필수)

```bash
# .env, .env.local, google-services.json 등 링크
wt link-env

# 또는 모든 워크트리에 한 번에
wt link-env-all
```

### 3. 의존성 설치

```bash
# 프로젝트 타입 자동 감지
pnpm install    # Node.js
flutter pub get # Flutter
go mod download # Go
cargo fetch     # Rust
poetry install  # Python
```

### 4. 작업 및 커밋

```bash
# 모든 작업은 워크트리에서
git add .
git commit -m "feat: add login feature"
git push -u origin feature/BYU-123-add-login
```

### 5. PR 생성 및 정리

```bash
# PR 생성
gh pr create --title "feature/BYU-123-add-login"

# 머지 후 정리
cd ../my-app  # 원본으로 복귀
git worktree remove ../my-app-worktrees/feature-BYU-123-add-login
```

## Worktree 구조

```
my-app/                                    # 원본 (daily 브랜치, 읽기 전용)
├── .git/
├── (daily/2026-01-26 체크아웃됨)
└── ...

../my-app-worktrees/                       # Worktree 디렉토리 (여기서 작업!)
├── feature-BYU-123-add-auth/              # 이슈 BYU-123 작업
├── feature-BYU-124-fix-ui/                # 이슈 BYU-124 작업
└── fix-BYU-125-login-bug/                 # 이슈 BYU-125 작업
```

## Dev 서버 관리

### 모든 Dev 서버 시작

```bash
wt dev-all
```

### tmux 세션 연결

```bash
wt attach
```

### Worktree 간 전환 (tmux 내에서)

| 키 | 동작 |
|----|------|
| `Ctrl+b, n` | 다음 워크트리 |
| `Ctrl+b, p` | 이전 워크트리 |
| `Ctrl+b, 0-9` | 특정 워크트리로 이동 |
| `Ctrl+b, w` | 모든 워크트리 목록 |
| `Ctrl+b, d` | Detach (서버는 계속 실행) |

### 상태 확인

```bash
wt ls
```

### 서버 중지

```bash
# 모든 서버 중지
wt stop all

# 특정 서버만 중지
wt stop feature-auth
```

## Flutter 개발

### 디버깅 중 Worktree 전환

```bash
# Flutter 워크트리 스위처 시작
wtf

# 또는 디바이스 지정
wtf "iPhone 15 Pro"
```

**wtf 메뉴에서:**
- `1-3` - 워크트리 선택
- `r` - Hot reload
- `R` - Hot restart
- `q` - 종료 후 메뉴로 복귀

### 여러 시뮬레이터 동시 실행

```bash
# 터미널 1: 워크트리 1
cd $(wt cd feature-auth)
flutter run -d "iPhone 15 Pro"

# 터미널 2: 워크트리 2
cd $(wt cd feature-ui)
flutter run -d "iPhone 15"
```

## 디스크 최적화

### 프로젝트 타입별 자동 캐싱

| 타입 | 캐시 위치 | 절감율 |
|------|---|---|
| **Node.js (pnpm)** | 전역 하드링크 | 60%+ |
| **Flutter** | `~/.pub-cache/` | 62% |
| **Go** | `~/.go/pkg/mod/` | 63% |
| **Rust** | `~/.cargo/registry/` | 63% |
| **Python** | `~/.venvs/` | 64% |

### 빌드 캐시 공유

```bash
# 모든 워크트리에서 자동 공유
build/
target/
.next/cache/
.turbo/
__pycache__/
.dart_tool/build/
```

## 에이전트 행동 규칙

| 상황 | 에이전트 행동 |
|------|--------------|
| 구현 작업 시작 | 워크트리 생성 → 해당 디렉토리에서 작업 |
| 워크트리 이미 존재 | 기존 워크트리 재사용 |
| PR 머지 완료 | 워크트리 자동 삭제 |
| 원본 디렉토리 | 읽기 전용 (브랜치 확인, 상태 조회만) |

## 예외 상황

**워크트리 없이 작업** (사용자 명시적 요청):

1. 단순 읽기/분석 (코드 수정 없음)
2. 긴급 핫픽스 (기존 작업 중단)
3. 사용자가 현재 디렉토리에서 작업 명시적 요청

```
⚠️ 현재 디렉토리에서 작업하시겠습니까?

주의: 다른 에이전트가 동시에 작업 중이면 브랜치 충돌이 발생할 수 있습니다.

(yes/no)
```

## 플러그인 구조

```
git-worktree/
├── .claude-plugin/
│   └── plugin.json           # 플러그인 매니페스트
├── skills/
│   └── git-worktree/
│       └── SKILL.md          # Worktree 프로토콜 스킬
├── README.md
└── README.ko.md
```

## 핵심 원칙

### 1. 격리된 워크스페이스

각 에이전트가 독립적인 워크트리를 가져 다음을 방지:
- ❌ 에이전트 A가 에이전트 B의 브랜치에 커밋
- ❌ 여러 에이전트가 같은 디렉토리에서 충돌
- ❌ 브랜치 전환 중 미커밋 변경사항 손실
- ❌ daily 브랜치에 직접 커밋하여 이력 오염

### 2. 환경 파일 (필수)

```bash
# 워크트리 생성 후 반드시 환경 파일 링크
wt link-env

# 지원하는 패턴:
# - .env, .env.*, .env.local, .env.development
# - *.local
# - google-services.json (Firebase Android)
# - GoogleService-Info.plist (Firebase iOS)
# - .secret*
```

### 3. 의존성 설치

프로젝트 타입 자동 감지:

```bash
# Node.js
pnpm install  # 권장 (하드링크, 60%+ 절감)
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

### 4. 깔끔한 워크플로우

```
1. 베이스 브랜치에서 워크트리 생성
2. 환경 파일 링크
3. 의존성 설치
4. 작업 및 커밋
5. 푸시 및 PR 생성
6. 머지 후 워크트리 삭제
```

## 문제 해결

### 빌드 실패: "No file or variants found for asset: .env"

**해결책**: 워크트리 생성 후 `wt link-env` 실행

```bash
cd ../my-app-worktrees/feature-xyz
wt link-env
```

### Worktree 이미 존재

```bash
# 모든 워크트리 목록 확인
git worktree list

# 오래된 워크트리 제거
git worktree remove ../my-app-worktrees/feature-old
```

### 포트 이미 사용 중

```bash
# 포트 할당 현황 확인
wt ports

# 포트의 프로세스 종료
lsof -ti:3000 | xargs kill -9
```

### Symlink 문제

```bash
# Symlink가 깨졌으면 다시 생성
rm -f .env
wt link-env

# 또는 복사 사용 (워크트리별 다른 환경 필요 시)
cp ../.env .env
```

## 모범 사례

1. **구현 작업은 항상 워크트리 사용** - daily/dev 브랜치에 직접 커밋 금지
2. **환경 파일 즉시 링크** - 빌드/dev 서버 실행 전
3. **Node.js는 pnpm 사용** - 최고의 디스크 최적화 (하드링크)
4. **워크트리 재사용** - 같은 브랜치면 삭제 후 재생성 금지
5. **머지 후 정리** - 워크트리 삭제하여 디스크 공간 확보
6. **전환 전 상태 확인** - `wt ls`로 활성 서버 확인

## 라이선스

MIT
