# QLens AI — Final PRD SaaS Production

**Document Type:** Product Requirements Document (PRD)  
**Product Name:** QLens AI  
**Version:** v1.4 Final Production Readiness Audit + Security Hardening  
**Status:** Final PRD for SaaS Build Planning  
**Owner:** FolksyDEV / QLens AI  
**Last Updated:** 2026-06-24  
**Core Product:** AI API Gateway untuk menjual akses ke infrastruktur model internal QLens melalui API key, billing, quota, top up token, usage tracking, OpenAI-compatible API, Anthropic-compatible API, dan anti-abuse system.

---

## 0. Executive Summary

QLens AI adalah SaaS API gateway untuk menjual akses ke **infrastruktur model internal QLens**. Produk ini diposisikan sebagai layanan AI API modern untuk developer, pengguna coding agent, automation builder, dan user teknis yang butuh endpoint AI stabil, murah, transparan, dan gampang dipasang ke berbagai tools.

Produk ini bukan reseller marketplace, bukan dashboard untuk orang lain menjual akses mereka sendiri, dan bukan panel sharing akun. QLens AI adalah **official model access gateway** milik QLens.

QLens AI wajib mendukung dua compatibility layer:

1. **OpenAI-Compatible API**
2. **Anthropic-Compatible API**

Dengan dua mode ini, user bisa memakai QLens AI di banyak tools seperti Cline, Roo Code, Aider, Continue, OpenCode, Hermes Agent, LiteLLM, LangChain, OpenAI SDK, Anthropic SDK, dan tool lain yang mendukung custom base URL.

Core flow:

```text
User daftar
↓
Verifikasi akun
↓
Pilih Free Trial / Plan / Top Up Token
↓
Generate API key dengan format qlens-sk-
↓
Pakai OpenAI-compatible atau Anthropic-compatible endpoint
↓
Request masuk ke QLens AI Gateway
↓
Gateway validasi API key, quota, model, rate limit, dan risk score
↓
Request diteruskan ke infrastruktur model internal QLens
↓
Response dikembalikan ke user
↓
Usage dicatat
↓
Quota/token/top up balance dipotong otomatis
↓
Admin memantau revenue, usage, model health, abuse, payment, dan logs
```

---

## 1. Product Definition

### 1.1 Produk

**QLens AI** adalah platform SaaS untuk menjual akses API ke infrastruktur model internal QLens melalui:

- API key user
- billing plan
- token quota
- top up token
- usage dashboard
- OpenAI-compatible endpoint
- Anthropic-compatible endpoint
- AI tools integration docs
- admin dashboard
- model health monitoring
- anti-abuse protection

### 1.2 Nilai Utama

QLens AI menjual:

- akses ke QLens AI Gateway
- token quota
- top up token
- API request access
- model access sesuai plan
- priority access
- rate limit lebih tinggi
- stable API endpoint
- usage transparency
- dokumentasi integrasi untuk tools developer dan agent

### 1.3 Yang Bukan Produk Ini

QLens AI **bukan**:

- marketplace reseller
- panel untuk menjual layanan pihak ketiga
- sistem white-label untuk banyak owner
- panel sharing akun
- proxy publik bebas pakai
- layanan abuse automation
- alat untuk bypass limit provider
- alat untuk mass account farming

### 1.4 Positioning

> QLens AI adalah AI API Gateway dengan satu API key `qlens-sk-`, kompatibel dengan OpenAI dan Anthropic, siap dipakai untuk coding agents, automation, dan custom AI apps.

### 1.5 Main Tagline

**“One QLens Key for AI Agents, Automation, and Apps.”**

Alternatif:

- “OpenAI & Anthropic Compatible AI Gateway.”
- “Stable AI API for Builders.”
- “Akses model QLens lewat satu API key.”
- “Your AI Gateway for coding agents and automation.”

---

## 2. Goals, Non-Goals, and Success Criteria

### 2.1 Primary Goals

QLens AI harus memungkinkan user untuk:

1. Membuat akun.
2. Verifikasi email.
3. Melihat pricing.
4. Memilih plan atau top up token.
5. Membuat API key dengan format `qlens-sk-`.
6. Memakai endpoint OpenAI-compatible.
7. Memakai endpoint Anthropic-compatible.
8. Melihat usage token.
9. Melihat sisa daily quota.
10. Melihat sisa monthly quota.
11. Melihat top up token balance.
12. Upgrade plan atau beli token tambahan.
13. Menggunakan QLens AI di AI coding tools, agent tools, dan custom apps.

Admin harus bisa:

1. Melihat user.
2. Melihat payment.
3. Mengatur plan.
4. Mengatur model.
5. Mengatur model access per plan.
6. Melihat request logs.
7. Melihat usage logs.
8. Melihat model health.
9. Suspend/restrict user.
10. Revoke API key.
11. Monitor abuse.
12. Manage top up/manual credit.
13. Melihat revenue, token consumption, dan margin estimate.

### 2.2 Non-Goals Untuk MVP

Jangan masukkan ke MVP pertama:

- reseller marketplace
- VCC panel
- proxy panel publik
- account sharing
- complex affiliate system
- white-label tenant
- multi-owner system
- public model marketplace
- enterprise SSO
- native mobile app
- crypto payment
- complex tax/accounting automation
- fitur yang rawan dipakai abuse

### 2.3 Success Criteria

MVP dianggap sukses jika:

| Area | Target |
|---|---:|
| Time to first successful API call | < 5 menit setelah register |
| API key creation | < 10 detik |
| Dashboard load | < 2 detik p95 |
| API gateway overhead | < 800 ms p95 di luar model latency |
| API success rate | > 95% saat model infrastructure healthy |
| Usage logging accuracy | 99%+ |
| Quota deduction consistency | 99%+ |
| Payment activation | otomatis via webhook |
| Abuse free trial reduction | bulk/free farming terdeteksi cepat |
| Admin visibility | 100% request penting tercatat |
| User transparency | user bisa lihat quota, top up balance, dan usage |

---

## 3. Target Users

### 3.1 Developer / Indie Hacker

Needs:

- API murah
- cepat setup
- bisa dipakai dengan OpenAI SDK
- bisa dipakai dengan Anthropic-style clients
- usage jelas
- billing transparan

### 3.2 AI Coding Agent User

Tools yang dipakai:

- Cline
- Roo Code
- Aider
- Continue
- OpenCode
- Hermes Agent
- Claude Code compatible setup
- Codex CLI compatible setup
- LiteLLM

Needs:

- base URL custom
- API key custom
- streaming response
- model coding
- stable endpoint
- rate limit jelas
- top up token saat quota habis

### 3.3 Automation Builder

Needs:

- API untuk workflow automation
- predictable quota
- top up fleksibel
- logs per request
- stable response
- easy SDK integration

### 3.4 Student / Casual User

Needs:

- free trial kecil
- setup gampang
- pricing murah
- docs jelas
- limit transparan

### 3.5 Admin / Owner

Needs:

- menjual akses QLens AI Gateway
- kontrol plan
- kontrol quota
- monitor revenue
- monitor abuse
- monitor model health
- lihat margin
- scale bertahap tanpa rugi

---

## 4. Product Scope

### 4.1 MVP Production Scope

MVP production wajib punya:

- Landing page
- Pricing page
- Docs page
- Status page basic
- Register/login/logout
- Email verification
- User dashboard
- API key management
- API key format `qlens-sk-`
- OpenAI-compatible `/v1/chat/completions` and future `/v1/responses`
- Anthropic-compatible `/v1/messages`
- `/v1/models`
- Streaming support
- User usage dashboard
- Plan quota
- Top up token balance
- Auto fallback ke top up token saat daily quota mentok
- Payment/invoice system
- Payment webhook
- Admin dashboard
- User management
- Plan management
- Model management
- Request logs
- Usage logs
- Model health status
- Basic abuse monitor
- Free plan anti-abuse
- Rate limiting
- API key hashing
- Secret encryption
- Audit logs
- Error monitoring
- Backup strategy

### 4.2 Post-MVP Scope

Setelah MVP stabil:

- Public status page detail
- Referral system
- Affiliate basic
- Team accounts
- Enterprise custom quota
- Advanced analytics
- Cost/margin dashboard
- Advanced abuse scoring
- Multi-route model fallback
- SLA page
- Admin notification bot
- Auto incident alert
- SDK wrapper QLens
- Better docs and onboarding

---

## 5. Core User Flow

### 5.1 New User Flow

```text
Landing Page
↓
Click Get API Key
↓
Register
↓
Email verification
↓
Dashboard onboarding
↓
Free trial quota activated if risk score safe
↓
Create API key qlens-sk-
↓
Copy setup config
↓
Use in AI tool
↓
First API call success
↓
Usage dashboard updates
```

### 5.2 Paid User Flow

```text
User login
↓
Open Pricing / Billing
↓
Choose Plan or Top Up Token
↓
Payment created
↓
User pays via QRIS/VA/e-wallet/payment method
↓
Payment webhook confirms success
↓
Plan/token activated
↓
User receives invoice
↓
Usage continues with larger quota
```

### 5.3 Quota Exhausted Flow

```text
User sends API request
↓
Daily plan quota already reached
↓
System checks top up token balance
↓
If top up balance is enough:
    request allowed
    token usage deducted from top up balance
Else:
    request blocked
    return quota exceeded error
    dashboard shows upgrade/top up CTA
```

### 5.4 Admin Flow

```text
Admin login
↓
Open Admin Overview
↓
Check revenue, model status, total tokens, error rate
↓
Open Abuse Monitor
↓
Review suspicious accounts
↓
Restrict/suspend/revoke if needed
↓
Open Payment Logs
↓
Verify transactions
↓
Open Usage Logs
↓
Analyze model demand and capacity
```

---

## 6. Landing Page Requirements

### 6.1 Navigation

Top nav:

- Home
- Pricing
- Models
- Docs
- Status
- Login
- Get API Key

### 6.2 Hero Section

Required copy direction:

```text
QLens AI
OpenAI & Anthropic Compatible AI Gateway

Satu API key untuk akses model QLens.
Pakai di coding agents, automation tools, dan custom AI apps dengan endpoint stabil, usage dashboard, dan top up token fleksibel.
```

CTA:

- Get API Key
- View Docs
- See Pricing

### 6.3 Feature Cards

Cards:

1. OpenAI-Compatible API
2. Anthropic-Compatible API
3. One QLens API Key
4. Streaming Support
5. Usage Dashboard
6. Top Up Token
7. Works With Coding Agents
8. Stable API Endpoint
9. Token Quota Control
10. Anti-Abuse Protected
11. Model Access by Plan
12. Request Logs

### 6.4 Compatibility Section

OpenAI-compatible tools:

- Cline
- Roo Code
- Aider
- Continue
- OpenCode
- Hermes Agent
- Codex CLI compatible setup
- 9Router custom provider
- OpenAI SDK
- LangChain OpenAI adapter
- LiteLLM OpenAI mode
- Custom Node.js app
- Custom Python app

Anthropic-compatible tools:

- Claude Code compatible setup
- Anthropic SDK
- Anthropic Messages API clients
- Cline Anthropic provider mode
- Roo Code Anthropic provider mode
- Continue Anthropic provider mode
- LiteLLM Anthropic mode
- LangChain Anthropic adapter
- OpenCode Anthropic setup
- Agent tools using `ANTHROPIC_API_KEY`
- Agent tools with custom Anthropic base URL support

Important copy:

```text
Compatibility depends on whether each tool supports custom API base URL. QLens AI provides both OpenAI-style and Anthropic-style endpoints so integration can follow the tool's supported mode.
```

### 6.5 Pricing Preview

Pricing cards:

- Free Trial
- Starter
- Pro
- Max
- Custom
- Top Up Token

### 6.6 Trust & Transparency Section

Must include:

- API usage logs
- transparent quota
- top up balance
- request status
- model health
- fair use policy
- no hidden deduction
- clear quota rules

---

## 7. User Dashboard Requirements

### 7.1 Dashboard Navigation

User sidebar:

- Overview
- API Keys
- Usage
- Models
- Billing
- Top Up Token
- Documentation
- Settings
- Support

### 7.2 Overview Cards

Cards:

- Current Plan
- Daily Quota Used
- Monthly Quota Used
- Top Up Token Balance
- Requests Today
- Active API Keys
- API Success Rate
- Current Base URLs

### 7.3 Base URL Display

OpenAI mode:

```env
OPENAI_BASE_URL=https://api.qlens.ai/v1
OPENAI_API_KEY=qlens-sk-live_xxxxx
OPENAI_MODEL=qlens-fast
```

Anthropic mode:

```env
ANTHROPIC_BASE_URL=https://api.qlens.ai
ANTHROPIC_API_KEY=qlens-sk-live_xxxxx
ANTHROPIC_MODEL=qlens-claude-compatible
```

### 7.4 Quick Start Snippets

Dashboard must show snippets for:

- cURL OpenAI-compatible
- cURL Anthropic-compatible
- Node.js OpenAI SDK
- Python OpenAI SDK
- Anthropic SDK
- LiteLLM
- Cline
- Roo Code
- Aider
- Continue
- Hermes Agent

### 7.5 User Settings

