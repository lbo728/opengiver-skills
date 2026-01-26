# Risk Analysis Framework

## Risk Categories

### 1. Market Risk
- **No demand**: People don't need this
- **Timing**: Too early or too late
- **Competition**: Market saturated
- **Signals**: Low search volume, no existing solutions, failed predecessors

### 2. Technical Risk
- **Feasibility**: Can it be built?
- **Scalability**: Can it handle growth?
- **Dependencies**: Third-party API reliance
- **Signals**: Novel tech required, single points of failure

### 3. Financial Risk
- **Runway**: Cash runs out before traction
- **Unit economics**: Unprofitable at scale
- **Pricing**: Can't charge enough
- **Signals**: High fixed costs, low willingness to pay

### 4. Execution Risk
- **Time**: Takes too long to build
- **Scope creep**: Feature bloat
- **Burnout**: Unsustainable pace
- **Signals**: Solo founder, full-time job, complex MVP

### 5. Legal/Regulatory Risk
- **Compliance**: GDPR, HIPAA, etc.
- **IP issues**: Patent, trademark risks
- **Platform risk**: App Store rejection, API ToS
- **Signals**: Regulated industry, working with sensitive data

## Risk Assessment Matrix

| Risk | Likelihood | Impact | Score | Mitigation |
|------|------------|--------|-------|------------|
| | Low/Med/High | Low/Med/High | L×I | |

**Scoring**:
- Low: 1, Medium: 2, High: 3
- Score = Likelihood × Impact
- Score > 6: Critical, needs mitigation
- Score 4-6: Monitor closely
- Score < 4: Accept

## Common Indie Product Risks

### API Dependency Risk
| Provider | Risk Level | Mitigation |
|----------|------------|------------|
| OpenAI | High | Anthropic fallback, local models |
| Firebase | Medium | Data export plan |
| Stripe | Low | Well-documented, alternatives exist |
| AWS S3 | Low | Standard API, R2/Cloudflare |

### Platform Risk
| Platform | Risk | Mitigation |
|----------|------|------------|
| iOS App Store | Rejection, 30% cut | Web fallback, PWA |
| Chrome Web Store | Policy changes | Self-hosted option |
| Twitter API | Rate limits, pricing | Cache, multiple accounts |
| Reddit API | Recent pricing changes | RSS fallback |

### Founder Risk (Solo)
- Single point of failure
- Burnout without support
- Skill gaps (design, marketing)
- **Mitigation**: Automate, outsource, pace yourself

## Pre-mortem Exercise

> "It's 6 months from now. The product failed. Why?"

List top 5 reasons:
1. 
2. 
3. 
4. 
5. 

For each, identify:
- Early warning signs
- Preventive actions
- Contingency plan

## Risk Mitigation Strategies

### Validate Before Building
- [ ] Talk to 10 potential users
- [ ] Fake door test / landing page
- [ ] Competitor analysis complete
- [ ] Search volume/trend check

### Technical Safeguards
- [ ] Fallback providers identified
- [ ] Data export functionality
- [ ] Monitoring and alerts
- [ ] Rollback capability

### Financial Buffers
- [ ] 6+ month runway
- [ ] Variable cost model
- [ ] Revenue before scaling

### Execution Guardrails
- [ ] MVP scope defined and locked
- [ ] Launch date set
- [ ] Accountability (public or partner)
- [ ] Sustainable work schedule

## Red Flags Checklist

Stop and reconsider if:
- [ ] Can't articulate target user clearly
- [ ] "Everyone" is the target market
- [ ] No existing solutions (might mean no demand)
- [ ] Requires behavior change
- [ ] Depends on network effects for MVP
- [ ] Needs viral growth to break even
- [ ] Core value requires huge scale
- [ ] You're not excited after research

## Output Template

```markdown
## Risk Assessment: [Product]

### Risk Summary
| Category | Top Risk | Score | Status |
|----------|----------|-------|--------|
| Market | | | |
| Technical | | | |
| Financial | | | |
| Execution | | | |
| Legal | | | |

### Critical Risks (Score > 6)
1. **[Risk]**: [Description]
   - Mitigation: [Action]
   - Contingency: [Backup plan]

### Pre-mortem: Top Failure Scenarios
1. [Scenario]: [Prevention]
2. [Scenario]: [Prevention]

### Go/No-go Recommendation
[Recommendation with conditions]
```

## Decision Framework

| Signal | Go | Caution | No-go |
|--------|------|---------|-------|
| Market validation | 5+ paying intents | Interest but no commit | No interest |
| Competition | Gap exists | Crowded but differentiatable | Dominated by big player |
| Technical | Proven stack | Some unknowns | Major R&D needed |
| Financial | 12mo+ runway | 6mo runway | 3mo runway |
| Founder fit | Excited + skilled | Skilled but uncertain | Neither |
