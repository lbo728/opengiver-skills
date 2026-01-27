# Opengiver Skills

[English](README.md) | [한국어](README.ko.md)

Claude Code를 위한 생산성 플러그인 모음. 프로젝트 관리, 콘텐츠 제작, 워크플로우 최적화를 위한 AI 자동화 도구입니다.

**기여를 환영합니다!** 플러그인 개선 아이디어가 있거나 새 플러그인을 추가하고 싶으시면 [PR을 보내주세요](#기여하기).

## 플러그인이란?

플러그인은 Claude Code의 기능을 확장하는 전문 도구입니다. 각 플러그인은 특정 작업을 위한 명령어, 스킬, 워크플로우를 제공합니다. 설치하면 Claude Code가 관련 작업을 인식하고 적절한 도구를 자동으로 적용합니다.

## 사용 가능한 플러그인

| 플러그인 | 설명 | 명령어 |
|----------|------|--------|
| [linear-simple](plugins/linear-simple) | 이슈 관리를 위한 Linear GraphQL API | `/linear-simple:setup`, `/linear-simple:get`, `/linear-simple:create` |
| [blog-material-gen](plugins/blog-material-gen) | Git 브랜치에서 Notion으로 블로그 소재 자동 생성 | `/blog-material-gen:setup`, `/blog-material-gen` |
| [product-launch-strategist](plugins/product-launch-strategist) | 인디 개발자를 위한 제품 출시 전략 어드바이저 | `/product-launch-strategist:analyze`, `:pricing`, `:risk` |
| [git-worktree](plugins/git-worktree) | 격리된 작업 공간으로 안전한 병렬 개발을 위한 Git 워크트리 프로토콜 | 스킬 전용 (명령어 없음) |
| [db-safety](plugins/db-safety) | 실수로 인한 데이터 손실을 방지하는 데이터베이스 안전 프로토콜 | 스킬 전용 (명령어 없음) |

## 설치

### 방법 1: Claude Code 플러그인 (권장)

Claude Code의 내장 플러그인 시스템으로 설치:

```bash
# 마켓플레이스 추가
/plugin marketplace add lbo728/opengiver-skills

# 특정 플러그인 설치
/plugin install linear-simple@opengiver-skills
/plugin install blog-material-gen@opengiver-skills
/plugin install product-launch-strategist@opengiver-skills
```

### 방법 2: UI로 설치

```bash
# 플러그인 매니저 열기
/plugin

# "Marketplaces" 탭 → Add → 입력: lbo728/opengiver-skills
# "Discover" 탭으로 이동 → 플러그인 찾기 → Install
```

### 방법 3: 저장소 클론

전체 레포를 클론하여 plugins 폴더 복사:

```bash
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/* ~/.claude/plugins/
```

## 플러그인 상세

### linear-simple

MCP 없이 Linear GraphQL API를 직접 호출하여 토큰 효율성을 50-70% 향상.

**기능:**
- 이슈 CRUD (생성, 조회, 수정, 삭제)
- 댓글 관리
- 상태 업데이트
- PR + Linear 동기화

**설정:**
```bash
/linear-simple:setup
```

[전체 문서 보기 →](plugins/linear-simple/README.ko.md)

---

### blog-material-gen

Daily Git 브랜치를 자동 분석하여 Notion 데이터베이스에 블로그 소재 생성.

**기능:**
- Git 브랜치/커밋 분석
- Notion 페이지 자동 생성
- 민감 정보 마스킹
- Slack 알림 (선택)

**설정:**
```bash
/blog-material-gen:setup
```

[전체 문서 보기 →](plugins/blog-material-gen/README.ko.md)

---

### product-launch-strategist

인디 개발자와 소규모 팀을 위한 제품 출시 전략 어드바이저.

**기능:**
- 경쟁 분석 (Porter's 5 Forces, 차별화 전략)
- 가격 전략 (Freemium, SaaS, 벤치마크)
- 비용 분석 (CAC/LTV, 손익분기점)
- 런칭 체크리스트 (사전/당일/사후)
- 리스크 평가 (매트릭스, Pre-mortem)

**트리거:**
```
"이 앱 런칭해도 될까?"
"가격 정책 어떻게 세워야 해?"
"경쟁사 대비 강점이 뭐야?"
"비즈니스 모델 검토해줘"
```

[전체 문서 보기 →](plugins/product-launch-strategist/README.ko.md)

---

### git-worktree

격리된 작업 공간으로 안전한 병렬 개발을 위한 Git 워크트리 프로토콜.

**기능:**
- 각 기능/수정 브랜치별 격리된 워크트리 디렉토리
- .env 파일 및 시크릿 자동 관리
- `wt` CLI를 통한 개발 서버 관리
- 모바일 개발을 위한 Flutter 워크트리 스위처 (`wtf`)
- 공유 빌드 캐시를 통한 디스크 최적화
- PR 머지 후 자동 정리

**트리거:**
```
"워크트리"
"wt"
"구현 시작"
"작업 시작"
"병렬 개발"
"feature 브랜치"
```

[전체 문서 보기 →](plugins/git-worktree/README.ko.md)

---

### db-safety

실수로 인한 데이터 손실을 방지하고 안전한 마이그레이션을 강제하는 데이터베이스 안전 프로토콜.

**기능:**
- 위험한 작업 차단 (DROP, ALTER, DELETE, TRUNCATE)
- 안전한 SQL 쿼리 가이드 (안전/위험 패턴)
- 안전한 마이그레이션 패턴 (3단계 삭제, Expand-Contract)
- 위험 수준 분류 (LOW, MEDIUM, HIGH, CRITICAL)
- 환경 분리 (Dev DB vs. Prod DB)
- 마이그레이션 실패 시 롤백 절차

**트리거:**
```
"DROP TABLE"
"ALTER COLUMN"
"DELETE FROM"
"마이그레이션"
"SQL"
"위험한 작업"
```

[전체 문서 보기 →](plugins/db-safety/README.ko.md)

## 저장소 구조

```
opengiver-skills/
├── .claude-plugin/
│   └── marketplace.json          # 마켓플레이스 레지스트리
├── plugins/
│   ├── linear-simple/            # Linear API 플러그인
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   ├── blog-material-gen/        # 블로그 소재 생성 플러그인
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   ├── scripts/
│   │   └── README.md
│   ├── product-launch-strategist/ # 제품 출시 전략 플러그인
│   │   ├── .claude-plugin/
│   │   ├── commands/
│   │   ├── skills/
│   │   └── README.md
│   ├── git-worktree/             # Git 워크트리 프로토콜 플러그인
│   │   ├── .claude-plugin/
│   │   ├── skills/
│   │   └── README.md
│   └── db-safety/                # 데이터베이스 안전 프로토콜 플러그인
│       ├── .claude-plugin/
│       ├── skills/
│       └── README.md
├── README.md
└── README.ko.md
```

## 기여하기

플러그인 개선 방법을 찾으셨나요? 새 플러그인을 제안하고 싶으신가요? PR과 이슈를 환영합니다!

**기여 아이디어:**
- 기존 플러그인 설명 개선
- 기존 플러그인에 새 기능 추가
- 버그 수정 또는 문서 명확화
- 새 플러그인 제안 (먼저 이슈로 논의)

**기여 방법:**

1. 레포 Fork
2. 새 브랜치 생성
3. 변경 사항 작성
4. 명확한 설명과 함께 PR 제출

### 플러그인 구조

각 플러그인은 다음 구조를 따릅니다:

```
plugins/
  plugin-name/
    .claude-plugin/
      plugin.json           # 플러그인 매니페스트
    commands/
      setup.md              # /plugin-name:setup
      command.md            # /plugin-name:command
    skills/
      plugin-name/
        SKILL.md            # 자연어 스킬
    README.md               # 플러그인 문서
    README.ko.md            # 한글 문서
```

## 라이선스

MIT - 자유롭게 사용하세요.