User can manage:

- email
- password
- 2FA optional
- API key notifications
- usage alert threshold
- billing email
- delete account request
- session logout all devices

---

## 8. API Key System

### 8.1 API Key Format

All keys must use:

```text
qlens-sk-live_xxxxxxxxxxxxxxxxxxxxxxxxx
qlens-sk-test_xxxxxxxxxxxxxxxxxxxxxxxxx
```

Rules:

- Prefix must be `qlens-sk-`.
- Environment can be `live` or `test`.
- Full key appears only once when created.
- Raw key must never be stored in database.
- Store only hash and key prefix.
- Key can be revoked.
- Key can be renamed.
- Key can have custom limits.
- Admin can revoke/suspend user keys.

### 8.2 API Key Table Fields

```text
api_keys
- id
- user_id
- name
- key_hash
- key_prefix
- environment: live/test
- status: active/revoked/suspended
- daily_limit_tokens
- monthly_limit_tokens
- used_today_tokens
- used_month_tokens
- allowed_models
- last_used_at
- last_used_ip_hash
- created_at
- revoked_at
```

### 8.3 API Key Creation Flow

```text
User clicks Create API Key
↓
User enters name
↓
Optional custom limit
↓
System checks plan max API keys
↓
Generate cryptographically secure key
↓
Hash raw key
↓
Store hash and prefix
↓
Show full key once
↓
User copies key
```

### 8.4 API Key Security

Must implement:

- HMAC/SHA-256 hash for lookup
- constant-time comparison
- no raw key logs
- no raw key in analytics
- no raw key in error reporting
- key prefix display only
- immediate revoke effect
- suspicious shared key detection

---

## 9. Compatibility Layer

QLens AI must expose two public compatibility layers:

1. **OpenAI-Compatible**
2. **Anthropic-Compatible**

Both route into the same QLens model infrastructure, but use different request/response normalization.

---

## 10. OpenAI-Compatible API Requirements

### 10.1 Base URL

```text
https://api.qlens.ai/v1
```

### 10.2 Minimum Endpoints

```http
GET  /v1/models
POST /v1/chat/completions
```

### 10.3 Future Endpoints

```http
POST /v1/completions
POST /v1/embeddings
POST /v1/images/generations
GET  /v1/usage
```

### 10.4 Auth Header

```http
Authorization: Bearer qlens-sk-live_xxxxx
```

### 10.5 Chat Completion Request

```json
{
  "model": "qlens-fast",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "temperature": 0.7,
  "max_tokens": 1024,
  "stream": true
}
```

### 10.6 Chat Completion Response

Non-stream response must follow OpenAI-style shape:

```json
{
  "id": "chatcmpl_qla_...",
  "object": "chat.completion",
  "created": 1760000000,
  "model": "qlens-fast",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Hello! How can I help?"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  }
}
```

### 10.7 Streaming Response

Streaming must use SSE-compatible chunks:

```text
data: {"id":"chatcmpl_qla_...","object":"chat.completion.chunk","choices":[...]}
data: [DONE]
```

### 10.8 OpenAI Error Format

```json
{
  "error": {
    "message": "Quota exceeded. Please top up token or upgrade your plan.",
    "type": "rate_limit_error",
    "code": "quota_exceeded"
  }
}
```

---

## 11. Anthropic-Compatible API Requirements

### 11.1 Base URL

```text
https://api.qlens.ai
```

### 11.2 Minimum Endpoints

```http
POST /v1/messages
GET  /v1/models
```

### 11.3 Required Headers

```http
x-api-key: qlens-sk-live_xxxxx
anthropic-version: 2023-06-01
content-type: application/json
```

### 11.4 Supported Alternative Auth

To support more tools, also allow:

```http
Authorization: Bearer qlens-sk-live_xxxxx
```

### 11.5 Messages Request

```json
{
  "model": "qlens-claude-compatible",
  "max_tokens": 1024,
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    }
  ],
  "stream": true
}
```

### 11.6 Messages Response

Non-stream response must follow Anthropic-style shape:

```json
{
  "id": "msg_qla_...",
  "type": "message",
  "role": "assistant",
  "model": "qlens-claude-compatible",
  "content": [
    {
      "type": "text",
      "text": "Hello! How can I help?"
    }
  ],
  "stop_reason": "end_turn",
  "usage": {
    "input_tokens": 10,
    "output_tokens": 8
  }
}
```

### 11.7 Anthropic Streaming Response

Streaming should emit Anthropic-style event chunks:

```text
event: message_start
data: {...}

event: content_block_start
data: {...}

event: content_block_delta
data: {...}

event: message_delta
data: {...}

event: message_stop
data: {}
```

### 11.8 Anthropic Error Format

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Daily quota exceeded and no top up token balance available."
  }
}
```

### 11.9 Anthropic Normalization Flow

```text
Anthropic-compatible request
↓
Extract API key from x-api-key or Authorization
↓
Validate qlens-sk- key
↓
Validate anthropic-version
↓
Normalize messages to internal QLens format
↓
Map model to internal route
↓
Check quota, rate limit, risk score
↓
Forward to QLens model infrastructure
↓
Receive internal response
↓
Convert response into Anthropic-compatible output
↓
Record usage
↓
Deduct quota/top up balance
```

---

## 12. Internal Model Routing

### 12.1 Routing Definition

Public model names should not expose internal details.

Example:

```text
Public model: qlens-fast
Internal route: model_route/fast

Public model: qlens-code
Internal route: model_route/code

Public model: qlens-agent
Internal route: model_route/agent

Public model: qlens-claude-compatible
Internal route: model_route/anthropic-normalized
```

### 12.2 Model Fields

```text
models
- id
- public_model_id
- display_name
- description
- compatibility_modes: openai/anthropic/both
- internal_route
- context_length
- max_output_tokens
- category
- allowed_plans
- enabled
- priority
- created_at
- updated_at
```

### 12.3 Model Categories

- general
- coding
- reasoning
- agent
- fast
- low-cost
- premium
- experimental

### 12.4 Model Visibility Rules

- Free plan only sees allowed free models.
- Paid plan sees paid models.
- Disabled model is not returned in `/v1/models`.
- Admin can hide models without deleting records.
- Public model IDs must be stable to avoid breaking user config.
- Public model names must not reveal internal implementation.

---

## 13. Quota, Top Up Token, and Billing Logic

### 13.1 Quota Types

QLens AI has multiple quota sources:

1. Daily plan quota
2. Monthly plan quota
3. Top up token balance
4. Manual admin credit
5. Promotional credit

### 13.2 Quota Deduction Source

Every usage log must include:

```text
deduction_source:
- plan_daily
- plan_monthly
- topup_balance
- manual_credit
- promo_credit
```

### 13.3 Recommended Quota Priority

Production-safe logic:

```text
1. Check account status
2. Check API key status
3. Check model access
4. Check rate limit
5. Check daily quota
6. If daily quota available:
      deduct from plan_daily
7. If daily quota exhausted:
      check top up token balance
8. If top up token balance available:
      allow request and deduct topup_balance
9. If top up token balance unavailable:
      block request
10. If monthly plan quota exhausted:
      allow only if topup_balance exists
11. If no quota source exists:
      return quota_exceeded
