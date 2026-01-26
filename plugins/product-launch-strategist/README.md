# Product Launch Strategist

[English](README.md) | [한국어](README.ko.md)

| | |
|---|---|
| **Name** | product-launch-strategist |
| **Description** | Product launch strategy advisor for indie developers and small teams |
| **Version** | 1.0.0 |
| **Triggers** | "Should I launch this?", "pricing strategy", "competitive analysis", "비즈니스 모델 검토" |

---

A Claude Code plugin that provides strategic advice for product launches. Optimized for indie developers and small teams with limited resources.

## Features

- **Competitive Analysis**: Market positioning, Porter's Five Forces, differentiation strategies
- **Pricing Strategy**: Freemium, SaaS, one-time models with psychology and benchmarks
- **Cost Analysis**: Unit economics, CAC/LTV calculation, break-even analysis
- **Launch Checklist**: Pre-launch, launch day, post-launch checklists
- **Risk Assessment**: Risk matrix, pre-mortem exercise, go/no-go framework

## Installation

### Method 1: Marketplace (Recommended)

```bash
# Step 1: Add the marketplace
/plugin marketplace add lbo728/opengiver-skills

# Step 2: Install the plugin
/plugin install product-launch-strategist@opengiver-skills

# Step 3: Restart Claude Code
```

### Method 2: Interactive UI

```bash
# Open plugin manager
/plugin

# Navigate to "Marketplaces" tab → Add → Enter: lbo728/opengiver-skills
# Then go to "Discover" tab → Find "product-launch-strategist" → Install
```

### Method 3: Manual Installation

```bash
git clone https://github.com/lbo728/opengiver-skills.git
cp -r opengiver-skills/plugins/product-launch-strategist ~/.claude/plugins/
```

## Usage

### Natural Language Triggers

**Product Viability**
```
"Should I launch this app?"
"Is this product ready for market?"
"이 앱 런칭해도 될까?"
"시장에서 먹힐까?"
```

**Competitive Analysis**
```
"How do I compare to competitors?"
"Analyze my competitive position"
"경쟁사 대비 강점이 뭐야?"
"경쟁 분석해줘"
```

**Pricing Strategy**
```
"How should I price this?"
"What pricing model should I use?"
"가격 정책 어떻게 세워야 해?"
"얼마 받으면 될까?"
```

**Business Model**
```
"Review my business model"
"Is this sustainable?"
"비즈니스 모델 검토해줘"
"수익 모델 분석"
```

**Launch Planning**
```
"What do I need before launch?"
"Am I ready to launch?"
"런칭 준비 뭐해야 해?"
"출시 전 체크리스트"
```

**Risk Assessment**
```
"What could go wrong?"
"What are the risks?"
"실패 요인이 뭘까?"
"리스크 분석해줘"
```

## Analysis Frameworks

### Competitive Analysis
- Quick Assessment Matrix
- Porter's Five Forces (Simplified)
- Differentiation Strategies
- Positioning Statement Template

### Pricing Models
- Freemium, Subscription, One-time, Usage-based, Hybrid
- Pricing Psychology (Anchoring, Charm Pricing, Decoy Effect)
- Value-based, Cost-plus, Competitive pricing calculations
- Indie App Benchmarks by category

### Cost Analysis
- Fixed vs Variable costs
- CAC, LTV, LTV:CAC ratio
- Break-even calculation
- Runway estimation

### Launch Checklist
- Pre-launch (4 weeks before)
- Launch day sequence
- Post-launch (week 1)
- Platform-specific tips (Product Hunt, HN, Reddit)

### Risk Analysis
- 5 risk categories (Market, Technical, Financial, Execution, Legal)
- Risk assessment matrix
- Pre-mortem exercise
- Go/No-go decision framework

## Output Format

All analyses include:
1. **Executive Summary** (2-3 sentences)
2. **Key Findings** (bullet points)
3. **Recommendations** (prioritized actions)
4. **Next Steps** (specific, actionable items)

## Plugin Structure

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

## License

MIT
