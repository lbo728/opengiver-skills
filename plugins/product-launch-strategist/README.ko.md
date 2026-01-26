# Product Launch Strategist

[English](README.md) | [한국어](README.ko.md)

| | |
|---|---|
| **이름** | product-launch-strategist |
| **설명** | 인디 개발자와 소규모 팀을 위한 제품 출시 전략 어드바이저 |
| **버전** | 1.0.0 |
| **트리거** | "런칭해도 될까?", "가격 정책", "경쟁 분석", "비즈니스 모델 검토" |

---

제품 출시에 대한 전략적 조언을 제공하는 Claude Code 플러그인입니다. 제한된 자원을 가진 인디 개발자와 소규모 팀에 최적화되어 있습니다.

## 기능

- **경쟁 분석**: 시장 포지셔닝, Porter's Five Forces, 차별화 전략
- **가격 전략**: Freemium, SaaS, 일회성 모델 + 가격 심리학 및 벤치마크
- **비용 분석**: 단위 경제학, CAC/LTV 계산, 손익분기점 분석
- **런칭 체크리스트**: 사전/당일/사후 체크리스트
- **리스크 평가**: 리스크 매트릭스, Pre-mortem 연습, Go/No-go 프레임워크

## 설치

### 방법 1: 마켓플레이스 (권장)

```bash
# 1단계: 마켓플레이스 추가
/plugin marketplace add lbo728/opengiver-skills

# 2단계: 플러그인 설치
/plugin install product-launch-strategist@opengiver-skills

# 3단계: Claude Code 재시작
```

### 방법 2: 대화형 UI

```bash
# 플러그인 매니저 열기
/plugin

# "Marketplaces" 탭 → Add → 입력: lbo728/opengiver-skills
# "Discover" 탭 → "product-launch-strategist" 찾기 → Install
```

### 방법 3: 수동 설치

```bash
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/product-launch-strategist ~/.claude/plugins/
```

## 사용법

### 자연어 트리거

**제품 검증**
```
"이 앱 런칭해도 될까?"
"시장에서 먹힐까?"
"Should I launch this app?"
"Is this product ready for market?"
```

**경쟁 분석**
```
"경쟁사 대비 강점이 뭐야?"
"경쟁 분석해줘"
"How do I compare to competitors?"
"Analyze my competitive position"
```

**가격 전략**
```
"가격 정책 어떻게 세워야 해?"
"얼마 받으면 될까?"
"How should I price this?"
"What pricing model should I use?"
```

**비즈니스 모델**
```
"비즈니스 모델 검토해줘"
"수익 모델 분석"
"Review my business model"
"Is this sustainable?"
```

**런칭 준비**
```
"런칭 준비 뭐해야 해?"
"출시 전 체크리스트"
"What do I need before launch?"
"Am I ready to launch?"
```

**리스크 평가**
```
"실패 요인이 뭘까?"
"리스크 분석해줘"
"What could go wrong?"
"What are the risks?"
```

## 분석 프레임워크

### 경쟁 분석
- 빠른 평가 매트릭스
- Porter's Five Forces (간소화 버전)
- 차별화 전략 5가지
- 포지셔닝 스테이트먼트 템플릿

### 가격 모델
- Freemium, 구독, 일회성, 사용량 기반, 하이브리드
- 가격 심리학 (앵커링, 매력적 가격, 디코이 효과)
- 가치 기반, 비용 플러스, 경쟁 기반 가격 계산
- 카테고리별 인디 앱 벤치마크

### 비용 분석
- 고정비 vs 변동비
- CAC, LTV, LTV:CAC 비율
- 손익분기점 계산
- 런웨이 추정

### 런칭 체크리스트
- 사전 준비 (4주 전)
- 런칭 당일 순서
- 런칭 후 (1주차)
- 플랫폼별 팁 (Product Hunt, HN, Reddit)

### 리스크 분석
- 5가지 리스크 카테고리 (시장, 기술, 재무, 실행, 법률)
- 리스크 평가 매트릭스
- Pre-mortem 연습
- Go/No-go 결정 프레임워크

## 결과물 형식

모든 분석에 포함:
1. **Executive Summary** (2-3문장)
2. **Key Findings** (핵심 발견사항)
3. **Recommendations** (우선순위별 권장사항)
4. **Next Steps** (구체적 액션 아이템)

## 플러그인 구조

```
product-launch-strategist/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── product-launch-strategist/
│       ├── SKILL.md
│       └── references/
│           ├── competitive-analysis.md
│           ├── pricing-models.md
│           ├── cost-analysis.md
│           ├── launch-checklist.md
│           └── risk-analysis.md
├── README.md
└── README.ko.md
```

## 라이선스

MIT