```

### 13.4 Daily Limit Overflow Behavior

User requirement:

> Kalau daily quota plan sudah mentok, sistem otomatis pakai quota token sesuai nominal yang sudah user top up.

Implementation:

```text
daily_used >= daily_limit
↓
topup_balance_tokens > 0
↓
request allowed
↓
deduct consumed tokens from topup_balance
↓
usage log source = topup_balance
```

### 13.5 Estimated Token Precheck

Because completion output token is unknown before response finishes:

1. Precheck must ensure user has minimum safe balance.
2. During streaming, system must track actual output tokens.
3. If balance is low, cap `max_tokens` or block request.
4. After response ends, deduct actual tokens.
5. If token estimation mismatch occurs, reconcile through ledger.

### 13.6 Top Up Token Packages

Initial package suggestion:

| Package | Price | Tokens |
|---|---:|---:|
| Mini | Rp10.000 | 1M |
| Starter Top Up | Rp25.000 | 3M |
| Builder | Rp50.000 | 7M |
| Power | Rp100.000 | 15M |
| Custom | Manual | Manual |

Final token pricing must be adjusted to real cost and target margin.

### 13.7 Top Up Rules

- Top up token does not reset daily.
- Top up token should not expire by default.
- If expiry is needed, show clearly before purchase.
- Top up token can be used when daily quota is exhausted.
- Top up token can be used when monthly quota is exhausted, if product allows.
- Top up token deduction must be ledger-based.
- User must see remaining top up balance.
- Admin can manually adjust balance.
- All manual adjustment must produce audit log.

### 13.8 Token Ledger

Token ledger is mandatory for financial correctness.

```text
token_ledger
- id
- user_id
- type: topup/deduction/refund/manual_adjustment/promo_credit/expiry
- amount_tokens
- balance_after
- source
- reference_id
- usage_log_id
- created_by
- created_at
```

### 13.9 Billing Types

```text
payment types:
- subscription
- topup
- manual_credit
```

### 13.10 Payment Flow

```text
User selects plan/topup
↓
Create invoice
↓
Payment provider generates payment URL/QRIS/VA
↓
User pays
↓
Webhook received
↓
Verify webhook signature
↓
Mark invoice paid
↓
Activate plan or add token ledger credit
↓
Send receipt/notification
```

### 13.11 Payment Methods for Indonesia

Recommended:

- QRIS
- Virtual Account
- E-wallet
- Bank transfer
- Midtrans
- Xendit
- Tripay
- Duitku

### 13.12 Payment Safety

Must implement:

- webhook signature verification
- idempotency key
- duplicate webhook handling
- invoice expiry
- paid amount validation
- payment status reconciliation
- admin payment audit log

---

## 14. Plans and Pricing

### 14.1 Initial Plan Structure

| Plan | Price | Daily Token | Monthly Token | API Keys | Model Access | Priority |
|---|---:|---:|---:|---:|---|---|
| Free Trial | Rp0 | small | small | 1 | qlens-lite only | low |
| Starter | Rp25K | medium | 3M | 2 | qlens-lite, qlens-fast | normal |
| Pro | Rp75K | higher | 15M | 5 | qlens-fast, qlens-code, qlens-agent | high |
| Max | Rp150K | high | 50M | 10 | all non-enterprise models | highest |
| Custom | Custom | Custom | Custom | Custom | Custom | custom |

### 14.2 Plan Fields

```text
plans
- id
- name
- price
- currency
- billing_interval: monthly/one_time/custom
- daily_token_limit
- monthly_token_limit
- max_api_keys
- rpm_limit
- tpm_limit
- allowed_models
- priority_level
- is_free
- requires_verification
- is_active
- created_at
- updated_at
```

### 14.3 Free Plan Restrictions

Free Trial must be protected:

- 1 active API key max
- low daily token
- low RPM
- low TPM
- only qlens-lite
- no premium model
- no high-priority queue
- no bulk usage
- email verification required
- CAPTCHA on suspicious register/login
- one free trial per risk fingerprint
- no unlimited free reset

---

## 15. Rate Limiting

### 15.1 Rate Limit Dimensions

Rate limit must apply by:

- user ID
- API key ID
- IP hash
- model
- plan
- risk score
- endpoint

### 15.2 Rate Limit Types

```text
RPM = requests per minute
TPM = tokens per minute
RPD = requests per day
TPD = tokens per day
Concurrent streams = active streaming requests
```

### 15.3 Rate Limit Response

OpenAI-compatible:

```json
{
  "error": {
    "message": "Rate limit exceeded. Please slow down or upgrade your plan.",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

Anthropic-compatible:

```json
{
  "type": "error",
  "error": {
    "type": "rate_limit_error",
    "message": "Rate limit exceeded. Please slow down or upgrade your plan."
  }
}
```

### 15.4 Redis Requirement

Use Redis for fast quota/rate state:

- Upstash Redis for MVP
- Dedicated Redis for production scale

---

## 16. Anti-Abuse and Anti-Free-Plan Farming

### 16.1 Abuse Threats

QLens AI must protect from:

- bulk account registration
- free plan farming
- API key farming
- shared key abuse
- disposable email abuse
- bot register/login
- multi-account clone
- hosting/VPN IP farming
- suspicious repeated payments
- chargeback/fraud
- credential stuffing
- scripted dashboard usage

### 16.2 Free Plan Abuse Controls

Required:

- email verification
- CAPTCHA adaptive
- disposable email blocklist
- registration rate limit per IP/subnet
- login rate limit
- device/browser fingerprint hash
- free trial lock per fingerprint
- free trial lock per IP cluster
- suspicious ASN detection
- temporary restriction for high-risk accounts
- no premium models on free plan
- low API key limit for free plan
- low token/RPM/TPM for free plan
- cooldown before key regeneration
- risk scoring before activating free quota

### 16.3 Privacy-Safe Fingerprinting

Store only hashed signals where possible.

Allowed signals:

```text
ip_hash
asn
country
timezone
user_agent_hash
browser_fingerprint_hash
device_fingerprint_hash
registration_velocity
login_velocity
api_usage_pattern
api_key_ip_spread
payment_identity_hash
email_domain_reputation
```

Avoid storing raw unnecessary sensitive data.

### 16.4 Risk Score

Risk score range:

| Score | Status | Action |
|---:|---|---|
| 0–30 | Normal | allow |
| 31–60 | Watch | allow but monitor |
| 61–80 | Restricted | CAPTCHA, lower rate, delay free quota |
| 81–100 | Blocked | block or manual review |

### 16.5 Abuse Actions

Automatic actions:

- require CAPTCHA
- delay free quota activation
- reduce rate limit
- disable free quota
- suspend API key
- temporary account restriction
- manual review
- ban account
- ban email domain
- ban IP/subnet where appropriate

### 16.6 Shared API Key Detection

Signals:

- one key used from too many IPs
- impossible country jumps
- high concurrent requests from multiple networks
- public paste-like usage spike
- abnormal user agent diversity
- repeated failed auth using similar prefix

Actions:

- warning
- temporary key freeze
- require key rotation
- revoke key
- restrict account

### 16.7 Bulk Account Detection

Signals:

- many accounts from same IP/subnet
- many accounts from same fingerprint hash
- similar email patterns
- fast repeated registrations
- same browser signature
- same payment identity
- same behavioral usage

### 16.8 Admin Abuse Monitor

Admin page must show:

- suspicious users
- duplicate IP groups
- duplicate fingerprint groups
- disposable email users
- high velocity register events
- shared API key alerts
- free plan heavy users
- failed payment/fraud flags
- risk score history
- manual action buttons

Admin actions:

- restrict
- suspend
- ban
- reset risk score
- revoke key
- add note
- whitelist user
- block email domain
- block IP/subnet
- require manual verification

---

## 17. Admin Dashboard Requirements

### 17.1 Admin Navigation

Admin sidebar:

- Overview
- Users
- Plans
- Models
- API Keys
- Usage Logs
- Request Logs
- Payments
- Top Up Ledger
- Model Health
- Abuse Monitor
- Audit Logs
- Settings

### 17.2 Admin Overview Cards

Cards:

- Revenue Today
- Revenue This Month
- Paid Users
- Free Users
- Active Users Today
- Total Requests Today
- Total Tokens Today
- Top Models
- Gateway Status
- Error Rate
- Average Latency
- Abuse Alerts

### 17.3 User Management

Admin can:

- search user by email
- view user detail
- view usage
- view keys
- revoke keys
- change plan
- add manual credit
- remove credit
- restrict user
- suspend user
- ban user
- add internal notes

### 17.4 Plan Management

Admin can:

- create plan
- edit price
- edit quota
- edit rate limit
- edit model access
- enable/disable plan
- duplicate plan
- archive plan

### 17.5 Model Management

Admin can:

- add model
- edit public model ID
- map internal route
- set compatibility mode
- set context length
- set allowed plans
- enable/disable model
- set model priority

### 17.6 Payments

Admin can:

- view all payments
- filter by status
- filter by provider
- retry reconciliation
- manually mark after verification
- refund record
- export CSV
- view webhook events

### 17.7 Logs

Admin logs pages:

- Request Logs
- Usage Logs
- Auth Logs
- Payment Logs
- Abuse Logs
- Audit Logs

Each log must be searchable and filterable.

---

## 18. Model Health and Relay

### 18.1 Model Health Metrics

Track:

- status: healthy/degraded/down
- active model route
- active relay
- last heartbeat
- latency p50/p95/p99
- error rate
- timeout rate
- requests per minute
- tokens per minute
- active streams
- queue depth
- model availability

### 18.2 Relay Purpose

Relay connects the public QLens API Gateway to internal model services.

Production flow:

```text
User
↓
https://api.qlens.ai/v1 or /v1/messages
↓
QLens API Gateway
↓
Secure internal relay / reverse proxy
↓
QLens internal model services
↓
Response back to gateway
↓
Response back to user
```

### 18.3 Development Tunnel

For development only:

- Cloudflare Quick Tunnel
- temporary URL
- not for stable production

### 18.4 Production Recommended

Recommended production:

```text
Cloudflare DNS/WAF
↓
VPS Gateway / API Gateway service
↓
Private internal network / secured tunnel
↓
QLens internal model services
```

### 18.5 Status Page

User-facing status page can show:

- API Operational
- OpenAI-compatible layer
- Anthropic-compatible layer
- Model health
- Incident history

Admin model health page shows more detail.

---

## 19. System Architecture

### 19.1 Recommended MVP Stack

```text
Frontend:
- Next.js
- Tailwind CSS
- shadcn/ui

Backend:
- Next.js API routes for dashboard/auth/billing
- FastAPI or Node.js Hono/Fastify for API Gateway

Database:
- PostgreSQL / Supabase

Cache & Rate Limit:
- Redis / Upstash Redis

Payments:
- Midtrans / Xendit / Tripay / Duitku

Deployment:
- Vercel for frontend
- VPS for gateway
- Cloudflare for DNS/WAF
- Cloudflare Tunnel or reverse proxy for internal services

Monitoring:
- Sentry
- UptimeRobot
- Grafana/Prometheus later

Logs:
- PostgreSQL for MVP
- ClickHouse/Loki later for scale
```

### 19.2 Recommended Production Stack

```text
Frontend:
- Next.js

API Gateway:
- FastAPI + httpx streaming
or
- Node.js Hono/Fastify with streaming support

Database:
- PostgreSQL managed

Cache:
- Redis managed

Logs:
- ClickHouse or Loki for high volume

Queue:
- BullMQ / Redis queue

Observability:
- Prometheus
- Grafana
- Loki
- Sentry

Proxy:
- Cloudflare
- Nginx/Caddy

Deployment:
- Docker Compose for first production
- Kubernetes only after scale requires it
```

### 19.3 Service Separation

Recommended services:

```text
web-app
- landing
- dashboard
- docs
- billing UI

api-gateway
- OpenAI-compatible API
- Anthropic-compatible API
- auth validation
- quota/rate limit
- streaming proxy

admin-api
- admin operations
- plan/model management
- abuse monitor

billing-worker
- payment webhook
- invoice reconciliation
- top up ledger update

usage-worker
- usage aggregation
- analytics
- reporting

health-worker
- heartbeat
- model health check
- alerting
```

---

## 20. Database Schema

### 20.1 Users

```sql
users
- id uuid primary key
- email text unique not null
- password_hash text
- role text check user/admin/superadmin
- status text check active/watchlisted/restricted/suspended/banned
- email_verified boolean
- plan_id uuid
- risk_score integer
- created_at timestamptz
- updated_at timestamptz
```

### 20.2 Plans

```sql
plans
- id uuid primary key
- name text
- price numeric
- currency text
- billing_interval text
- daily_token_limit bigint
- monthly_token_limit bigint
- max_api_keys integer
- rpm_limit integer
- tpm_limit integer
- allowed_models jsonb
- priority_level integer
- is_free boolean
- requires_verification boolean
- is_active boolean
- created_at timestamptz
- updated_at timestamptz
```

### 20.3 API Keys

```sql
api_keys
- id uuid primary key
- user_id uuid references users(id)
- name text
- key_hash text unique not null
- key_prefix text
- environment text
- status text
- daily_limit_tokens bigint
- monthly_limit_tokens bigint
- used_today_tokens bigint
- used_month_tokens bigint
- allowed_models jsonb
- last_used_at timestamptz
- last_used_ip_hash text
- created_at timestamptz
- revoked_at timestamptz
```

### 20.4 Models

```sql
models
- id uuid primary key
- public_model_id text unique
- display_name text
- description text
- compatibility_modes jsonb
- internal_route text
- context_length integer
- max_output_tokens integer
- category text
- allowed_plans jsonb
- enabled boolean
- priority integer
- created_at timestamptz
- updated_at timestamptz
```

### 20.5 Usage Logs

```sql
usage_logs
- id uuid primary key
- user_id uuid references users(id)
- api_key_id uuid references api_keys(id)
- request_id text
- compatibility_mode text
- model text
- input_tokens bigint
- output_tokens bigint
- total_tokens bigint
- deduction_source text
- latency_ms integer
- status_code integer
- error_code text
- created_at timestamptz
```

### 20.6 Request Logs

```sql
request_logs
- id uuid primary key
- request_id text unique
- user_id uuid
- api_key_id uuid
- method text
- path text
- compatibility_mode text
- model text
- status_code integer
- latency_ms integer
- ip_hash text
- user_agent_hash text
- error_code text
- created_at timestamptz
```

### 20.7 Payments

```sql
payments
- id uuid primary key
- user_id uuid references users(id)
- type text check subscription/topup/manual_credit
- plan_id uuid
- topup_package_id uuid
- amount numeric
- currency text
- token_amount bigint
- status text
- provider text
- provider_reference text
- payment_url text
- idempotency_key text
- created_at timestamptz
- paid_at timestamptz
```

### 20.8 Token Ledger

```sql
token_ledger
- id uuid primary key
- user_id uuid references users(id)
- type text
- amount_tokens bigint
- balance_after bigint
- source text
- reference_id text
- usage_log_id uuid
- created_by uuid
- created_at timestamptz
```

### 20.9 Abuse Signals

```sql
abuse_signals
- id uuid primary key
- user_id uuid
- signal_type text
- signal_value_hash text
- score_delta integer
- metadata jsonb
- created_at timestamptz
```

### 20.10 Audit Logs

```sql
audit_logs
- id uuid primary key
- actor_user_id uuid
- action text
- target_type text
- target_id text
- metadata jsonb
- created_at timestamptz
```

### 20.11 Service Status

```sql
service_status
- id uuid primary key
- status text
- latency_p50_ms integer
- latency_p95_ms integer
- error_rate numeric
- active_streams integer
- requests_per_minute integer
- tokens_per_minute integer
- last_heartbeat_at timestamptz
- metadata jsonb
- updated_at timestamptz
```

---

## 21. API Gateway Logic

### 21.1 Main Request Flow

```text
Request received
↓
Generate request_id
↓
Detect compatibility mode
↓
Extract API key
↓
Hash and lookup API key
↓
Validate API key status
↓
Load user and plan
↓
Check user status
↓
Check risk score
↓
Check model access
↓
Check rate limit
↓
Estimate token need
↓
Check quota/topup availability
↓
Normalize request
↓
Route to internal model service
↓
Stream or return response
↓
Calculate actual usage
↓
Deduct quota/token ledger
↓
Write usage log
↓
Write request log
↓
Return response
```

### 21.2 Failure Safety

If response starts streaming and later internal service fails:

- return valid stream error if possible
- log partial usage
- mark request failed
- do not over-deduct beyond actual usage
- emit admin alert if error spike occurs

### 21.3 Idempotency

For non-stream requests, support optional idempotency header:

```http
Idempotency-Key: user-generated-key
```

Use case:

- retry protection
- avoid duplicate billing on network retry

### 21.4 Request Timeout

Recommended defaults:

| Request Type | Timeout |
|---|---:|
| non-stream | 120s |
| stream | 10 min |
| health check | 10s |
| model list | 15s |

---

## 22. Security Requirements

### 22.1 Authentication

- secure password hashing
- email verification
- session expiration
- refresh token rotation if used
- optional 2FA for admin
- admin login notification
- login rate limit

### 22.2 API Security

- hash API keys
- never store raw keys
- never log raw keys
- validate auth on every request
- strict CORS
- request size limits
- JSON validation
- model allowlist
- endpoint allowlist

### 22.3 Secret Management

- internal service credentials encrypted
- environment variables not exposed
- no secrets in frontend
- no secrets in logs
- rotate secrets regularly
- admin action audit

### 22.4 Webhook Security

- verify provider signatures
- use idempotency
- validate amount
- validate invoice status
- prevent replay
- log webhook event

### 22.5 Admin Security

- 2FA recommended
- role-based permissions
- IP allowlist optional
- audit all admin actions
- protect manual credit adjustments
- require confirmation for destructive actions

### 22.6 Data Protection

- hash IP/fingerprint where possible
- minimize sensitive storage
- encrypt payment references if needed
- backups encrypted
- clear privacy policy
- delete account workflow

---

## 23. Legal, Policy, and Trust Pages

QLens AI should have:

- Terms of Service
- Privacy Policy
- Acceptable Use Policy
- Refund Policy
- Fair Usage Policy
- Contact/Support Page
- Status Page
- Pricing Terms

### 23.1 Acceptable Use Policy Must Prohibit

- spam
- phishing
- credential theft
- malware
- payment fraud
- bot abuse
- harassment campaigns
- illegal automation
- API key resale without permission
- free plan farming
- attempting to bypass limits

---

## 24. UI/UX Requirements

> This section is extended by Section 24A–24G with OpenModel-style UI reference patterns adapted for QLens AI.

### 24.1 Visual Style

- dark mode first
- modern SaaS dashboard
- green accent for healthy/running
- orange for warning/degraded
- red for error/block
- card-based layout
- clean sidebar
- copy buttons on all config blocks
- responsive mobile view
- table search/filter
- no clutter

### 24.2 User Dashboard UX Principles

- user must find API key in < 10 seconds
- base URL must be visible on dashboard
- quick setup must be copy-paste ready
- usage must be clear
- top up CTA must appear before quota fully runs out
- error explanation must be human-readable

### 24.3 Admin UX Principles

- high-risk alerts visible first
- revenue and usage visible immediately
- logs filterable
- user action buttons clear
- destructive actions require confirmation
- audit log always accessible

---

---

## 24A. OpenModel-Style UI Reference Patch

### 24A.1 Purpose

QLens AI UI harus mengambil inspirasi dari pola produk **modern AI API gateway / model access console** seperti OpenModel, tanpa menyalin brand, copywriting, aset visual, layout spesifik, atau identitas mereka.

Tujuan patch UI ini:

- membuat QLens AI terasa seperti SaaS API provider yang serius
- memperkuat trust untuk developer dan user coding agent
- memperjelas model access, API key, usage, billing, dan logs
- membuat dashboard siap jualan, bukan sekadar panel teknis
- membuat docs dan quickstart mudah dipakai dalam < 5 menit

### 24A.2 Public Reference Summary

Dari public-facing OpenModel website dan docs, pola yang relevan untuk QLens AI:

- positioning sebagai gateway dengan satu API stabil
- console untuk API keys, balance, usage, logs, dan admin controls
- quickstart yang langsung menunjukkan base URL dan contoh request
- dukungan beberapa API protocol seperti OpenAI format dan Anthropic Messages format
- authentication berdasarkan API key dengan header yang mengikuti format masing-masing protocol
- model catalog/model pricing page
- docs yang rapi dengan sidebar, quickstart, SDK examples, streaming, error handling, rate limits, dan API reference
- security best practices: jangan expose API key di client-side code, gunakan environment variables, rotate keys, set quotas/rate limits per key, dan expiration untuk temporary/project-scoped access

QLens AI harus mengadaptasi pola tersebut menjadi bahasa produk sendiri:

```text
OpenModel pattern:
Multi-model gateway + ops console + docs-first onboarding

QLens AI adaptation:
QLens AI Gateway + clean API console + quota/topup transparency + OpenAI/Anthropic compatible onboarding
```

### 24A.3 Design Principles

QLens AI UI harus mengikuti prinsip berikut:

1. **Developer-first**
   - API key, base URL, model name, dan code snippet harus terlihat jelas.
   - User tidak boleh bingung harus mulai dari mana.

2. **Docs-first onboarding**
   - Dashboard harus langsung menampilkan quickstart.
   - Docs harus pakai contoh nyata untuk OpenAI-compatible dan Anthropic-compatible.

3. **Usage transparency**
   - Daily quota, monthly quota, top up token balance, dan deduction source harus jelas.
   - Jangan membuat user merasa token berkurang tanpa penjelasan.

4. **Operational trust**
   - Tampilkan status, logs, latency, success rate, dan model health.
   - Admin dashboard harus menunjukkan sistem ini dikelola serius.

5. **Premium technical SaaS feel**
   - Minimal, clean, dark-first, high contrast, tidak terlalu ramai.
   - Visual harus terasa seperti developer infrastructure product.

6. **No clone**
   - Jangan copy brand, warna persis, ilustrasi, icon, layout pixel-perfect, atau text dari OpenModel.
   - Ambil pattern dan struktur UX-nya saja.

---

## 24B. Landing Page UI Reference

### 24B.1 Landing Page Structure

Landing page QLens AI harus dibuat dengan struktur:

```text
Header
↓
Hero
↓
Protocol Compatibility Strip
↓
Quickstart Preview
↓
Model Access / Catalog Preview
↓
Usage & Billing Transparency
↓
Feature Grid
↓
Docs / SDK Preview
↓
Pricing
↓
Security & Anti-Abuse
↓
FAQ
↓
Footer
```

### 24B.2 Header

Header desktop:

- Left: QLens AI logo
- Center nav:
  - Models
  - Pricing
  - Docs
  - Status
  - Changelog
- Right actions:
  - Sign in
  - Get API Key

Header mobile:

- Logo
- Menu button
- Primary CTA tetap mudah terlihat

Header style:

- sticky top
- translucent dark background
- subtle border bottom
- blur background optional
- compact height
- clean typography

### 24B.3 Hero Section

Hero harus menjelaskan produk dalam 5 detik.

Copy direction:

```text
QLens AI Gateway

OpenAI & Anthropic compatible API for coding agents, automation, and AI apps.

Use one qlens-sk- key to access QLens model infrastructure with usage tracking, token top up, and production-ready logs.
```

CTA:

- Get API Key
- View Docs
- See Models

Hero visual:

- code snippet card
- live usage mini-card
- model status mini-card
- API key masked preview
- protocol tabs: OpenAI / Anthropic

Example hero component:

```text
[OpenAI] [Anthropic]

Base URL
https://api.qlens.ai/v1

API Key
qlens-sk-live_••••••••••••

Model
qlens-fast
```

### 24B.4 Protocol Compatibility Strip

Tampilkan 2 protocol utama:

```text
OpenAI Compatible
/v1/chat/completions
/v1/responses
/v1/models

Anthropic Compatible
/v1/messages
/v1/messages/count_tokens
/v1/models
```

Future optional:

```text
Gemini-Compatible API
/v1beta/models/{model}:generateContent
```

Gemini-compatible boleh ditulis sebagai future roadmap, bukan MVP wajib.

### 24B.5 Quickstart Preview

Landing page harus punya quickstart card:

Tabs:

- cURL
- Node.js
- Python
- Anthropic SDK
- OpenAI SDK

OpenAI tab:

```bash
curl https://api.qlens.ai/v1/chat/completions \
  -H "Authorization: Bearer qlens-sk-live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qlens-fast",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

Anthropic tab:

```bash
curl https://api.qlens.ai/v1/messages \
  -H "x-api-key: qlens-sk-live_xxxxx" \
  -H "content-type: application/json" \
  -H "anthropic-version: 2023-06-01" \
  -d '{
    "model": "qlens-claude-compatible",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

### 24B.6 Model Catalog Preview

Model catalog preview cards:

Each model card should show:

- model name
- category
- compatibility badge
- context length
- input token price or quota cost
- output token price or quota cost
- latency badge
- plan badge
- status badge

Example card:

```text
qlens-code
Coding Agent Model

Protocol: OpenAI + Anthropic
Context: 128K
Plan: Pro / Max
Status: Healthy
Latency: Fast
```

### 24B.7 Pricing Preview

Pricing UI should use cards:

- Free Trial
- Starter
- Pro
- Max
- Top Up Token
- Custom

Each card must show:

- monthly price
- daily quota
- monthly quota
- API key limit
- model access
- RPM/TPM
- top up behavior
- CTA button

Top up card must explain:

```text
Daily quota mentok? QLens AI otomatis memakai top up token balance kamu selama saldo token masih tersedia.
```

### 24B.8 Trust Section

Add trust cards:

- API key hashing
- token ledger
- transparent request logs
- model health
- fair use rules
- anti-free-plan abuse
- payment webhook safety

---

## 24C. Console / Dashboard UI Reference

### 24C.1 Console Navigation

User console sidebar:

```text
Overview
API Keys
Usage
Models
Billing
Top Up Token
Logs
Docs
Settings
Support
```

Admin console sidebar:

```text
Admin Overview
Users
Plans
Models
API Keys
Usage Logs
Request Logs
Payments
Top Up Ledger
Model Health
Abuse Monitor
Audit Logs
Settings
```

### 24C.2 Overview Dashboard

User overview must show:

```text
Current Plan
Daily Quota
Monthly Quota
Top Up Token Balance
Requests Today
Success Rate
Active API Keys
Base URLs
```

Layout:

- top summary cards
- quickstart card
- usage chart
- latest request logs
- model status row
- billing/topup CTA

### 24C.3 API Key Page

API key page UX:

- Create API Key button at top right
- table of keys
- masked key prefix
- environment badge: live/test
- status badge: active/revoked/suspended
- last used
- usage today
- usage this month
- per-key quota
- action menu: rename, set limit, revoke

Create key modal fields:

```text
Key name
Environment: live/test
Optional daily limit
Optional monthly limit
Allowed models
Expiration date optional
```

After create:

```text
This key is shown only once. Copy it now.
qlens-sk-live_xxxxxxxxxxxxxxxxx
```

### 24C.4 Usage Page

Usage page must include:

- daily token chart
- monthly token chart
- model breakdown
- API key breakdown
- deduction source breakdown:
  - plan_daily
  - plan_monthly
  - topup_balance
  - manual_credit
  - promo_credit
- error rate
- latency
- export CSV

### 24C.5 Logs Page

Logs table columns:

```text
Time
Request ID
Mode
Model
API Key
Status
Input Tokens
Output Tokens
Total Tokens
Deduction Source
Latency
IP Hash
Error Code
```

Filters:

- date range
- model
- API key
- status
- error code
- compatibility mode
- deduction source

### 24C.6 Billing Page

Billing page tabs:

- Current Plan
- Top Up Token
- Invoices
- Payment Methods
- Usage Cost

Top up token UI:

```text
Token Balance: 2.3M tokens

Top Up Packages:
Rp10.000  = 1M token
Rp25.000  = 3M token
Rp50.000  = 7M token
Rp100.000 = 15M token
Custom    = Contact admin
```

Billing must show:

- active plan
- next reset
- daily quota reset
- monthly quota reset
- top up token balance
- invoice history
- payment status

### 24C.7 Models Page

Models page layout:

- search bar
- protocol filter: OpenAI / Anthropic / Both
- category filter: coding / fast / reasoning / agent / premium
- plan filter: Free / Starter / Pro / Max
- status filter: healthy / degraded / down
- pricing/quota cost column
- context length column

Model detail page:

```text
Model name
Description
Compatibility mode
Endpoint examples
Context length
Recommended use
Plan access
Rate limits
Latency status
Example request
```

### 24C.8 Admin Overview

Admin overview top cards:

```text
Revenue Today
Revenue This Month
Paid Users
Free Users
Requests Today
Tokens Today
Top Up Sales
Error Rate
Average Latency
Abuse Alerts
Gateway Status
```

Admin must have charts:

- revenue trend
- token usage trend
- model demand
- plan distribution
- free vs paid usage
- error rate trend
- abuse trend

### 24C.9 Model Health Page

Admin model health page:

```text
Model
Route
Compatibility
Status
Latency p50
Latency p95
Error Rate
Requests/min
Tokens/min
Active Streams
Last Heartbeat
Action
```

Actions:

- disable model
- enable model
- set degraded
- edit route
- test request
- view logs

### 24C.10 Abuse Monitor Page

Abuse monitor layout:

- risk queue
- duplicate fingerprint groups
- duplicate IP/subnet groups
- disposable email list
- shared key alerts
- free plan heavy users
- high velocity signups
- failed payment risk

Each row:

```text
User
Risk Score
Reason
Related Accounts
Usage
Created At
Action
```

Actions:

- watchlist
- restrict
- suspend
- revoke key
- require verification
- whitelist

---

## 24D. Docs UI Reference

### 24D.1 Docs Structure

Docs should use a clean docs layout:

```text
Left sidebar navigation
Main content
Right mini table-of-contents
Code blocks with copy buttons
Protocol tabs
Language tabs
```

Sidebar:

```text
Getting Started
- Quickstart
- Authentication
- Base URLs
- Models

API Reference
- OpenAI-Compatible
- Anthropic-Compatible
- Streaming
- Error Codes
- Rate Limits

Guides
- Cline
- Roo Code
- Aider
- Continue
- Hermes Agent
- LiteLLM
- LangChain
- OpenAI SDK
- Anthropic SDK

Billing
- Plans
- Top Up Token
- Quota Rules
- Invoices

Security
- API Key Safety
- Rotation
- Best Practices
```

### 24D.2 Quickstart Page

Quickstart must be extremely short:

1. Create account
2. Create API key
3. Choose protocol
4. Copy base URL
5. Make first request
6. Check usage logs

### 24D.3 Authentication Page

Docs must explain:

OpenAI-compatible:

```http
Authorization: Bearer qlens-sk-live_xxxxx
```

Anthropic-compatible:

```http
x-api-key: qlens-sk-live_xxxxx
anthropic-version: 2023-06-01
```

Fallback support:

```http
Authorization: Bearer qlens-sk-live_xxxxx
```

Security best practice:

- never expose API key in frontend/client-side code
- use environment variables
- rotate keys regularly
- set key-level quotas
- use key expiration for temporary/project keys
- revoke unused keys

### 24D.4 API Reference UX

Each endpoint page must include:

- endpoint
- method
- auth method
- request body
- response body
- streaming behavior
- error examples
- SDK examples
- cURL example
- rate limit notes
- quota deduction notes

### 24D.5 Model Pricing / Catalog UX

Model catalog page must support:

- search
- sort by price/quota cost
- sort by context
- sort by latency
- filter by protocol
- filter by plan
- filter by category
- model detail page

Fields:

```text
Model ID
Display Name
Protocol
Category
Context
Max Output
Plan Access
Status
Input Cost
Output Cost
Recommended Use
```

---

## 24E. Visual Style Guide

### 24E.1 Overall Style

QLens AI should feel like:

```text
modern developer infrastructure
clean AI gateway console
dark technical SaaS
premium but simple
fast to understand
```

### 24E.2 Theme

Default:

- dark mode first
- light mode optional later

Recommended palette direction:

```text
Background: near-black / deep navy
Surface: dark slate
Border: subtle gray/blue
Primary accent: electric cyan or QLens blue
Success: green
Warning: amber
Danger: red
Muted text: gray
Main text: near-white
```

Do not copy exact OpenModel colors.

### 24E.3 Typography

Use:

- modern sans-serif
- clear code font for snippets
- compact dashboard labels
- high readability

Recommended:

```text
Sans: Inter / Geist / Satoshi
Mono: JetBrains Mono / Geist Mono
```

### 24E.4 Components

Required component set:

- Button
- Card
- Badge
- Tabs
- Table
- Modal
- Dropdown menu
- Copy code block
- Toast notification
- Status indicator
- Usage progress bar
- Area chart
- Line chart
- Filter bar
- Empty state
- Error state
- Loading skeleton

### 24E.5 Status Badges

Use consistent status badges:

```text
healthy = green
degraded = amber
down = red
active = green
revoked = gray
suspended = red
restricted = amber
paid = green
pending = amber
failed = red
```

---

## 24F. UX Copy Rules

### 24F.1 Product Language

Use these terms:

- QLens AI Gateway
- model access
- model infrastructure
- internal model services
- API console
- API key
- token quota
- top up token
- usage logs
- model health
- compatibility mode

Do not use:

- AI Gateway
- pool jualan
- sharing akun
- proxy abuse
- unlimited free
- bypass

### 24F.2 User-Facing Tone

Tone:

- clean
- technical
- confident
- not overhyped
- transparent about limits

Example copy:

```text
Your daily quota is used up. We’ll continue using your top up token balance automatically.
```

```text
This API key is shown only once. Store it securely and never expose it in client-side code.
```

```text
This model is available on Pro and Max plans.
```

### 24F.3 Admin-Facing Tone

Admin dashboard copy should be direct:

```text
High-risk free trial activity detected.
```

```text
This API key is used from many unrelated networks.
```

```text
Model route degraded. Error rate is above threshold.
```

---

## 24G. UI Acceptance Checklist

QLens AI UI is accepted only if:

- [ ] user can understand product from hero in < 5 seconds
- [ ] user can find base URL immediately after login
- [ ] user can create API key in < 30 seconds
- [ ] user can copy OpenAI-compatible snippet
- [ ] user can copy Anthropic-compatible snippet
- [ ] user can see daily quota
- [ ] user can see monthly quota
- [ ] user can see top up token balance
- [ ] user can see latest logs
- [ ] user can distinguish plan quota vs top up deduction
- [ ] admin can see revenue and usage immediately
- [ ] admin can find abuse alerts immediately
- [ ] admin can view model health immediately
- [ ] docs have quickstart, auth, OpenAI, Anthropic, tools setup
- [ ] no UI text uses “AI Gateway”
- [ ] no OpenModel branding, copy, logo, or exact visual identity is copied

---

---

## 24H. OpenModel-Style Full Frontend UI Blueprint

### 24H.1 Goal

QLens AI frontend harus dibuat dengan arah visual **sekelas OpenModel-style developer SaaS**, yaitu:

```text
dark technical landing
developer-first hero
API protocol tabs
code-preview cards
model catalog
usage/balance/logs console
clean docs experience
minimal but premium dashboard
```

Tujuan section ini adalah memperjelas bahwa UI QLens AI bukan sekadar “terinspirasi”, tapi harus memiliki **rasa visual, struktur halaman, dan UX flow yang searah** dengan OpenModel-style product website, sambil tetap memakai identitas QLens AI sendiri.

Important:

```text
Do not copy OpenModel logo, brand, exact copywriting, exact icon set, exact illustration, or pixel-perfect layout.
Use the same design category and UX pattern:
modern dark AI gateway website + clean API console + docs-first onboarding.
```

### 24H.2 Full Website Visual Direction

Frontend QLens AI harus terasa seperti:

```text
Premium AI API infrastructure website
Dark-mode first
Minimal text but strong headline
Subtle gradient glow
Glassmorphism cards
Terminal/code preview blocks
Protocol switcher tabs
Model catalog cards
Dashboard preview mockup
Clean docs preview
High trust technical SaaS
```

Visual keywords:

```text
dark
minimal
developer-focused
high contrast
soft glow
clean cards
rounded panels
thin borders
subtle grid
code-first
dashboard-first
premium SaaS
```

Avoid:

```text
too colorful
cartoon illustration
cheap template look
crypto-style excessive neon
overcrowded UI
random gradients
too many icons
long marketing copy blocks
```

### 24H.3 Frontend Design Tokens

Recommended design tokens for implementation.

#### Color Palette

```css
:root {
  --ql-bg: #05070b;
  --ql-bg-2: #080b12;
  --ql-surface: rgba(255, 255, 255, 0.045);
  --ql-surface-2: rgba(255, 255, 255, 0.07);
  --ql-border: rgba(255, 255, 255, 0.10);
  --ql-border-strong: rgba(255, 255, 255, 0.18);

  --ql-text: #f7f8fb;
  --ql-text-muted: #9ba3b4;
  --ql-text-soft: #687083;

  --ql-primary: #7c5cff;
  --ql-primary-2: #38bdf8;
  --ql-accent: #22d3ee;

  --ql-success: #22c55e;
  --ql-warning: #f59e0b;
  --ql-danger: #ef4444;

  --ql-code-bg: #070a11;
  --ql-code-border: rgba(124, 92, 255, 0.22);
}
```

#### Background Style

Use layered background:

```css
body {
  background:
    radial-gradient(circle at 20% 10%, rgba(124, 92, 255, 0.18), transparent 32%),
    radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.12), transparent 30%),
    linear-gradient(180deg, #05070b 0%, #080b12 45%, #05070b 100%);
}
```

Add subtle grid overlay:

```css
.bg-grid {
  background-image:
    linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(to bottom, black, transparent 80%);
}
```

#### Typography

```text
Primary font: Inter / Geist / Satoshi
Mono font: JetBrains Mono / Geist Mono
Hero weight: 600–700
Body weight: 400–500
Dashboard labels: 500
Code: 13–14px mono
```

#### Radius

```text
Small: 8px
Medium: 12px
Large cards: 18px
Hero panels: 24px
Pills: 999px
```

#### Shadows

Use soft shadows only:

```css
box-shadow:
  0 20px 80px rgba(0, 0, 0, 0.35),
  inset 0 1px 0 rgba(255, 255, 255, 0.05);
```

Do not use heavy ecommerce-style shadows.

---

## 24I. Landing Page — Full OpenModel-Style Layout

### 24I.1 Final Landing Page Order

The homepage must use this exact order:

```text
1. Sticky Header
2. Hero with protocol/code preview
3. Social proof / trust strip
4. Protocol compatibility section
5. Model access catalog preview
6. API console preview
7. Usage, billing, and top up token transparency
8. Developer integrations
9. Security and anti-abuse
10. Pricing
11. Docs preview
12. FAQ
13. Footer
```

### 24I.2 Sticky Header

Header layout:

```text
Left:
- QLens AI logo
- optional small status dot: Operational

Center:
- Models
- Pricing
- Docs
- Status
- Changelog

Right:
- Sign in
- Get API Key
```

Visual:

```text
height: 64px
max-width: 1180px
background: translucent dark
border: subtle bottom border
backdrop blur: 16px
button style: rounded pill
```

Header behavior:

- sticky on top
- background becomes slightly more solid when scrolling
- mobile collapses to hamburger
- Get API Key remains primary CTA

### 24I.3 Hero Section

Hero layout should be split:

```text
Left column:
- badge
- headline
- subheadline
- CTA row
- small trust row

Right column:
- interactive API preview card
```

Hero badge:

```text
OpenAI + Anthropic Compatible Gateway
```

Hero headline:

```text
One QLens key for AI agents, automation, and apps.
```

Hero subheadline:

```text
QLens AI gives developers a stable API gateway with OpenAI-compatible and Anthropic-compatible endpoints, token top up, usage logs, model access, and production-ready controls.
```

CTA:

```text
Primary: Get API Key
Secondary: View Docs
Tertiary text link: See Models
```

Trust row:

```text
qlens-sk- keys
OpenAI format
Anthropic format
Usage logs
Top up token
```

### 24I.4 Hero API Preview Card

Hero right-side card should look like a real API console preview.

Card elements:

```text
Top bar:
- API Request
- status pill: Healthy
- protocol tabs: OpenAI / Anthropic

Code area:
- request snippet
- copy button
- syntax highlighting

Bottom metrics row:
- latency
- tokens
- deduction source
- model
```

OpenAI tab example:

```bash
curl https://api.qlens.ai/v1/chat/completions \
  -H "Authorization: Bearer qlens-sk-live_xxxxx" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qlens-fast",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

Anthropic tab example:

```bash
curl https://api.qlens.ai/v1/messages \
  -H "x-api-key: qlens-sk-live_xxxxx" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "qlens-claude-compatible",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "Hello"}]
  }'
