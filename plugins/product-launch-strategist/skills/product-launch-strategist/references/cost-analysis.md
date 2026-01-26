# Cost Analysis Template

## Cost Categories

### Fixed Costs (Monthly)
| Item | Cost | Notes |
|------|------|-------|
| Domain | $1-2 | Annual / 12 |
| Hosting | $5-50 | Vercel, Railway, etc. |
| Database | $0-25 | Supabase, PlanetScale |
| Email service | $0-20 | Resend, Postmark |
| Analytics | $0-10 | Posthog, Mixpanel |
| Monitoring | $0-20 | Sentry, LogRocket |
| **Subtotal** | | |

### Variable Costs (Per User/Usage)
| Item | Unit Cost | Notes |
|------|-----------|-------|
| AI API calls | $0.001-0.05/call | OpenAI, Anthropic |
| Storage | $0.023/GB | S3, R2 |
| Bandwidth | $0.09/GB | CDN |
| Payment processing | 2.9% + $0.30 | Stripe |
| **Per-user estimate** | | |

### One-time Costs
| Item | Cost | Notes |
|------|------|-------|
| Apple Developer | $99/year | If iOS app |
| Google Play | $25 (once) | If Android |
| Legal (LLC/Inc) | $50-500 | State dependent |
| Logo/branding | $0-500 | DIY vs designer |
| **Total** | | |

## Unit Economics

### Customer Acquisition Cost (CAC)
```
CAC = Total Marketing Spend / New Customers

Example:
- Ads: $500
- Content: $200 (time valued)
- New customers: 50
- CAC = $14
```

### Lifetime Value (LTV)
```
LTV = ARPU × Average Customer Lifetime

For subscriptions:
LTV = Monthly Price × (1 / Monthly Churn Rate)

Example:
- Price: $10/month
- Churn: 5%/month
- LTV = $10 × 20 = $200
```

### LTV:CAC Ratio
```
Target: LTV:CAC > 3:1

Example:
- LTV: $200
- CAC: $14
- Ratio: 14:1 ✓ Excellent
```

### Payback Period
```
Payback = CAC / Monthly Revenue per Customer

Example:
- CAC: $14
- Monthly: $10
- Payback: 1.4 months ✓
```

## Break-even Analysis

### Monthly Break-even
```
Break-even Users = Fixed Costs / (Price - Variable Cost per User)

Example:
- Fixed: $100/month
- Price: $10/month
- Variable: $2/user
- Break-even: 100 / (10-2) = 13 users
```

### Runway Calculation
```
Runway (months) = Cash / Monthly Burn

Example:
- Cash: $5,000
- Monthly costs: $200
- Users: 10
- Revenue: $100
- Burn: $100/month
- Runway: 50 months ✓
```

## Indie-specific Considerations

### Time Cost
- Your hourly rate (opportunity cost)
- Include in CAC if doing content/marketing yourself

### Free Tier Economics
```
Free tier cost = Free users × Variable cost per user

Example:
- 1000 free users
- $0.50/user/month (API, storage)
- Free tier cost: $500/month
```

### Scaling Inflection Points
| Users | Typical Cost Jump |
|-------|-------------------|
| 0-100 | Free tiers work |
| 100-1000 | $20-100/month |
| 1000-10000 | $100-500/month |
| 10000+ | Custom pricing needed |

## Output Template

```markdown
## Cost Analysis: [Product]

### Monthly Operating Costs
| Category | Amount |
|----------|--------|
| Fixed | $X |
| Variable (at Y users) | $X |
| **Total** | $X |

### Unit Economics
| Metric | Value | Health |
|--------|-------|--------|
| CAC | $X | |
| LTV | $X | |
| LTV:CAC | X:1 | |
| Payback | X months | |

### Break-even Point
- Users needed: X
- Monthly revenue needed: $X

### Recommendations
- Cost optimization opportunities
- Scaling concerns
- Cash runway assessment
```
