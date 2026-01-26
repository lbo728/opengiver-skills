# Pricing Models Framework

## Common Pricing Models

### 1. Freemium
- **Structure**: Free tier + paid upgrade
- **Best for**: Products with viral potential, low marginal cost
- **Conversion target**: 2-5% free-to-paid
- **Risk**: Free tier cannibalizes paid

### 2. Subscription (SaaS)
- **Structure**: Monthly/annual recurring
- **Best for**: Continuous value delivery, regular updates
- **Annual discount**: 15-20% (2 months free)
- **Risk**: High churn if value not sustained

### 3. One-time Purchase
- **Structure**: Pay once, own forever
- **Best for**: Tools, utilities, games
- **Typical range**: $5-$99 for indie apps
- **Risk**: No recurring revenue, requires new customers

### 4. Usage-based
- **Structure**: Pay per use (API calls, storage, etc.)
- **Best for**: Variable usage patterns, B2B
- **Risk**: Unpredictable revenue, cost spikes scare users

### 5. Hybrid
- **Structure**: Base subscription + usage overage
- **Example**: $10/mo includes 1000 calls, $0.01 per additional
- **Best for**: Balancing predictability with scalability

## Pricing Psychology

### Anchoring
- Show higher price first, then actual price
- "Was $99, now $49"

### Charm Pricing
- $9.99 vs $10 (works for consumer, not B2B)
- B2B prefers round numbers: $100/mo

### Decoy Effect
| Plan | Price | Features |
|------|-------|----------|
| Basic | $9 | 100 items |
| **Pro** | $19 | Unlimited + extras |
| Enterprise | $49 | Custom |

Pro looks best value (decoy: Basic)

### Price Tiers (Rule of 3)
1. **Starter**: Entry point, limited
2. **Pro**: Most popular, best value (highlight this)
3. **Enterprise**: Custom, high-touch

## Pricing Calculation

### Value-based Pricing
```
Price = (User Value Gained) × (Capture Rate)

Example:
- User saves 10 hours/month
- User's hourly value: $50
- Total value: $500/month
- Capture rate: 10-20%
- Price: $50-100/month
```

### Cost-plus Pricing
```
Price = (Cost per User) × (1 + Margin)

Example:
- Server cost: $2/user/month
- API costs: $3/user/month
- Target margin: 70%
- Price: $5 × 2.3 = ~$12/month minimum
```

### Competitive Pricing
```
Price = Competitor Price × (Value Multiplier)

If 20% better features: +10-20% price
If 20% simpler/faster: same or +5-10%
If fewer features but focused: -20-30%
```

## Indie App Benchmarks

| Category | Typical Monthly | Typical One-time |
|----------|-----------------|------------------|
| Utility app | $3-9 | $9-29 |
| Productivity tool | $5-15 | $19-49 |
| Developer tool | $10-30 | $29-99 |
| Design tool | $10-20 | $29-79 |
| AI-powered app | $10-30 | Rare |

## Common Mistakes

- Pricing too low (undervaluing)
- Too many tiers (analysis paralysis)
- No annual option (leaves money on table)
- Free tier too generous
- Enterprise-only pricing for indie product

## Output Template

```markdown
## Pricing Recommendation: [Product]

### Recommended Model
[Model type with reasoning]

### Suggested Tiers
| Tier | Price | Target User | Key Features |
|------|-------|-------------|--------------|

### Justification
- Value analysis:
- Cost floor:
- Competitive context:

### Implementation Notes
- Launch discount strategy
- Grandfathering policy
- Price increase roadmap
```