```

Metrics row:

```text
Latency: 420ms
Tokens: 1.2K
Source: plan_daily
Model: qlens-fast
```

### 24I.5 Trust Strip

Below hero:

```text
Built for developers using:
Cline
Roo Code
Aider
Continue
Hermes Agent
OpenAI SDK
Anthropic SDK
LiteLLM
LangChain
```

UI:

- muted icon row
- grayscale icons or simple text pills
- no excessive brand colors
- horizontally scrollable on mobile

### 24I.6 Protocol Compatibility Section

Two large cards:

#### Card 1: OpenAI-Compatible

```text
OpenAI-Compatible API
Use existing OpenAI SDK workflows by changing the base URL.

Base URL:
https://api.qlens.ai/v1

Endpoint:
POST /v1/chat/completions
Future:
POST /v1/responses
```

#### Card 2: Anthropic-Compatible

```text
Anthropic-Compatible API
Use Anthropic-style Messages API with qlens-sk- keys.

Base URL:
https://api.qlens.ai

Endpoint:
POST /v1/messages
Header:
x-api-key: qlens-sk-live_xxxxx
```

Both cards must include:

- code preview
- compatible tools
- auth header
- model example
- copy button

### 24I.7 Model Catalog Preview

UI layout:

```text
Section title:
Models for agents, coding, and automation.

