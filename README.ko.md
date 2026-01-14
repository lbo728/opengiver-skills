# Linear Simple Skill

[English](README.md) | [한국어](README.ko.md)

Claude Code용 Linear GraphQL API 플러그인. MCP 없이 curl로 직접 호출하여 토큰 효율성을 50-70% 향상시킵니다.

## 기능

- **이슈 생성**: 제목, 설명, 우선순위 설정
- **이슈 조회**: 식별자로 조회 (예: BYU-125)
- **이슈 업데이트**: 상태 변경 (진행중, 완료 등)
- **댓글 추가**: 이슈에 댓글 달기
- **이슈 삭제**
- **자동 설정**: 단일 명령어로 설정 완료

## 설치

### 방법 1: 마켓플레이스 (권장)

```bash
# 1단계: 마켓플레이스 추가
/plugin marketplace add lbo728/linear-simple-skill

# 2단계: 플러그인 설치
/plugin install linear-simple@opengiver

# 3단계: Claude Code 재시작
```

### 방법 2: UI로 설치

```bash
# 플러그인 매니저 열기
/plugin

# "Marketplaces" 탭 → Add → 입력: lbo728/linear-simple-skill
# "Discover" 탭으로 이동 → "linear-simple" 찾기 → Install
```

### 방법 3: 수동 설치

```bash
# 저장소 클론 후 스킬 디렉토리로 복사
git clone https://github.com/lbo728/linear-simple-skill.git
cp -r linear-simple-skill/plugins/linear-simple ~/.claude/plugins/
```

## 설정 (필수)

설치 후 Linear API를 설정하세요:

### 옵션 1: 슬래시 명령어
```bash
/linear-simple:setup
```

### 옵션 2: 자연어
```
"Linear 설정해줘"
"Linear API 연동해줘"
```

Claude가 자동으로:
1. Linear API 키를 요청합니다 (Linear 설정 > API에서 발급)
2. 팀 정보를 자동으로 가져옵니다
3. `~/.config/linear-simple/config`에 설정을 저장합니다

## 사용법

### 슬래시 명령어
```bash
/linear-simple:setup                        # API 설정
/linear-simple:get BYU-125                  # 이슈 상세 조회
/linear-simple:list                         # 최근 이슈 목록 (개수 물어봄)
/linear-simple:list 10                      # 최근 10개 이슈 목록
/linear-simple:create "API 버그 수정"        # 새 이슈 생성
/linear-simple:status BYU-125 "In Progress" # 상태 변경
/linear-simple:comment BYU-125 "완료!"       # 댓글 추가
```

### 자연어

**이슈 조회**
```
"BYU-125 조회해줘"
"BYU-125 이슈 보여줘"
"BYU-125 상태가 뭐야?"
```

**이슈 목록**
```
"최근 10개 이슈 보여줘"
"이슈 5개만 보여줘"
"이슈 리스트 보여줘"
```

**이슈 생성**
```
"이슈 만들어줘: API 버그 수정"
"'문서 업데이트' 제목으로 이슈 생성해줘"
"새 이슈 추가해줘: 로그인 모듈 리팩토링"
```

**상태 변경**
```
"BYU-125 상태를 진행중으로 바꿔줘"
"BYU-125 완료로 변경해줘"
"BYU-125 리뷰중으로 설정해"
```

**댓글 추가**
```
"BYU-125에 '작업 시작' 댓글 달아줘"
"BYU-125에 코멘트 남겨줘: 수정 완료"
"BYU-125에 '추가 정보 필요' 댓글 달아"
```

두 방식 모두 사용 가능합니다!

## 토큰 효율성: MCP vs Skill

| 방식 | 토큰 (10회 작업) |
|------|------------------|
| MCP | ~570,000 토큰 |
| Skill | ~520,000 토큰 |
| **절감** | **~50,000 토큰 (9%)** |

긴 대화에서는 효율성이 크게 증가합니다 (최대 99% 절감).

## 설정 파일

설정 파일 위치: `~/.config/linear-simple/config`

포함 내용:
- `LINEAR_API_KEY` - Linear API 키
- `LINEAR_TEAM_ID` - 팀 UUID
- `LINEAR_TEAM_KEY` - 팀 키 (예: BYU)

재설정하려면 `/linear-simple:setup`을 다시 실행하세요.

## 저장소 구조

```
linear-simple-skill/
├── .claude-plugin/
│   └── marketplace.json          # 마켓플레이스 레지스트리
├── plugins/
│   └── linear-simple/
│       ├── .claude-plugin/
│       │   └── plugin.json       # 플러그인 매니페스트
│       ├── commands/
│       │   ├── setup.md          # /linear-simple:setup
│       │   ├── get.md            # /linear-simple:get
│       │   ├── list.md           # /linear-simple:list
│       │   ├── create.md         # /linear-simple:create
│       │   ├── status.md         # /linear-simple:status
│       │   └── comment.md        # /linear-simple:comment
│       └── skills/
│           └── linear-simple/
│               ├── SKILL.md      # 자연어 스킬
│               └── references/
│                   └── graphql-patterns.md
├── README.md
└── README.ko.md
```

## 라이선스

MIT