Search bar:
Search models...

Filter pills:
All
Coding
Fast
Agent
Reasoning
OpenAI
Anthropic
Free
Pro
Max
```

Model cards:

```text
qlens-fast
Fast general model
OpenAI + Anthropic
Context: 128K
Plan: Starter+
Status: Healthy

qlens-code
Coding agent model
OpenAI + Anthropic
Context: 128K
Plan: Pro+
Status: Healthy

qlens-agent
Automation model
OpenAI + Anthropic
Context: 128K
Plan: Pro+
Status: Healthy

qlens-lite
Free trial model
OpenAI
Context: 32K
Plan: Free+
Status: Healthy
```

Card visual:

- dark translucent card
- subtle border
- small status dot
- tags
- metric row
- hover lift 2px
- “View details” link

### 24I.8 API Console Preview Section

Show large dashboard mockup screenshot-style component.

Left side:

```text
API Console
Control your keys, usage, billing, and logs from one clean dashboard.
```

Right side mockup:

- sidebar
- summary cards
- usage chart
- latest request logs table
- key preview
- model status

Mockup components:

```text
Cards:
Daily Quota
Monthly Quota
Top Up Token
Requests Today

Chart:
Tokens used this week

Table:
Time | Model | Mode | Tokens | Source | Status
```

### 24I.9 Usage & Top Up Transparency Section

This section is critical for QLens differentiation.

Headline:

```text
Quota that stays transparent.
```

Cards:

1. Daily quota
2. Monthly quota
3. Top up token balance
4. Token ledger

Explain:

```text
If your daily quota is exhausted, QLens AI automatically continues using your top up token balance when available.
```

UI example:

```text
Daily quota
1.0M / 1.0M used

Top up token
2.3M available

Next request
Deduction source: topup_balance
```

### 24I.10 Developer Integrations Section

Grid cards:

```text
Cline
Roo Code
Aider
Continue
Hermes Agent
OpenCode
OpenAI SDK
Anthropic SDK
LiteLLM
LangChain
Custom Node.js
Custom Python
```

Each card:

- name
- compatibility mode
- docs link
- setup time

Example:

```text
Cline
OpenAI / Anthropic
Setup: 2 min
```

### 24I.11 Security Section

Use 6 cards:

```text
Hashed API keys
Per-key quotas
Key expiration
Token ledger
Anti-abuse scoring
Admin audit logs
```

Copy direction:

```text
QLens AI is designed for public SaaS usage with API key safety, quota controls, payment verification, and abuse protection from day one.
```

### 24I.12 Pricing Section

Pricing cards must feel clean and minimal.

Plans:

```text
Free Trial
Starter
Pro
Max
Custom
Top Up Token
```

Each card:

- price
- quota
- model access
- API key count
- RPM/TPM
- primary CTA
- “Best for” line

Highlighted card:

```text
Pro
Recommended
```

Top Up Token card must visually stand out:

```text
Top Up Token
Use extra token balance after your daily quota is reached.
```

### 24I.13 Docs Preview Section

Docs preview should show:

- left sidebar
- main article
- code block
- right table of contents

Preview tabs:

```text
Quickstart
Authentication
OpenAI
Anthropic
Streaming
Rate Limits
```

The docs page must feel like a real developer docs product, not a blog.

### 24I.14 FAQ Section

FAQ questions:

```text
Is QLens AI OpenAI-compatible?
Is QLens AI Anthropic-compatible?
What is a qlens-sk- key?
What happens when my daily quota is used up?
How does top up token work?
Can I use QLens AI in Cline or Roo Code?
Can I set per-key limits?
How do I rotate an API key?
What models are available?
How is abuse prevented on the free plan?
```

---

## 24J. Dashboard / Console — OpenModel-Style UI Blueprint

### 24J.1 Console Shell

Console must have:

```text
Left sidebar
Top bar
Main content area
Right optional activity panel
```

Sidebar style:

- fixed width: 240px
- dark surface
- active item subtle glow
- section labels
- icon + text
- collapsed mode optional

Top bar:

- page title
- environment badge
- status badge
- user menu
- support/docs quick link

### 24J.2 User Console Pages

Required pages:

```text
Overview
API Keys
Usage
Models
Billing
Top Up Token
Logs
Docs
Settings
Support
```

### 24J.3 Overview Page Layout

Desktop grid:

```text
Row 1:
Current Plan | Daily Quota | Monthly Quota | Top Up Token

Row 2:
Quickstart Card | Base URLs Card

Row 3:
Usage Chart

Row 4:
Latest Requests Table | Model Health Mini Panel
```

Mobile:

- cards stack vertically
- quickstart remains near top
- code block horizontally scrollable

### 24J.4 Quickstart Card

Card tabs:

```text
OpenAI
Anthropic
Env
Node
Python
```

Must include copy buttons for:

- base URL
- API key
- model name
- full snippet

### 24J.5 API Keys Page

OpenModel-style key management pattern:

```text
Header:
API Keys
Create and manage keys for your apps and agents.

Primary button:
Create key

Table:
Name
Key
Mode
Status
Created
Last used
Usage today
Limit
Actions
```

Create key modal:

```text
Key name
Environment
Allowed protocols
Allowed models
Daily token limit
Monthly token limit
Expiration
```

After key creation:

```text
Copy your key now
qlens-sk-live_xxxxxxxxxxxxxxxxx

This key is only shown once.
```

### 24J.6 Usage Page

Must feel like a billing/ops console.

Sections:

```text
Usage Summary
Token Chart
Model Breakdown
API Key Breakdown
Deduction Source
Error Rate
Latency
Export
```

Charts:

- area chart for tokens
- bar chart for models
- donut/pill split for deduction sources
- table for daily usage

### 24J.7 Logs Page

Logs must look like an ops console.

Table columns:

```text
Time
Request ID
Protocol
Endpoint
Model
Key
Status
Tokens
Deduction
Latency
Error
```

Filters:

```text
Date
Protocol
Model
Key
Status
Error
Deduction
```

Row details drawer:

```text
Request metadata
Response status
Token usage
Deduction source
Rate limit state
Error detail
```

### 24J.8 Billing + Top Up Page

Tabs:

```text
Plan
Top Up
Invoices
Token Ledger
```

Top Up page:

- balance card
- package cards
- payment method
- invoice history
- ledger table

Token ledger table:

```text
Time
Type
Amount
Balance After
Source
Reference
```

### 24J.9 Models Page

Model list:

```text
Search
Filters
Cards/table toggle
```

Model table columns:

```text
Model
Protocol
Category
Context
Plan
Status
Latency
Action
```

Model detail drawer:

```text
Description
Use cases
Protocol support
Endpoint examples
Rate limits
Plan access
Recent status
```

### 24J.10 Settings Page

Settings groups:

```text
Account
Security
Notifications
API Defaults
Billing Profile
Sessions
Danger Zone
```

---

## 24K. Admin Console — OpenModel-Style Ops View

### 24K.1 Admin Shell

Admin console should feel like infra ops.

Pages:

```text
Admin Overview
Users
Plans
Models
API Keys
Requests
Usage
Payments
Top Up Ledger
Model Health
Abuse Monitor
Audit Logs
Settings
```

### 24K.2 Admin Overview Layout

Top cards:

```text
Revenue Today
Revenue This Month
Requests Today
Tokens Today
Paid Users
Free Users
Error Rate
Abuse Alerts
```

Charts:

```text
Revenue trend
Token usage trend
Model demand
Plan distribution
Error rate
Signup velocity
```

Tables:

```text
Top users
Top models
Recent payments
Recent abuse alerts
```

### 24K.3 Model Health Page

Model health table:

```text
Model
Route
Protocol
Status
Latency p50
Latency p95
Error Rate
RPM
TPM
Active Streams
Last Check
Action
```

Status detail drawer:

```text
Heartbeat history
Recent errors
Route config
Last successful test
Manual action log
```

### 24K.4 Abuse Monitor Page

Abuse monitor is required because QLens AI has free trial.

Main layout:

```text
Risk Queue
Duplicate Groups
Shared Key Alerts
High Velocity Signups
Disposable Email Users
Free Heavy Users
Manual Review
```

Each alert card:

```text
Risk score
User
Trigger reason
Related accounts
Usage
Recommended action
```

Admin action buttons:

```text
Watchlist
Restrict
Suspend
Revoke Key
Require Verification
Whitelist
```

---

## 24L. Exact Frontend Implementation Notes

### 24L.1 Recommended Stack

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
Recharts or Tremor charts
Framer Motion for subtle animation
next-themes for theme
react-syntax-highlighter or shiki for code blocks
TanStack Table for logs/tables
Zod for form validation
```

### 24L.2 Frontend Folder Structure

```text
app/
  page.tsx
  pricing/page.tsx
  models/page.tsx
  docs/...
  status/page.tsx
  login/page.tsx
  register/page.tsx
  dashboard/...
  admin/...

components/
  layout/
  marketing/
  console/
  docs/
  pricing/
  models/
  charts/
  tables/
  code/
  ui/

lib/
  api.ts
  auth.ts
  format.ts
  constants.ts
  theme.ts
```

### 24L.3 Required Components

Marketing:

```text
MarketingHeader
HeroProtocolCard
ProtocolTabs
ModelCatalogPreview
ConsolePreview
PricingCards
IntegrationGrid
SecurityCards
DocsPreview
FAQAccordion
MarketingFooter
```

Console:

```text
ConsoleShell
SidebarNav
TopBar
MetricCard
UsageChart
QuotaProgress
TopupBalanceCard
ApiKeyTable
CreateKeyModal
RequestLogTable
ModelHealthBadge
BillingInvoiceTable
TokenLedgerTable
```

Admin:

```text
AdminShell
AdminMetricGrid
UserRiskBadge
AbuseAlertTable
ModelHealthTable
PaymentTable
AuditLogTable
```

### 24L.4 Motion Rules

Use subtle animation:

```text
Hero card fade-in
Cards slight hover translateY(-2px)
Protocol tab smooth switch
Dashboard preview slow glow
Charts animate on load
No excessive bounce
No distracting motion
```

### 24L.5 Responsive Rules

Breakpoints:

```text
mobile: 360–767px
tablet: 768–1023px
desktop: 1024–1439px
wide: 1440px+
```

Mobile priorities:

1. CTA visible
2. API key/base URL easy to copy
3. quota cards readable
4. code blocks horizontally scroll
5. tables become cards
6. sidebar becomes drawer

---

## 24M. Frontend Acceptance Criteria

Design is accepted only if:

```text
Landing page feels like a premium AI API gateway website.
Hero clearly shows OpenAI + Anthropic compatibility.
Hero includes real API/code preview.
Dark theme is polished, not generic.
Model catalog exists and looks production-grade.
Dashboard preview exists on landing page.
User dashboard exposes API key/base URL immediately.
Usage and top up token are visually clear.
Logs table looks like an ops console.
Docs page looks like developer docs, not a blog.
Admin pages look operational and serious.
Mobile layout is not broken.
No public UI text uses “AI Gateway”.
No OpenModel logo, exact copywriting, or assets are copied.
```

---

## 24N. Patch Summary for Developer

Apply this frontend direction:

```text
OpenModel-style dark developer SaaS
+
QLens AI brand identity
+
OpenAI and Anthropic compatibility
+
usage/topup transparency
+
ops console/dashboard clarity
+
anti-abuse/admin seriousness
```

The frontend must not look like:

```text
simple admin template
generic SaaS landing
reseller panel
crypto dashboard
random API proxy UI
```

It must look like:

```text
a serious AI API gateway product that developers trust within 5 seconds.
```

---

## 25. Documentation Requirements

### 25.1 Docs Sections

Docs must include:

- Quickstart
- API Keys
- OpenAI-Compatible API
- Anthropic-Compatible API
- Models
- Streaming
- Errors
- Rate Limits
- Quota & Top Up
- Tool Setup
- SDK Examples
- FAQ

### 25.2 OpenAI-Compatible Docs

Include:

- cURL
- Node.js OpenAI SDK
- Python OpenAI SDK
- LangChain OpenAI adapter
- LiteLLM OpenAI mode
- Cline setup
- Roo setup
- Aider setup
- Continue setup
- Hermes Agent setup

### 25.3 Anthropic-Compatible Docs

Include:

- cURL
- Anthropic SDK
- Messages API format
- Claude Code compatible setup where custom base URL is supported
- Cline Anthropic mode
- Roo Anthropic mode
- Continue Anthropic mode
- LiteLLM Anthropic mode
- LangChain Anthropic adapter
- OpenCode Anthropic setup

### 25.4 Required Docs Warning

Every docs page should explain:

```text
Some tools require support for custom base URL. If a tool does not allow custom Anthropic/OpenAI base URL, use LiteLLM, adapter mode, or the OpenAI-compatible route if supported.
```

---

## 26. Error Codes

### 26.1 Common Error Codes

| Code | Meaning |
|---|---|
| invalid_api_key | API key invalid |
| revoked_api_key | API key revoked |
| account_suspended | User suspended |
| account_restricted | User restricted |
| model_not_found | Model unavailable |
| model_not_allowed | Plan cannot use model |
| quota_exceeded | No quota/topup available |
| rate_limit_exceeded | Rate limit hit |
| service_unavailable | Internal service unavailable |
| timeout | Request timeout |
| invalid_request | Bad payload |
| payment_required | Paid access required |
| abuse_restricted | Restricted by abuse system |

### 26.2 OpenAI Error Example

```json
{
  "error": {
    "message": "Model not allowed for your current plan.",
    "type": "invalid_request_error",
    "code": "model_not_allowed"
  }
}
```

### 26.3 Anthropic Error Example

```json
{
  "type": "error",
  "error": {
    "type": "invalid_request_error",
    "message": "Model not allowed for your current plan."
  }
}
```

---

## 27. Notifications and Alerts

### 27.1 User Notifications

Trigger notifications for:

- payment success
- payment failed
- quota 80% used
- quota 100% used
- top up balance low
- API key created
- API key revoked
- suspicious API key usage
- account restricted

Channels:

- dashboard notification
- email
- optional Telegram later

### 27.2 Admin Notifications

Trigger alerts for:

- service down
- high error rate
- high latency
- payment webhook failure
- abuse spike
- registration spike
- extreme token usage
- repeated failed auth
- possible public leaked key

---

## 28. Observability and Monitoring

### 28.1 Metrics

Track:

- request count
- token count
- success rate
- error rate
- latency p50/p95/p99
- usage by model
- usage by plan
- usage by user
- revenue
- top up sales
- service status
- abuse score trends

### 28.2 Logging

All requests must include:

- request_id
- user_id
- api_key_id
- compatibility mode
- model
- status code
- latency
- token usage
- error code

Never log:

- raw API key
- raw password
- full sensitive user data
- internal secrets

### 28.3 Monitoring Tools

MVP:

- Sentry
- UptimeRobot
- database logs
- Redis metrics

Production:

- Prometheus
- Grafana
- Loki
- ClickHouse
- alertmanager

---

## 29. Testing and QA

### 29.1 Unit Tests

Cover:

- API key generation
- API key validation
- quota deduction
- top up ledger
- rate limit
- model access
- OpenAI request normalization
- Anthropic request normalization
- error formatting
- payment webhook validation
- risk score calculation

### 29.2 Integration Tests

Cover:

- register to first API call
- payment success to quota activation
- daily quota exhausted to topup fallback
- revoked key blocked
- suspended user blocked
- model disallowed blocked
- streaming OpenAI response
- streaming Anthropic response
- internal service timeout
- payment webhook duplicate event

### 29.3 Load Tests

Test:

- concurrent API requests
- streaming concurrency
- Redis rate limit performance
- DB write volume for logs
- payment webhook burst
- model list endpoint

### 29.4 Security Tests

Test:

- API key leakage in logs
- brute force login
- register spam
- free trial farming
- key sharing detection
- webhook replay
- CORS misconfig
- admin privilege escalation
- SQL injection
- XSS on dashboard/logs

### 29.5 Acceptance Tests

MVP cannot ship unless:

- user can create `qlens-sk-` key
- OpenAI-compatible request works
- Anthropic-compatible request works
- usage logs appear
- quota deducts correctly
- top up overflow works
- free plan abuse controls work basic
- payment webhook activates top up
- admin can suspend user
- revoked key immediately fails
- no raw API key in DB/logs

---

## 30. Deployment Plan

### 30.1 Environments

Use three environments:

```text
development
staging
production
```

### 30.2 Required Environment Variables

```env
APP_ENV=production
APP_URL=https://qlens.ai
API_BASE_URL=https://api.qlens.ai
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
API_KEY_HASH_SECRET=
ENCRYPTION_KEY=
PAYMENT_PROVIDER=
PAYMENT_SECRET=
INTERNAL_MODEL_BASE_URL=
SENTRY_DSN=
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
```

### 30.3 Deployment Steps

1. Setup domain.
2. Setup Cloudflare DNS.
3. Deploy web app.
4. Deploy API gateway.
5. Setup database.
6. Run migrations.
7. Setup Redis.
8. Setup payment provider.
9. Setup webhook endpoint.
10. Setup email provider.
11. Connect internal model services.
12. Setup monitoring.
13. Run staging tests.
14. Run production smoke test.
15. Launch private beta.
16. Monitor logs.
17. Expand public access gradually.

### 30.4 Production Smoke Test

Before public launch:

- register test user
- verify email
- create API key
- call `/v1/models`
- call OpenAI `/v1/chat/completions`
- call Anthropic `/v1/messages`
- exhaust daily test quota
- confirm topup fallback
- revoke key
- confirm revoked key blocked
- create payment test invoice
- confirm webhook activation
- check admin logs

---

## 31. Production Readiness Checklist

### 31.1 Product

- [ ] Landing page complete
- [ ] Pricing clear
- [ ] Docs complete
- [ ] User dashboard ready
- [ ] Admin dashboard ready
- [ ] Free plan limits configured
- [ ] Top up packages configured
- [ ] Models configured

### 31.2 API

- [ ] OpenAI-compatible endpoint works
- [ ] Anthropic-compatible endpoint works
- [ ] Streaming works
- [ ] Errors are compatible
- [ ] Rate limit works
- [ ] Quota works
- [ ] Top up fallback works
- [ ] Request logs work
- [ ] Usage logs work

### 31.3 Billing

- [ ] Payment provider connected
- [ ] Webhook verified
- [ ] Invoice created
- [ ] Top up token credited
- [ ] Subscription activated
- [ ] Duplicate webhook safe
- [ ] Admin payment view ready

### 31.4 Security

- [ ] API keys hashed
- [ ] Raw keys never stored
- [ ] Admin 2FA ready
- [ ] Secrets encrypted
- [ ] CORS configured
- [ ] Rate limit enabled
- [ ] CAPTCHA enabled
- [ ] Disposable email block enabled
- [ ] Abuse monitor enabled
- [ ] Audit logs enabled

### 31.5 Infrastructure

- [ ] Domain ready
- [ ] SSL ready
- [ ] Database backup ready
- [ ] Redis ready
- [ ] Monitoring ready
- [ ] Error tracking ready
- [ ] Health check ready
- [ ] Staging environment ready
- [ ] Rollback plan ready

---

## 32. Roadmap

### Phase 1 — MVP Core

- Landing page
- Auth
- Dashboard
- API key
- OpenAI-compatible API
- Anthropic-compatible API
- Usage logs
- Plan quota
- Admin basics

### Phase 2 — Billing & Top Up

- Payment gateway
- Top up token
- Token ledger
- Subscription plan
- Payment webhook
- Invoice history

### Phase 3 — Anti-Abuse & Stability

- Risk score
- Abuse monitor
- CAPTCHA adaptive
- Disposable email block
- Shared key detection
- Model health
- Status page

### Phase 4 — Growth

- Better docs
- Referral
- Affiliate
- Public status
- Telegram/Discord support
- Model comparison page

### Phase 5 — Scale

- ClickHouse logs
- advanced routing
- better cost dashboard
- enterprise plan
- team accounts
- custom SLA

---

## 33. Final MVP Acceptance Definition

QLens AI MVP is production-ready when this is true:

```text
A real user can:
1. Register
2. Verify email
3. Create qlens-sk- API key
4. Use OpenAI-compatible endpoint
5. Use Anthropic-compatible endpoint
6. See usage
7. Hit daily quota
8. Continue using paid top up token
9. Pay for plan/topup
10. Manage keys and billing
```

And admin can:

```text
1. View all users
2. View all usage
3. View all payments
4. Manage plans
5. Manage models
6. Monitor gateway/model health
7. Detect suspicious accounts
8. Suspend/restrict users
9. Revoke API keys
10. Audit all critical actions
```

---

## 34. Final Product Statement

**QLens AI** adalah SaaS AI API Gateway untuk menjual akses ke infrastruktur model QLens dengan:

- API key format `qlens-sk-`
- OpenAI-compatible API
- Anthropic-compatible API
- token quota
- top up token
- auto overflow ke top up saat daily quota mentok
- billing/payment
- usage tracking
- admin dashboard
- model health monitoring
- anti-clone/anti-bulk/anti-free-plan-abuse
- production security
- documentation for AI tools

Final core promise:

> User bayar atau top up → dapat `qlens-sk-` key → pakai endpoint OpenAI/Anthropic-compatible → request masuk ke QLens AI Gateway → quota otomatis tercatat dan terpotong → admin bisa monitor revenue, usage, health, dan abuse.

---

## 35. Build Priority Order

Build in this exact order to avoid overengineering:

1. Database schema
2. Auth + email verification
3. API key system
4. Basic user dashboard
5. Internal model service connection
6. `/v1/models`
7. OpenAI `/v1/chat/completions`
8. OpenAI `/v1/responses` compatibility layer
9. Anthropic `/v1/messages`
10. Usage logs
11. Quota deduction
12. Top up ledger
13. Payment webhook
14. Admin dashboard
15. Abuse basic
16. Docs
17. Production monitoring
18. Public launch

---

## 36. Notes for Developer / AI Coding Agent

When implementing:

- Do not expose internal model service URL to users.
- Do not store raw API keys.
- Do not skip token ledger.
- Do not make free plan unlimited.
- Do not put secrets in frontend.
- Do not log full API keys.
- Do not implement payment without webhook signature verification.
- Do not build reseller/marketplace features in MVP.
- Do not add risky features like proxy/VCC/account panel to public UI.
- Do not ship without revoke/suspend controls.
- Do not ship without request logs.
- Do not ship without staging smoke test.
- Keep public product language clean: use “QLens AI Gateway”, “model access”, “model infrastructure”, or “internal model services”.

Build QLens AI as a serious API business first, not as a feature-bloated dashboard.

---


---

## 37. Final Production Readiness Audit

### 37.1 Audit Result

Status after audit:

```text
PRD readiness: PASS
Security planning: PASS
SaaS production architecture: PASS
Billing and quota planning: PASS
API compatibility planning: PASS
Admin/ops planning: PASS
Anti-abuse planning: PASS
UI/Frontend planning: PASS
Remaining requirement before real launch: implementation-level testing, staging validation, and security review.
```

This PRD is now ready to be used as a production SaaS build specification.

Important clarification:

```text
A PRD can be production-ready as a build document.
Actual production readiness still depends on correct implementation, testing, deployment, monitoring, and real security validation before launch.
```

### 37.2 Audit Scope

This audit checks:

- product definition
- OpenAI-compatible API requirements
- Anthropic-compatible API requirements
- API key lifecycle
- quota and top up token logic
- billing and webhook safety
- database schema
- admin dashboard
- abuse prevention
- frontend UI blueprint
- docs requirements
- logging and monitoring
- security controls
- launch checklist
- failure handling
- operational runbooks

### 37.3 Final Decision

QLens AI v1.4 PRD is approved for:

```text
private MVP development
staging implementation
security test planning
payment integration planning
closed beta launch preparation
production launch preparation after implementation passes acceptance tests
```

Do not launch publicly until all Production Launch Gates in Section 45 pass.

---

## 38. Security Audit Against API SaaS Risks

### 38.1 API Security Risk Coverage

QLens AI must explicitly mitigate the following API SaaS risk categories:

| Risk Area | Required Mitigation |
|---|---|
| Broken object authorization | User can only access own keys, logs, invoices, usage, and settings |
| Broken authentication | Strong session handling, secure password hashing, email verification, 2FA for admin |
| Broken object property authorization | Do not expose hidden/internal fields in API responses |
| Unrestricted resource consumption | Rate limits, token limits, request body limit, max_tokens cap, concurrency cap |
| Broken function authorization | RBAC/permission checks for admin endpoints |
| Unrestricted access to sensitive flows | Protect model routes, internal service routes, billing webhook, admin APIs |
| Server-side request risks | Internal model routing must use allowlisted destinations only |
| Security misconfiguration | Secure headers, CORS allowlist, no debug mode in production |
| Improper inventory management | Track API versions, docs, routes, models, webhooks |
| Unsafe API consumption | Validate and sanitize all internal service responses before returning to user |

### 38.2 QLens AI Required Security Baseline

Minimum baseline:

```text
HTTPS only
secure cookies
CSRF protection for dashboard actions
CORS allowlist
strict content security policy
HSTS
rate limit on auth and API endpoints
request body size limit
input validation with schema
output filtering
admin 2FA
RBAC
audit logs
secret encryption
API key hashing
payment webhook signature verification
database backup encryption
staging/prod separation
```

### 38.3 Security Acceptance Rule

If any item below is missing, production launch is blocked:

```text
raw API keys are stored
admin endpoints lack RBAC
payment webhook lacks signature verification
quota deduction is not ledger-backed
logs expose API keys
CORS allows all origins in production
debug mode is enabled in production
database backup is missing
no rate limiting exists
no revoke/suspend API key flow exists
```

---

## 39. Authentication, Authorization, and Session Hardening

### 39.1 User Authentication

Required:

- password hashing with Argon2id or bcrypt with strong cost
- email verification before free quota activation
- login rate limiting
- suspicious login detection
- reset password token expiry
- reset password token one-time use
- session expiration
- session revocation
- logout all devices
- optional 2FA for users
- mandatory 2FA for admin

### 39.2 Admin Authentication

Admin login must require:

```text
email + password
2FA
device/session tracking
login notification
audit log
optional IP allowlist
```

Admin high-risk actions must require confirmation:

- suspend user
- ban user
- revoke user key
- manual token credit
- manual token deduction
- mark payment paid
- disable model
- change plan quota
- change security settings

### 39.3 Authorization Model

Use RBAC with these roles:

```text
user
support
billing_admin
ops_admin
security_admin
superadmin
```

Permission matrix:

| Action | user | support | billing_admin | ops_admin | security_admin | superadmin |
|---|---:|---:|---:|---:|---:|---:|
| Manage own API keys | yes | no | no | no | no | yes |
| View own usage | yes | no | no | no | no | yes |
| View all users | no | yes | yes | yes | yes | yes |
| View all payments | no | no | yes | no | no | yes |
| Manual credit | no | no | yes | no | no | yes |
| Manage models | no | no | no | yes | no | yes |
| View abuse monitor | no | no | no | no | yes | yes |
| Suspend user | no | no | no | no | yes | yes |
| Change security config | no | no | no | no | yes | yes |
| Full system settings | no | no | no | no | no | yes |

### 39.4 Object Ownership Checks

Every user-scoped request must validate:

```text
resource.user_id == authenticated_user.id
```

Applies to:

- API keys
- usage logs
- request logs
- invoices
- token ledger
- settings
- billing profile
- notifications

### 39.5 Admin Audit Logs

Every admin action must write:

```text
actor_user_id
action
target_type
target_id
before_value
after_value
ip_hash
user_agent_hash
created_at
```

---

## 40. API Key Security Hardening

### 40.1 API Key Format

Final format:

```text
qlens-sk-live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
qlens-sk-test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 40.2 API Key Storage

Store:

```text
key_hash
key_prefix
environment
created_at
last_used_at
status
```

Never store:

```text
raw API key
full key in logs
full key in analytics
full key in error reporting
full key in browser localStorage
```

### 40.3 Hashing Recommendation

Use:

```text
HMAC-SHA256(raw_key, API_KEY_HASH_SECRET)
```

Lookup flow:

```text
extract raw key from request
compute HMAC hash
lookup key_hash
constant-time comparison when needed
discard raw key immediately
```

### 40.4 API Key Lifecycle

States:

```text
active
revoked
suspended
expired
compromised
```

Required actions:

- create
- reveal once
- rename
- set limits
- rotate
- revoke
- expire
- suspend
- mark compromised

### 40.5 Key-Level Controls

Each key can have:

```text
daily token limit
monthly token limit
RPM
TPM
allowed models
allowed protocol: openai/anthropic/both
allowed origins optional
expiration date optional
IP allowlist optional for advanced users
```

### 40.6 Key Leak Response

If leaked key suspected:

```text
1. mark key as compromised
2. revoke immediately
3. notify user
4. show rotation instructions
5. preserve logs for investigation
6. block suspicious related traffic
```

---

## 41. Billing, Quota, and Ledger Hardening

### 41.1 Golden Rule

All token balance changes must be ledger-backed.

Never update token balance without:

```text
token_ledger row
reference_id
balance_after
audit trail
transaction boundary
```

### 41.2 Transaction Safety

Quota deduction must happen inside a database transaction or reliable atomic flow:

```text
start transaction
lock user balance row
check available quota/topup
insert usage log
insert token ledger row if topup used
update quota counters
commit
```

If streaming request:

```text
reserve estimated amount or enforce max_tokens cap
stream response
calculate actual usage
settle final deduction
release unused reservation if applicable
```

### 41.3 Top Up Fallback Rules

Final rule:

```text
daily plan quota is used first
if daily quota is exhausted, top up token balance is used
if monthly quota is exhausted, top up token balance may be used if enabled by plan
if top up balance is insufficient, request is blocked
```

### 41.4 Overdraft Prevention

Prevent negative token balance:

```text
database check constraint
atomic balance update
max_tokens cap
stream settlement guard
insufficient balance error
```

### 41.5 Payment Webhook Idempotency

Every webhook must be idempotent:

```text
provider_event_id unique
payment_reference unique
idempotency_key unique
ignore duplicate successful webhook
log duplicate event
```

### 41.6 Payment Fraud Safety

Required:

- verify webhook signature
- verify invoice amount
- verify currency
- verify invoice owner
- verify invoice status
- reject expired invoice payment if provider allows
- do not activate quota from client-side success page alone

### 41.7 Manual Credit Safety

Manual token adjustment requires:

```text
admin role: billing_admin or superadmin
reason field required
confirmation modal
audit log
token ledger entry
optional 2FA re-auth for large amount
```

---

## 42. Abuse Prevention Final Hardening

### 42.1 Free Trial Activation Policy

Free trial quota should activate only after:

```text
email verified
risk score below threshold
CAPTCHA passed if triggered
no duplicate high-confidence fingerprint
no blocked disposable email domain
registration velocity safe
```

### 42.2 Free User Limits

Final recommended free plan limits:

```text
max active keys: 1
allowed model: qlens-lite only
low RPM
low TPM
low daily quota
no priority queue
no large context model
no high concurrency streaming
no repeated trial reset
```

### 42.3 Abuse Risk Signals

Risk scoring must include:

```text
email domain reputation
IP velocity
subnet velocity
ASN type
fingerprint duplication
timezone mismatch
country mismatch
login velocity
API key sharing pattern
request concurrency
token burn velocity
failed auth attempts
payment risk flags
```

### 42.4 Automated Abuse Actions

Risk score action:

```text
0-30: allow
31-60: allow + monitor
61-80: restrict + CAPTCHA + lower limit
81-100: block or manual review
```

### 42.5 User Appeal / False Positive

Dashboard should provide:

```text
contact support
manual review request
clear explanation that account is restricted
no exposure of internal detection rules
```

### 42.6 Anti-Enumeration

Do not reveal whether:

- email exists
- fingerprint matched
- exact abuse rule triggered
- specific IP blocked reason

Use generic messages.

---

## 43. Infrastructure and Deployment Hardening

### 43.1 Environment Separation

Must have:

```text
development
staging
production
```

Rules:

- staging uses separate DB
- staging uses separate Redis
- staging uses separate payment sandbox
- production secrets never used locally
- production data never copied to dev without anonymization

### 43.2 Secrets Management

Required:

```text
all secrets in environment/secret manager
no secrets in Git
no secrets in frontend bundle
rotation process
least privilege credentials
separate prod/staging keys
```

### 43.3 Network Security

Production should use:

```text
Cloudflare DNS/WAF
HTTPS only
HSTS
origin locked to Cloudflare or private network
database not publicly exposed
Redis not publicly exposed
internal model services not publicly exposed
admin route protected
```

### 43.4 Backup and Disaster Recovery

Minimum:

```text
daily database backup
backup encryption
restore test monthly
RPO target: 24 hours for MVP
RTO target: 4 hours for MVP
config backup
migration rollback plan
```

### 43.5 CI/CD Safety

Pipeline must include:

```text
type check
lint
unit tests
integration tests
dependency vulnerability scan
secret scan
migration check
build test
staging deploy
smoke test
manual approval before production
```

### 43.6 Dependency and Supply Chain

Required:

- lockfile committed
- dependency audit
- automated security updates
- no abandoned critical packages
- package integrity checks
- container image scanning if using Docker
- pin runtime versions

---

## 44. Privacy, Data Retention, and Compliance Readiness

### 44.1 Data Minimization

Store only what is needed:

```text
email
hashed password
billing references
usage metadata
request metadata
token counts
hashed IP/fingerprint where possible
```

Avoid storing:

```text
raw prompts by default
raw completions by default
full API keys
unnecessary personal data
payment card data
```

### 44.2 Request Content Logging

Default recommendation:

```text
Do not store request/response content by default.
Store metadata only.
```

If debugging content logs are needed:

```text
make it opt-in
mask secrets
set short retention
admin access only
show user setting
document in privacy policy
```

### 44.3 Retention Policy

Recommended:

| Data | Retention |
|---|---:|
| request metadata | 90 days |
| usage logs | 12 months |
| payment records | based on legal/accounting needs |
| abuse logs | 12 months |
| audit logs | 12–24 months |
| raw debug content | disabled or 7 days max |
| deleted account personal data | delete/anonymize within defined policy |

### 44.4 User Rights

Support:

- export account data
- delete account request
- revoke all API keys
- remove sessions
- billing record handling according to legal needs

### 44.5 Policy Pages

Required before public launch:

```text
Terms of Service
Privacy Policy
Acceptable Use Policy
Refund Policy
Fair Usage Policy
Contact Page
Status Page
```

---

## 45. Production Launch Gates

### 45.1 Gate A — Product

Launch blocked unless:

```text
landing page complete
pricing page complete
docs page complete
user dashboard complete
admin dashboard complete
API key creation works
top up token page works
billing page works
models page works
status page basic works
```

### 45.2 Gate B — API

Launch blocked unless:

```text
/v1/models works
/v1/chat/completions works
/v1/messages works
streaming works
non-stream works
OpenAI-compatible errors work
Anthropic-compatible errors work
rate limit works
quota works
top up fallback works
revoked key blocked
suspended user blocked
```

### 45.3 Gate C — Billing

Launch blocked unless:

```text
payment sandbox test passes
payment production config verified
webhook signature verified
idempotency works
invoice status works
top up credit works
subscription activation works
duplicate webhook does not double-credit
manual credit audited
```

### 45.4 Gate D — Security

Launch blocked unless:

```text
admin 2FA enabled
API keys hashed
raw keys not stored
logs scrub secrets
CORS locked
CSP configured
CSRF protection enabled for dashboard
rate limiting active
CAPTCHA active
disposable email block active
abuse monitor active
audit logs active
secret scan clean
dependency scan clean
```

### 45.5 Gate E — Infrastructure

Launch blocked unless:

```text
domain and SSL ready
Cloudflare/WAF configured
database backup enabled
restore test completed
Redis configured
monitoring enabled
error tracking enabled
uptime checks enabled
health checks enabled
rollback plan ready
staging smoke test passed
production smoke test passed
```

### 45.6 Gate F — Legal and Support

Launch blocked unless:

```text
terms published
privacy policy published
acceptable use policy published
refund policy published
support contact ready
abuse contact ready
incident response owner defined
```

---

## 46. Operational Runbooks

### 46.1 Runbook: Internal Model Service Down

Steps:

```text
1. Confirm health page status
2. Check error rate and latency
3. Set affected model status to degraded/down
4. Disable affected model if needed
5. Show status page incident
6. Notify admin/support
7. Restore route
8. Verify with test request
9. Close incident with summary
```

### 46.2 Runbook: Payment Webhook Failure

Steps:

```text
1. Check payment provider dashboard
2. Check webhook logs
3. Verify signature errors
4. Replay webhook if safe
5. Run reconciliation job
6. Manually credit only after verification
7. Audit manual action
8. Fix root cause
```

### 46.3 Runbook: API Key Leak

Steps:

```text
1. Identify key prefix
2. Mark key compromised
3. Revoke key
4. Notify user
5. Provide rotation steps
6. Review recent logs
7. Restrict related suspicious traffic
8. Audit event
```

### 46.4 Runbook: Abuse Spike

Steps:

```text
1. Open Abuse Monitor
2. Identify pattern
3. Increase CAPTCHA sensitivity
4. Lower free plan rate temporarily
5. Block disposable domain/IP cluster if high confidence
6. Restrict suspicious users
7. Preserve logs
8. Review false positives
```

### 46.5 Runbook: Database Incident

Steps:

```text
1. Put system in maintenance mode if needed
2. Stop writes if data corruption suspected
3. Check latest backup
4. Restore to staging first
5. Validate integrity
6. Restore production if required
7. Verify user balances and ledger
8. Publish incident note if needed
```

---

## 47. Final QA Test Matrix

### 47.1 User Flow Tests

| Test | Expected |
|---|---|
| Register new user | account created |
| Verify email | email_verified true |
| Create API key | qlens-sk- key shown once |
| Revoke API key | request blocked immediately |
| Login/logout | session valid/cleared |
| Reset password | one-time token works |
| Delete account request | workflow created |

### 47.2 API Tests

| Test | Expected |
|---|---|
| GET /v1/models with valid key | model list returned |
| GET /v1/models with invalid key | invalid_api_key |
| OpenAI chat non-stream | valid response |
| OpenAI chat stream | valid SSE |
| Anthropic messages non-stream | valid response |
| Anthropic messages stream | valid event stream |
| Disallowed model | model_not_allowed |
| Rate limit hit | rate_limit_exceeded |
| Quota exhausted no topup | quota_exceeded |
| Daily quota exhausted with topup | request allowed, topup deducted |

### 47.3 Billing Tests

| Test | Expected |
|---|---|
| Create top up invoice | pending invoice |
| Pay invoice webhook | token credited |
| Duplicate webhook | no double credit |
| Wrong amount webhook | rejected |
| Expired invoice | not activated |
| Manual credit | ledger + audit log |
| Manual deduction | ledger + audit log |

### 47.4 Abuse Tests

| Test | Expected |
|---|---|
| Disposable email register | blocked or challenged |
| Many accounts same fingerprint | restricted |
| Free key used across many IPs | alert |
| High token burn free user | restrict |
| Failed auth burst | rate limited |
| Suspicious signup velocity | CAPTCHA/restrict |

### 47.5 Admin Tests

| Test | Expected |
|---|---|
| Non-admin access admin route | blocked |
| Support views payments | blocked unless permission |
| Billing admin manual credit | allowed + audit |
| Ops admin disables model | allowed + audit |
| Security admin suspends user | allowed + audit |
| Admin without 2FA | blocked from production admin |

---

## 48. Final Risk Register

| Risk | Severity | Mitigation |
|---|---|---|
| Free trial abuse | High | risk scoring, CAPTCHA, fingerprint, low free limits |
| Token balance bug | High | ledger, transactions, tests |
| API key leak | High | hash keys, reveal once, revoke, scrub logs |
| Payment double credit | High | idempotency, unique provider event ID |
| Internal service outage | High | health checks, degraded mode, status page |
| Unexpected token cost | High | max_tokens cap, rate limit, quota precheck |
| Admin account compromise | Critical | 2FA, audit logs, IP allowlist optional |
| Data leakage in logs | High | metadata-only logs, secret scrubbing |
| Broken object access | Critical | ownership checks, RBAC tests |
| Poor UI onboarding | Medium | quickstart card, docs, copy buttons |
| Slow dashboard | Medium | pagination, indexes, async aggregation |
| Log table too large | Medium | retention, indexing, later ClickHouse |

---

## 49. Final Implementation Notes

### 49.1 Must Not Ship Without

```text
API key hashing
ledger-backed token balance
payment webhook idempotency
admin 2FA
RBAC
rate limiting
quota limits
top up fallback test
request logs
usage logs
abuse monitor
backup restore test
production smoke test
```

### 49.2 Strong Recommendation

Before public launch, run:

```text
closed beta with 5-20 trusted users
staging load test
payment sandbox test
API compatibility test with Cline/Roo/Aider/LiteLLM
manual security review
backup restore drill
incident response drill
```

### 49.3 Final Verdict

```text
QLens AI PRD v1.4 is production-ready as a specification.
Proceed to implementation.
Public SaaS launch requires passing all launch gates and acceptance tests.
```

---


---

## 50. Security Reference Standards Used for Final Audit

This PRD should be implemented and tested against these public security references:

- OWASP API Security Top 10 2023 for API-specific risk categories.
- OWASP Application Security Verification Standard for application security control verification.
- OWASP REST Security Cheat Sheet for HTTPS-only API design and REST service security.
- OWASP Authentication and Session Management Cheat Sheets for auth/session design.
- NIST SP 800-63B for digital identity and authentication assurance guidance.

These references are not a replacement for implementation testing. They are the baseline used to shape QLens AI security requirements.

---

# End of PRD
