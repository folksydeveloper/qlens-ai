# QLens AI — MAKE NO MISTAKE + FULL AUTONOMOUS Execution Prompt

## ⚠️ ZERO-MISTAKE MANDATE
This prompt carries the highest execution standard. Every phase, every file, every endpoint — must be correct on the first attempt. No "close enough", no "we'll fix it later", no "stub for now".

**What "MAKE NO MISTAKE" means:**
- Read the ENTIRE prompt before starting any tool call
- Every file you write must compile/build before moving to the next file
- Every endpoint must have proper error handling, validation, and IDOR scoping
- Every DB query scoped to userId — NO EXCEPTIONS
- Run verification tests IMMEDIATELY after each phase — not at the end
- If something fails, fix it BEFORE proceeding to the next phase
- Double-check file paths, imports, and dependencies before writing
- When user says "udah?" → provide concrete test output (curl results, HTTP status, file diff)
- When you write code, verify it actually works with real tool output — don't claim "fixed" without running the test

**What "FULL AUTONOMOUS" means:**
- Execute everything without asking permission at each step
- Make reasonable defaults when PRD doesn't specify exact values
- Handle all errors yourself — don't escalate to user for every issue
- Build → Test → Fix → Proceed. No pauses, no "should I continue?"
- User wants "full autonomous 100% clear finished" — deliver a working artifact, not a plan
- When you hit a blocker, try an alternative approach before reporting back
- The deliverable is a DEPLOYABLE, TESTED, WORKING system — not documentation about one

## Context
PRD source: https://github.com/folksydeveloper/qlens-ai
Product: SaaS API Gateway — jual akses ke infrastruktur model internal QLens via API key `qlens-sk-`, billing, quota, top-up token, usage tracking, OpenAI-compatible + Anthropic-compatible API, anti-abuse system.
Owner: FolksyDEV / QLens AI
Version: v1.4 Final Production Readiness

---

## 🔴 MANDATORY RULES — READ BEFORE ANY TOOL CALL

1. **Build order matters**: Scaffold → DB → API → Gateway → Frontend → Anti-Abuse → Deploy → Test. Don't skip phases.
2. **No stubs**: Every endpoint must be fully functional. No `// TODO`, `return {}`, or placeholder responses.
3. **Test after each phase**: Don't build everything then test. Verify each component immediately.
4. **IDOR protection**: Every user-scoped query MUST include `where: { userId }` — scope by current user ID.
5. **Type safety**: Full TypeScript, no `any` except explicit catch blocks.
6. **Error handling**: Proper HTTP status codes + structured error bodies.
7. **Streaming**: Gateway MUST handle SSE properly for both OpenAI and Anthropic modes.
8. **Quota atomicity**: All quota operations use Prisma transactions to prevent race conditions.
9. **Backup before destructive ops**: Always backup DB before schema-changing migrations.
10. **User says "udah?" → stop, show evidence**: When asked, provide concrete test output (curl, file diff, log lines) — not "let me check X".
11. **GAUSAH OTAK ATIK HERMES**: Fix provider-side ONLY. Never modify Hermes config, api_server, or agent code.
12. **Raw API keys NEVER stored in DB**: Store only SHA-256 hash + prefix.
13. **Real tool output before "fixed"**: Never claim success without running actual test.
14. **Design follows PRD Section 24H/24I exactly**: OpenModel-style dark technical SaaS, 13 landing sections in exact order.
15. **No OpenModel brand copying**: Inspired by design quality, but original branding.
16. **Full autonomous execution**: Execute without asking permission. Make reasonable defaults. Handle errors yourself. Deliver working system.
17. **Make no mistake**: Read entire section before writing. Verify compiles. Test immediately. Fix before proceeding. Double-check paths, imports, dependencies.

---

## PHASE 1: PROJECT SCAFFOLD — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (1.1 through 1.6) before making ANY file
- Verify directory structure matches exactly
- After creating files, run `ls -R qlens-ai/` to verify structure
- Test: `cd qlens-ai && pnpm install` must succeed with zero errors

**Phase 1 success criteria:**
- [ ] Monorepo structure created exactly as specified
- [ ] `pnpm install` completes without errors
- [ ] `docker compose up -d` starts PostgreSQL and Redis
- [ ] TypeScript compilation works (no type errors in root config)

### 1.1 Monorepo Structure
```
qlens-ai/
├── pnpm-workspace.yaml
├── package.json (root, "workspaces": ["apps/*", "packages/*"])
├── tsconfig.base.json
├── .gitignore (node_modules, .env, .next, dist, prisma/dev.db)
├── .env.example
├── docker-compose.yml
├── apps/
│   ├── web/          (Next.js 14+ App Router, frontend)
│   ├── api/          (NestJS, REST API + Auth + Billing)
│   └── gateway/      (NestJS, OpenAI/Anthropic proxy layer)
└── packages/
    ├── db/           (Prisma schema + client)
    └── shared/       (Types, constants, utils)
```

### 1.2 Initialize
```bash
mkdir -p qlens-ai/{apps/{web,api,gateway},packages/{db,shared}}
cd qlens-ai
pnpm init  # root
pnpm create next-app apps/web --typescript --tailwind --app-router --eslint
pnpm create @nestjs/cli apps/api --package-manager pnpm --strict
pnpm create @nestjs/cli apps/gateway --package-manager pnpm --strict
cd packages/db && pnpm init && pnpm add -D prisma typescript @prisma/client
cd ../shared && pnpm init && pnpm add typescript
```

### 1.3 Root tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "declaration": true,
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  }
}
```

### 1.4 Root package.json
```json
{
  "name": "qlens-ai",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "pnpm --parallel -r dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "db:generate": "cd packages/db && npx prisma generate",
    "db:migrate": "cd packages/db && npx prisma migrate dev",
    "db:seed": "cd packages/db && npx prisma db seed",
    "db:studio": "cd packages/db && npx prisma studio"
  },
  "devDependencies": {
    "typescript": "^5.5.0"
  }
}
```

### 1.5 Docker Compose (Development)
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: qlens
      POSTGRES_PASSWORD: qlens_dev_password_2026
      POSTGRES_DB: qlens_ai
    ports: ['5432:5432']
    volumes: ['pgdata:/var/lib/postgresql/data']

  redis:
    image: redis:7-alpine
    ports: ['6379:6379']

volumes:
  pgdata:
```

### 1.6 .env.example
```env
# Database
DATABASE_URL=postgresql://qlens:qlens_dev_password_2026@localhost:5432/qlens_ai

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=generate_a_secure_random_string_here
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another_secure_random_string
JWT_REFRESH_EXPIRES_IN=7d

# API Gateway
INTERNAL_MODEL_URL=http://localhost:1930/v1
GATEWAY_PORT=3002

# API Server
API_PORT=3001
CORS_ORIGINS=http://localhost:3000

# Payment (Midtrans)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxx
MIDTRANS_IS_PRODUCTION=false

# Email (Resend or SMTP)
EMAIL_FROM=noreply@qlens.ai
RESEND_API_KEY=re_xxx

# Admin
ADMIN_EMAIL=admin@qlens.ai
ADMIN_PASSWORD=auto_generated_on_first_run
```

---

## PHASE 2: DATABASE SCHEMA (packages/db) — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (2.1 through 2.3) before making ANY file
- Ensure Phase 1 completed successfully: `pnpm install` passed, `docker compose up -d` is running
- BACKUP: If DB already exists, run `pg_dump qlens_ai > backup_phase2.sql` before migrate

**Full autonomous execution rules for this phase:**
- Create the complete Prisma schema in ONE write — don't create empty file then append
- Run `npx prisma migrate dev` and verify it succeeds
- If migration fails, read the error, fix the schema, retry — don't proceed until it passes
- Run `npx prisma generate` and verify Prisma client is generated
- Run seed script and verify data is inserted (check with `npx prisma studio` or SELECT queries)

**Phase 2 success criteria:**
- [ ] Prisma schema.prisma written with all 13 models and 10 enums
- [ ] `npx prisma migrate dev --name init` succeeds with zero errors
- [ ] `npx prisma generate` completes, client is usable
- [ ] Seed script runs: verify 4 plans, 6 models, 4 top-up packages, 1 admin user exist in DB
- [ ] No duplicate model names, no missing relations, all foreign keys valid
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===================== USERS =====================

model User {
  id            String     @id @default(cuid())
  email         String     @unique
  emailVerified Boolean    @default(false)
  passwordHash  String
  role          UserRole   @default(USER)
  status        UserStatus @default(ACTIVE)
  riskScore     Int        @default(0)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  profile       UserProfile?
  apiKeys       ApiKey[]
  usageLogs     UsageLog[]
  requestLogs   RequestLog[]
  payments      Payment[]
  topUpLedger   TopUpLedger[]
  auditLogs     AuditLog[]  @relation("UserAuditLogs")
  sessions      Session[]
  subscriptions Subscription[]

  @@index([email])
  @@index([status])
  @@index([riskScore])
}

model UserProfile {
  id           String   @id @default(cuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  firstName    String?
  lastName     String?
  timezone     String   @default("Asia/Jakarta")
  twoFASecret  String?
  twoFAEnabled Boolean  @default(false)

  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  refreshToken String   @unique
  expiresAt    DateTime
  ipHash       String?
  userAgent    String?
  createdAt    DateTime @default(now())

  @@index([userId])
  @@index([refreshToken])
}

// ===================== API KEYS =====================

model ApiKey {
  id           String       @id @default(cuid())
  userId       String
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  name         String       @default("Unnamed Key")
  keyPrefix    String       // e.g. "qlens-sk-live_abc1"
  keyHash      String       @unique
  environment  ApiEnv       @default(LIVE)
  status       ApiKeyStatus @default(ACTIVE)
  dailyLimit   Int?         // null = unlimited
  monthlyLimit Int?         // null = unlimited
  allowedModels String[]    // empty = all allowed for plan
  expiresAt    DateTime?
  lastUsedAt   DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  usageLogs    UsageLog[]

  @@index([userId])
  @@index([keyHash])
  @@index([status])
  @@index([keyPrefix])
}

// ===================== PLANS & BILLING =====================

model Plan {
  id            String   @id @default(cuid())
  slug          String   @unique  // free, starter, pro, max
  displayName   String
  price         Int      // IDR cents
  billingCycle  BillingCycle @default(MONTHLY)
  dailyQuota    Int      // tokens
  monthlyQuota  Int      // tokens
  rpmLimit      Int
  tpmLimit      Int
  maxActiveKeys Int      @default(1)
  allowedModels String[] // model slugs this plan can access
  priority      Int      @default(0)
  enabled       Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  subscriptions Subscription[]

  @@index([slug])
  @@index([enabled])
}

model Subscription {
  id             String    @id @default(cuid())
  userId         String
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  planId         String
  plan           Plan      @relation(fields: [planId], references: [id])
  status         SubStatus @default(ACTIVE)
  startDate      DateTime  @default(now())
  endDate        DateTime?
  dailyUsed      Int       @default(0)
  dailyResetDate DateTime?
  monthlyUsed    Int       @default(0)
  monthResetDate DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@index([userId])
  @@index([planId])
  @@unique([userId]) // one active subscription per user
}

// ===================== TOP UP =====================

model TopUpLedger {
  id           String       @id @default(cuid())
  userId       String
  user         User         @relation(fields: [userId], references: [id])
  amount       Int          // positive = added, negative = deducted
  balanceAfter Int          // running balance
  source       LedgerSource
  referenceId  String?
  description  String?
  createdAt    DateTime     @default(now())

  @@index([userId])
  @@index([source])
  @@index([createdAt])
}

model TopUpPackage {
  id        String   @id @default(cuid())
  name      String
  price     Int      // IDR cents
  tokens    Int
  enabled   Boolean  @default(true)
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  @@index([enabled])
  @@index([sortOrder])
}

// ===================== PAYMENTS =====================

model Payment {
  id             String        @id @default(cuid())
  userId         String
  user           User          @relation(fields: [userId], references: [id])
  amount         Int           // IDR cents
  status         PaymentStatus @default(PENDING)
  provider       String        @default("midtrans")
  providerTxId   String?       @unique
  invoiceUrl     String?
  packageId      String?       // top-up package
  tokenAmount    Int?          // tokens granted
  paidAt         DateTime?
  metadata       Json?
  webhookPayload Json?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([userId])
  @@index([status])
  @@index([providerTxId])
  @@index([createdAt])
}

// ===================== MODELS =====================

model Model {
  id                 String   @id @default(cuid())
  publicModelId      String   @unique  // qlens-fast, qlens-smart, etc.
  displayName        String
  description        String?
  compatibilityModes String[] // "OPENAI", "ANTHROPIC"
  internalRoute      String   // internal model service route
  contextLength      Int      @default(4096)
  maxOutputTokens    Int      @default(4096)
  category           String   @default("general")
  costPerToken       Float    @default(0)
  enabled            Boolean  @default(true)
  priority           Int      @default(0)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  health             ModelHealth?

  @@index([publicModelId])
  @@index([enabled])
  @@index([category])
}

model ModelHealth {
  id             String       @id @default(cuid())
  modelId        String       @unique
  model          Model        @relation(fields: [modelId], references: [id], onDelete: Cascade)
  status         HealthStatus @default(HEALTHY)
  latencyP50     Int          @default(0)
  latencyP95     Int          @default(0)
  errorRate      Float        @default(0)
  lastHeartbeat  DateTime?
  requestsPerMin Int          @default(0)
  tokensPerMin   Int          @default(0)
  activeStreams  Int          @default(0)
  queueDepth     Int          @default(0)
  updatedAt      DateTime     @updatedAt

  @@index([modelId])
  @@index([status])
}

// ===================== USAGE & REQUEST LOGS =====================

model UsageLog {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  apiKeyId          String
  apiKey            ApiKey   @relation(fields: [apiKeyId], references: [id])
  requestId         String   @unique
  model             String
  compatibilityMode String   // OPENAI or ANTHROPIC
  inputTokens       Int
  outputTokens      Int
  totalTokens       Int
  deductionSource   String   // plan_daily, plan_monthly, topup_balance, manual_credit, promo_credit
  cost              Float    @default(0)
  status            String   @default("SUCCESS")
  errorCode         String?
  latency           Int
  ipHash            String?
  timestamp         DateTime @default(now())

  @@index([userId])
  @@index([apiKeyId])
  @@index([model])
  @@index([timestamp])
  @@index([deductionSource])
  @@index([status])
}

model RequestLog {
  id                String   @id @default(cuid())
  requestId         String   @unique
  userId            String?
  user              User?    @relation(fields: [userId], references: [id])
  apiKeyId          String?
  model             String?
  compatibilityMode String?
  endpoint          String
  method            String
  statusCode        Int
  inputTokens       Int      @default(0)
  outputTokens      Int      @default(0)
  totalTokens       Int      @default(0)
  latency           Int
  ipHash            String?
  userAgent         String?
  errorCode         String?
  errorMessage      String?
  timestamp         DateTime @default(now())

  @@index([userId])
  @@index([apiKeyId])
  @@index([statusCode])
  @@index([timestamp])
  @@index([requestId])
}

// ===================== ADMIN & AUDIT =====================

model AuditLog {
  id         String   @id @default(cuid())
  adminId    String?
  userId     String?  // affected user
  user       User?    @relation("UserAuditLogs", fields: [userId], references: [id])
  action     String
  entityType String
  entityId   String?
  details    Json?
  ipHash     String?
  createdAt  DateTime @default(now())

  @@index([adminId])
  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model AbuseAlert {
  id         String        @id @default(cuid())
  userId     String
  alertType  String        // high_velocity, key_sharing, subnet_abuse
  severity   String        @default("MEDIUM")
  details    Json?
  resolved   Boolean       @default(false)
  resolvedBy String?
  resolvedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  @@index([userId])
  @@index([resolved])
  @@index([severity])
  @@index([createdAt])
}

// ===================== ENUMS =====================

enum UserRole { USER, ADMIN, MODERATOR }
enum UserStatus { ACTIVE, RESTRICTED, SUSPENDED, BANNED }
enum ApiEnv { LIVE, TEST }
enum ApiKeyStatus { ACTIVE, REVOKED, SUSPENDED }
enum BillingCycle { MONTHLY, YEARLY }
enum SubStatus { ACTIVE, EXPIRED, CANCELLED }
enum LedgerSource { purchase, manual_credit, promo_credit, usage_deduction, refund }
enum PaymentStatus { PENDING, PAID, EXPIRED, FAILED, REFUNDED }
enum HealthStatus { HEALTHY, DEGRADED, DOWN }
```

### 2.2 Initialize DB
```bash
cd packages/db
npx prisma init --datasource-provider postgresql
# Replace schema.prisma with the above
npx prisma migrate dev --name init
npx prisma generate
```

### 2.3 Seed Script (packages/db/prisma/seed.ts)
```typescript
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  // Plans
  await prisma.plan.createMany({
    data: [
      { slug: 'free', displayName: 'Free Trial', price: 0, dailyQuota: 50000, monthlyQuota: 500000, rpmLimit: 10, tpmLimit: 10000, maxActiveKeys: 1, allowedModels: ['qlens-lite'], priority: 0 },
      { slug: 'starter', displayName: 'Starter', price: 5000000, dailyQuota: 500000, monthlyQuota: 10000000, rpmLimit: 30, tpmLimit: 50000, maxActiveKeys: 3, allowedModels: ['qlens-lite','qlens-fast','qlens-smart'], priority: 1 },
      { slug: 'pro', displayName: 'Pro', price: 15000000, dailyQuota: 2000000, monthlyQuota: 50000000, rpmLimit: 60, tpmLimit: 100000, maxActiveKeys: 5, allowedModels: ['qlens-lite','qlens-fast','qlens-smart','qlens-reasoning'], priority: 2 },
      { slug: 'max', displayName: 'Max', price: 50000000, dailyQuota: 10000000, monthlyQuota: 200000000, rpmLimit: 120, tpmLimit: 500000, maxActiveKeys: 10, allowedModels: ['qlens-lite','qlens-fast','qlens-smart','qlens-reasoning','qlens-agent','qlens-premium'], priority: 3 },
    ],
  });

  // Models
  await prisma.model.createMany({
    data: [
      { publicModelId: 'qlens-lite', displayName: 'QLens Lite', description: 'Fast, low-cost model for quick tasks', compatibilityModes: ['OPENAI','ANTHROPIC'], internalRoute: '/models/lite', contextLength: 8192, maxOutputTokens: 4096, category: 'fast', costPerToken: 0.0001 },
      { publicModelId: 'qlens-fast', displayName: 'QLens Fast', description: 'Balanced speed and quality', compatibilityModes: ['OPENAI','ANTHROPIC'], internalRoute: '/models/fast', contextLength: 32768, maxOutputTokens: 8192, category: 'general', costPerToken: 0.0003 },
      { publicModelId: 'qlens-smart', displayName: 'QLens Smart', description: 'High-quality reasoning and analysis', compatibilityModes: ['OPENAI','ANTHROPIC'], internalRoute: '/models/smart', contextLength: 128000, maxOutputTokens: 16384, category: 'reasoning', costPerToken: 0.0008 },
      { publicModelId: 'qlens-reasoning', displayName: 'QLens Reasoning', description: 'Deep thinking for complex problems', compatibilityModes: ['OPENAI'], internalRoute: '/models/reasoning', contextLength: 128000, maxOutputTokens: 32768, category: 'reasoning', costPerToken: 0.001 },
      { publicModelId: 'qlens-agent', displayName: 'QLens Agent', description: 'Optimized for AI coding agents', compatibilityModes: ['OPENAI','ANTHROPIC'], internalRoute: '/models/agent', contextLength: 128000, maxOutputTokens: 16384, category: 'agent', costPerToken: 0.0005 },
      { publicModelId: 'qlens-premium', displayName: 'QLens Premium', description: 'Top-tier model for demanding workloads', compatibilityModes: ['OPENAI','ANTHROPIC'], internalRoute: '/models/premium', contextLength: 200000, maxOutputTokens: 65536, category: 'premium', costPerToken: 0.002 },
    ],
  });

  // Top-up packages
  await prisma.topUpPackage.createMany({
    data: [
      { name: 'Mini', price: 1000000, tokens: 1000000, sortOrder: 0 },
      { name: 'Starter', price: 2500000, tokens: 3000000, sortOrder: 1 },
      { name: 'Builder', price: 5000000, tokens: 7000000, sortOrder: 2 },
      { name: 'Power', price: 10000000, tokens: 15000000, sortOrder: 3 },
    ],
  });

  // Admin user
  const adminPassword = await bcrypt.hash('QlensAdmin2026!', 12);
  await prisma.user.create({
    data: {
      email: 'admin@qlens.ai',
      emailVerified: true,
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Model health entries
  const models = await prisma.model.findMany();
  for (const m of models) {
    await prisma.modelHealth.create({
      data: { modelId: m.id, status: 'HEALTHY' },
    });
  }

  console.log('Seed complete!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
```

Add to `packages/db/package.json`: `"prisma": { "seed": "ts-node prisma/seed.ts" }`

---

## PHASE 3: BACKEND API (apps/api) — NestJS — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (3.1 through 3.4) before making ANY file
- Ensure Phase 2 completed successfully: DB migrated, seeded, Prisma client generated
- This is the LARGEST phase — plan your file creation order carefully

**Full autonomous execution rules for this phase:**
- Create each module completely (controller + service + module + DTOs) in one pass — no empty files
- After each module, run `pnpm --filter api build` to verify it compiles
- Install ALL dependencies BEFORE writing code (see 3.2)
- Every endpoint: validate input → check auth → scope to userId → return proper status code
- API key hashing: SHA-256, raw key shown ONCE then never stored
- Quota deduction: MUST use Prisma `$transaction` — no race conditions allowed
- Rate limiting: Redis-backed, check BEFORE processing request
- Midtrans webhook: verify signature BEFORE updating payment status
- Test each endpoint group immediately after creating it (curl test, check response)
- If build fails, fix the error, retry — don't move to next module until current one compiles

**Phase 3 success criteria:**
- [ ] All 9 modules created with full implementation (no stubs, no TODOs)
- [ ] `pnpm --filter api build` succeeds with zero errors
- [ ] API server starts and responds on port 3001
- [ ] Auth flow works: register → verify → login → JWT returned
- [ ] API key create → format `qlens-sk-{env}_xxx`, hash in DB, raw key shown once
- [ ] IDOR test: User A cannot access User B's data (404/403)
- [ ] Quota check + deduction works transactionally
- [ ] Midtrans webhook verifies signature, updates payment, credits tokens
- [ ] All 40+ endpoints return correct HTTP status codes
- [ ] Rate limiting triggers at configured RPM limit (429 response)
```
apps/api/src/
├── main.ts
├── app.module.ts
├── common/
│   ├── guards/
│   │   ├── api-key.guard.ts
│   │   ├── jwt-auth.guard.ts
│   │   └── admin.guard.ts
│   ├── decorators/
│   │   └── public.decorator.ts
│   └── filters/
│       └── http-exception.filter.ts
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   └── auth.service.ts
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   └── users.service.ts
├── api-keys/
│   ├── api-keys.module.ts
│   ├── api-keys.controller.ts
│   └── api-keys.service.ts
├── billing/
│   ├── billing.module.ts
│   ├── billing.controller.ts
│   └── billing.service.ts
├── payments/
│   ├── payments.module.ts
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── webhook.controller.ts
├── usage/
│   ├── usage.module.ts
│   ├── usage.controller.ts
│   └── usage.service.ts
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   └── admin.service.ts
├── abuse/
│   ├── abuse.module.ts
│   ├── abuse.service.ts
│   └── abuse.controller.ts
└── health/
    └── health.controller.ts
```

### 3.2 Install Dependencies
```bash
cd apps/api
pnpm add @prisma/client bcrypt jsonwebtoken @nestjs/jwt @nestjs/passport passport passport-jwt class-validator class-transformer @nestjs/throttler ioredis @nestjs/config crypto
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

### 3.3 Critical Patterns

#### API Key Generation (api-keys.service.ts)
```typescript
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class ApiKeysService {
  constructor(private prisma: PrismaService) {}

  generateKey(env: 'live' | 'test'): string {
    const random = randomBytes(24).toString('hex');
    return `qlens-sk-${env}_${random}`;
  }

  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  async createKey(userId: string, name: string, env: 'live' | 'test') {
    const rawKey = this.generateKey(env);
    const keyHash = this.hashKey(rawKey);
    const keyPrefix = rawKey.slice(0, 20) + '...';

    const apiKey = await this.prisma.apiKey.create({
      data: { userId, name, keyHash, keyPrefix, environment: env },
    });

    return { key: rawKey, ...apiKey }; // raw key returned ONCE
  }

  async validate(rawKey: string) {
    const keyHash = this.hashKey(rawKey);
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash, status: 'ACTIVE' },
      include: { user: { include: { subscription: { include: { plan: true } } } } },
    });
    if (!apiKey) throw new UnauthorizedException('Invalid API key');
    if (!apiKey.user.emailVerified) throw new ForbiddenException('Verify your email');
    if (apiKey.user.status !== 'ACTIVE') throw new ForbiddenException('Account restricted');
    return apiKey;
  }
}
```

#### Quota Check & Deduction (billing.service.ts) — TRANSACTIONAL
```typescript
@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async checkAndDeduct(userId: string, estimatedTokens: number) {
    return this.prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      });

      // Check daily quota
      if (sub && sub.status === 'ACTIVE' && sub.dailyUsed < sub.plan.dailyQuota) {
        await tx.subscription.update({
          where: { userId },
          data: { dailyUsed: { increment: estimatedTokens } },
        });
        return { source: 'plan_daily', allowed: true };
      }

      // Check top-up balance
      const balance = await tx.topUpLedger.aggregate({
        where: { userId },
        _sum: { amount: true },
      });
      const available = balance._sum?.amount || 0;

      if (available >= estimatedTokens) {
        await tx.topUpLedger.create({
          data: {
            userId,
            amount: -estimatedTokens,
            balanceAfter: available - estimatedTokens,
            source: 'usage_deduction',
            description: `API usage: ${estimatedTokens} tokens`,
          },
        });
        return { source: 'topup_balance', allowed: true };
      }

      return { source: null, allowed: false };
    });
  }

  async finalizeDeduction(userId: string, actualTokens: number, estimatedTokens: number, source: string) {
    if (actualTokens === estimatedTokens) return; // no adjustment needed

    const adjustment = actualTokens - estimatedTokens;
    await this.prisma.$transaction(async (tx) => {
      if (source === 'plan_daily') {
        await tx.subscription.update({
          where: { userId },
          data: { dailyUsed: { increment: adjustment } },
        });
      } else if (source === 'topup_balance') {
        const balance = await tx.topUpLedger.aggregate({ where: { userId }, _sum: { amount: true } });
        const current = balance._sum?.amount || 0;
        await tx.topUpLedger.create({
          data: { userId, amount: -adjustment, balanceAfter: current - adjustment, source: 'usage_deduction', description: `Usage adjustment: ${adjustment > 0 ? 'additional' : 'refund'} ${Math.abs(adjustment)} tokens` },
        });
      }
    });
  }
}
```

#### Rate Limiting (Redis-backed)
```typescript
@Injectable()
export class RateLimitService {
  constructor(private redis: Redis) {}

  async checkLimit(userId: string, limit: number): Promise<boolean> {
    const key = `ratelimit:${userId}`;
    const now = Date.now();
    const windowMs = 60_000;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, 60);
    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number;
    return count <= limit;
  }
}
```

#### Midtrans Webhook (payments/webhook.controller.ts)
```typescript
@Public()
@Controller('payments')
export class WebhookController {
  @Post('webhook/midtrans')
  async handleWebhook(@Body() payload: any) {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const { order_id, status_code, gross_amount, transaction_status, signature_key, transaction_id } = payload;

    const expected = crypto.createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest('hex');

    if (signature_key !== expected) throw new BadRequestException('Invalid signature');

    const payment = await this.prisma.payment.findUnique({
      where: { providerTxId: transaction_id },
    });
    if (!payment) return { status: 'ok' };

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      await this.prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { id: payment.id },
          data: { status: 'PAID', paidAt: new Date() },
        });

        const bal = await tx.topUpLedger.aggregate({ where: { userId: payment.userId }, _sum: { amount: true } });
        const prev = bal._sum?.amount || 0;
        await tx.topUpLedger.create({
          data: {
            userId: payment.userId,
            amount: payment.tokenAmount,
            balanceAfter: prev + payment.tokenAmount,
            source: 'purchase',
            referenceId: payment.id,
            description: `Top-up: ${payment.packageId}`,
          },
        });
      });
    }

    return { status: 'ok' };
  }
}
```

#### Auth Service (auth.service.ts)
```typescript
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');

    const hash = await bcrypt.hash(password, 12);
    const user = await this.prisma.user.create({
      data: { email, passwordHash: hash },
    });

    // Create free trial subscription
    const plan = await this.prisma.plan.findUnique({ where: { slug: 'free' } });
    await this.prisma.subscription.create({
      data: { userId: user.id, planId: plan.id },
    });

    // Send verification email
    const token = this.jwt.sign({ sub: user.id, type: 'email_verify' }, { expiresIn: '24h' });
    // TODO: send email with link /api/auth/verify-email?token=...

    return { message: 'Registration successful. Check your email to verify.' };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, role: user.role };
    const accessToken = this.jwt.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwt.sign(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET });

    await this.prisma.session.create({
      data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + 7 * 86400000) },
    });

    return { accessToken, refreshToken, user: { id: user.id, email: user.email, role: user.role } };
  }

  async verifyEmail(token: string) {
    const decoded = this.jwt.verify(token) as any;
    if (decoded.type !== 'email_verify') throw new BadRequestException('Invalid token');
    await this.prisma.user.update({ where: { id: decoded.sub }, data: { emailVerified: true } });
    return { message: 'Email verified' };
  }
}
```

### 3.4 Full Endpoint List (apps/api)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | Public | Register user |
| POST | /api/auth/login | Public | Login |
| POST | /api/auth/verify-email | Public | Email verification |
| POST | /api/auth/refresh | Public | Refresh JWT |
| POST | /api/auth/logout | JWT | Logout |
| POST | /api/auth/forgot-password | Public | Request password reset |
| POST | /api/auth/reset-password | Public | Reset password |
| GET | /api/users/me | JWT | Current user |
| PATCH | /api/users/me | JWT | Update profile |
| POST | /api/users/me/change-password | JWT | Change password |
| DELETE | /api/users/me | JWT | Delete account |
| GET | /api/api-keys | JWT | List keys |
| POST | /api/api-keys | JWT | Create key |
| PATCH | /api/api-keys/:id | JWT | Update key |
| DELETE | /api/api-keys/:id | JWT | Revoke key |
| GET | /api/billing/plans | JWT | List plans |
| GET | /api/billing/subscription | JWT | Current subscription |
| POST | /api/billing/subscription | JWT | Change plan |
| GET | /api/billing/top-up-packages | JWT | Top-up packages |
| POST | /api/billing/top-up | JWT | Create payment |
| GET | /api/billing/invoices | JWT | Payment history |
| GET | /api/usage/summary | JWT | Usage summary |
| GET | /api/usage/logs | JWT | Usage logs |
| GET | /api/usage/models | JWT | Available models |
| GET | /api/admin/overview | Admin | Admin dashboard |
| GET | /api/admin/users | Admin | List users |
| GET | /api/admin/users/:id | Admin | User detail |
| PATCH | /api/admin/users/:id/plan | Admin | Change plan |
| PATCH | /api/admin/users/:id/status | Admin | Suspend/ban |
| POST | /api/admin/users/:id/credit | Admin | Add credit |
| GET | /api/admin/payments | Admin | Payment logs |
| GET | /api/admin/usage-logs | Admin | All usage logs |
| GET | /api/admin/abuse-alerts | Admin | Abuse alerts |
| GET | /api/admin/models | Admin | Model management |
| POST | /api/admin/models | Admin | Add model |
| PATCH | /api/admin/models/:id | Admin | Edit model |
| GET | /api/admin/plans | Admin | Plan management |
| POST | /api/admin/plans | Admin | Create plan |
| PATCH | /api/admin/plans/:id | Admin | Edit plan |
| GET | /api/admin/audit-logs | Admin | Audit trail |
| GET | /api/admin/model-health | Admin | Health dashboard |
| GET | /api/health | Public | Health check |
| GET | /api/public/models | Public | Public model list |
| GET | /api/public/pricing | Public | Public pricing |
| POST | /api/payments/webhook/midtrans | Public | Webhook handler |

---

## PHASE 4: API GATEWAY (apps/gateway) — NestJS — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (4.1 through 4.4) before making ANY file
- Ensure Phase 3 completed successfully: API server running, all endpoints tested
- This phase handles the CRITICAL proxy layer — any mistake here breaks all API calls

**Full autonomous execution rules for this phase:**
- Create the complete OpenAI controller with BOTH streaming AND non-streaming paths
- SSE streaming MUST work: Content-Type: text/event-stream, proper chunk format, data: [DONE] terminator
- Token counting during stream must be accurate — track output tokens chunk by chunk
- Quota precheck BEFORE forwarding, final deduction AFTER response completes
- Anthropic controller: extract x-api-key header (NOT Authorization Bearer), convert format
- Proxy service: forward to internal model service with proper headers + body normalization
- If streaming breaks, the whole gateway is broken — test SSE with curl before claiming done
- Test: `curl -N -X POST http://localhost:3002/v1/chat/completions -H "Content-Type: application/json" -H "Authorization: Bearer qlens-sk-test_xxx" -d '{"model":"qlens-lite","messages":[{"role":"user","content":"hello"}],"stream":true}'`
- Verify: response starts with `data:`, has content chunks, ends with `data: [DONE]`
- 20-step request flow must be implemented EXACTLY as specified — no shortcuts

**Phase 4 success criteria:**
- [ ] OpenAI `/v1/chat/completions` works (non-stream): returns proper response with usage
- [ ] OpenAI `/v1/chat/completions` works (stream): SSE chunks, content visible, ends with [DONE]
- [ ] Anthropic `/v1/messages` works: x-api-key auth, proper response format
- [ ] `/v1/models` returns user's allowed models (plan-filtered)
- [ ] Quota precheck blocks requests when no quota available (returns error before proxy)
- [ ] Quota final deduction runs after response (actual tokens, not estimated)
- [ ] Invalid API key → 401 before any proxy call
- [ ] Model not allowed → 403 before any proxy call
- [ ] Request log written for every request (success AND failure)
- [ ] Usage log written after successful response with correct token counts
- [ ] Gateway starts on port 3002, responds to health check
```
apps/gateway/src/
├── main.ts
├── app.module.ts
├── openai/
│   ├── openai.controller.ts
│   └── openai.service.ts
├── anthropic/
│   ├── anthropic.controller.ts
│   └── anthropic.service.ts
├── proxy/
│   ├── proxy.service.ts    — forward to internal model service
│   └── stream-handler.ts   — SSE streaming + token counting
├── quota/
│   ├── quota.service.ts
│   └── quota.guard.ts
├── api-key/
│   ├── api-key.service.ts
│   └── api-key.guard.ts
└── health/
    └── health.controller.ts
```

### 4.2 OpenAI-Compatible Controller
```typescript
@Controller('v1')
export class OpenAIController {
  constructor(
    private apiKeyService: ApiKeyService,
    private quotaService: QuotaService,
    private proxyService: ProxyService,
    private prisma: PrismaService,
  ) {}

  @Post('chat/completions')
  async chatCompletions(@Body() body: any, @Req() req: Request) {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');
    if (!apiKey) throw new UnauthorizedException('Missing API key');

    const validation = await this.apiKeyService.validate(apiKey);
    const model = await this.getModelAccess(body.model, validation.userId);
    if (!model) throw new ForbiddenException('Model not available for your plan');

    const estimated = this.estimateTokens(body);
    const quota = await this.quotaService.checkAndDeduct(validation.userId, estimated);
    if (!quota.allowed) {
      return { error: { message: 'Quota exceeded. Please top up.', type: 'quota_exceeded', code: 'quota_exceeded' } };
    }

    const response = await this.proxyService.forward(body, model.internalRoute);
    const actual = response.usage.total_tokens;
    await this.quotaService.finalize(validation.userId, actual, estimated, quota.source);

    await this.prisma.usageLog.create({
      data: {
        userId: validation.userId,
        apiKeyId: validation.apiKey.id,
        requestId: crypto.randomUUID(),
        model: body.model,
        compatibilityMode: 'OPENAI',
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens,
        totalTokens: actual,
        deductionSource: quota.source,
        latency: response.latency,
      },
    });

    return response;
  }

  @Post('chat/completions')
  async chatCompletionsStream(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    // Same validation + quota check as above
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let outputTokens = 0;
    const stream = await this.proxyService.streamForward(body, model.internalRoute);
    for await (const chunk of stream) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) outputTokens += this.countTokens(content);
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();

    // Post-stream: finalize deduction
    await this.quotaService.finalize(userId, outputTokens, estimated, quota.source);
  }

  @Get('models')
  async listModels(@Req() req: Request) {
    const apiKey = req.headers.authorization?.replace('Bearer ', '');
    const validation = await this.apiKeyService.validate(apiKey);
    const models = await this.prisma.model.findMany({
      where: { enabled: true, /* plan access filter */ },
    });
    return { data: models.map(m => ({ id: m.publicModelId, object: 'model', created: Date.now(), owned_by: 'qlens' })) };
  }
}
```

### 4.3 Anthropic-Compatible Controller
```typescript
@Controller('v1/messages')
export class AnthropicController {
  @Post()
  async messages(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const apiKey = req.headers['x-api-key'];
    // Same flow: validate → check quota → proxy → log
    // Convert Anthropic format ↔ internal format
  }
}
```

### 4.4 Gateway Request Flow (EXACT order)
```
1. Request received → generate request_id
2. Detect compatibility mode (OpenAI / Anthropic)
3. Extract API key (Authorization: Bearer OR x-api-key header)
4. Hash + lookup API key in DB
5. Validate key status (ACTIVE)
6. Load user + subscription + plan
7. Check user status (ACTIVE)
8. Check risk score
9. Check model access
10. Check rate limit (Redis)
11. Estimate token need
12. Check quota/top-up availability
13. Normalize request
14. Route to internal model service
15. Stream or return response
16. Calculate actual usage
17. Deduct quota/token ledger
18. Write usage log
19. Write request log
20. Return response
```

---

## PHASE 5: FRONTEND (apps/web) — Next.js — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (5.1 through 5.5) before making ANY file
- Ensure Phase 3 + 4 completed successfully: API + Gateway running and tested
- This is the USER-FACING layer — visual mistakes are immediately visible

**Full autonomous execution rules for this phase:**
- Landing page MUST follow EXACT 13-section order from PRD 24I — no reordering, no skipping sections
- Design tokens from 5.1 must be in globals.css — use exact colors specified
- Dashboard pages: each page must fetch REAL data from API, not hardcoded mock data
- Auth flow: register → email verify → login → redirect to dashboard (full cycle working)
- API key page: create key → show raw key ONCE in modal → copy button → never show again
- Middleware: protect /dashboard and /admin routes — unauthenticated users redirected to /login
- SSR: landing page must return full HTML on curl (not spinner/AuthLoader blocking)
- No `dangerouslySetInnerHTML` — XSS prevention
- All forms have validation + error messages
- Responsive: mobile-friendly layout
- Admin pages: only accessible by users with role=ADMIN
- Test: `curl http://localhost:3000/` → must return full landing page HTML (30KB+), not a 7KB spinner
- Test: register user in browser → verify login → see dashboard with real quota data

**Phase 5 success criteria:**
- [ ] Landing page: all 13 sections render correctly, dark theme, responsive
- [ ] Auth: register → login → dashboard redirect works end-to-end
- [ ] Dashboard: overview shows real quota, balance, usage from API
- [ ] API Keys: create → one-time display → copy → revoke all working
- [ ] Usage: charts + logs table with real data from API
- [ ] Billing: top-up packages visible, checkout creates payment
- [ ] Admin: only admin role can access, all admin pages show real data
- [ ] Middleware: unauthenticated → /login, non-admin → /dashboard
- [ ] SSR: curl / returns full HTML (not spinner page)
- [ ] No console errors in browser dev tools
- [ ] All API calls use authenticated fetch wrapper with proper error handling
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
}
```

### 5.2 Landing Page Sections (EXACT order, PRD 24I)
1. Sticky header (logo, nav, Sign In / Get API Key)
2. Hero with code preview (OpenAI/Anthropic tabs)
3. Social proof / trust strip (Cline, Roo Code, Aider, Continue logos)
4. Protocol compatibility (2 large cards)
5. Model access catalog preview
6. API console preview
7. Usage/billing/top-up transparency
8. Developer integrations
9. Security and anti-abuse
10. Pricing cards (Free, Starter, Pro, Max, Custom, Top Up)
11. Docs preview
12. FAQ
13. Footer

### 5.3 Dashboard Pages
- Overview (quota cards, quick-start snippets, usage chart, recent logs)
- API Keys (table, create modal with one-time key display)
- Usage (charts, logs table, CSV export, breakdown by model/source)
- Models (available models for user's plan)
- Billing (current plan, top-up packages, invoices, payment methods)
- Top Up Token (balance display, package selection, checkout)
- Logs (request/usage logs with filters)
- Docs (integration guides)
- Settings (profile, password, 2FA, notifications, delete account)

### 5.4 Admin Dashboard Pages
- Overview (revenue, users, requests, health, alerts)
- Users (search, detail, suspend, change plan, add credit)
- Plans (CRUD, enable/disable)
- Models (CRUD, health, priority)
- Payments (list, filter, reconcile)
- Logs (all request/usage logs)
- Abuse (alerts, resolve, ban)
- Audit (action trail)
- Model Health (per-model metrics)

### 5.5 Middleware (Next.js route protection)
```typescript
// middleware.ts
export default middleware(req) {
  const token = req.cookies.get('auth-token');
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  if (pathname.startsWith('/admin') && !isAdmin(token)) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
}
```

---

## PHASE 6: ANTI-ABUSE SYSTEM — MAKE NO MISTAKE

**⚠️ Before starting this phase:**
- Read ALL subsections (6.1 through 6.2) before making ANY changes
- Ensure Phase 3-5 completed successfully
- This phase protects revenue — mistakes here mean free abuse or false positives

**Full autonomous execution rules for this phase:**
- Risk scoring engine must run on EVERY registration — not just periodically
- Score calculation must be fast (<100ms) — no blocking N+1 queries
- Disposable email check: use a maintained blocklist, not hardcoded list
- IP velocity: track registrations per IP in last 24h using Redis or DB count
- Free trial quota activation ONLY after: email verified AND risk score < threshold
- One active API key for free tier — enforce at creation time
- Risk score actions: 0-30=allow, 31-60=allow+monitor, 61-80=restrict+CAPTCHA, 81-100=block
- AbuseAlert records created automatically when thresholds exceeded
- Admin can view and resolve abuse alerts from dashboard
- Test: register 5 accounts from same IP → risk score > 60 → account restricted
- Test: free user with 2 API keys → second creation blocked

**Phase 6 success criteria:**
- [ ] Risk score calculated on registration (0-100 range)
- [ ] Free quota NOT activated until email verified + risk score < threshold
- [ ] Disposable email detected and blocked/scored
- [ ] IP velocity tracked (registrations per IP per 24h)
- [ ] Free tier limited to 1 active API key
- [ ] AbuseAlert records created when thresholds exceeded
- [ ] Admin can view/resolve abuse alerts
- [ ] Test: same-IP bulk registration triggers restriction
```typescript
// abuse.service.ts
async calculateRiskScore(email: string, ip: string, fingerprint: string): Promise<number> {
  let score = 0;

  // Disposable email
  if (this.isDisposableDomain(email.split('@')[1])) score += 30;

  // IP velocity
  const recentFromIP = await this.prisma.user.count({
    where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
  });
  if (recentFromIP > 5) score += 20;
  if (recentFromIP > 10) score += 30;

  // Registration velocity, fingerprint duplication, etc.

  return Math.min(score, 100);
}
```

### 6.2 Free Trial Anti-Abuse
- Email verification before quota activation
- CAPTCHA on registration (Cloudflare Turnstile)
- Disposable email blocklist
- One active API key for free tier
- Low RPM/TPM limits
- Fingerprint tracking

---

## PHASE 7: SECURITY HARDENING — MAKE NO MISTAKE + FULL AUTONOMOUS

**⚠️ Before starting this phase:**
- Read ALL items in 7.1 checklist before making ANY changes
- This is the PRODUCTION GATE — no item can be skipped
- Security mistakes here are exploitable immediately on deploy

**Full autonomous execution rules for this phase:**
- Go through EVERY checklist item — implement it, then VERIFY it
- Don't just "add" security — test that it actually blocks attacks
- For each item: implement → test → verify → check the box
- IDOR test: User A tries to access User B's resources → MUST get 404 or 403, NEVER data
- API key hash test: query DB for `keyHash` — must be SHA-256 hex, NEVER raw key
- Password test: bcrypt hash must have cost factor 12+ (starts with `$2b$12$`)
- CORS test: request from unauthorized origin → MUST be blocked
- XSS test: input `<script>alert(1)</script>` → must be sanitized/escaped
- Rate limit test: spam auth endpoint → must get 429 after N requests
- Webhook test: send forged Midtrans payload → must be rejected (signature mismatch)
- Frontend bundle test: search build output for "password", "secret", "key" → must find ZERO secrets
- All admin actions must be logged to AuditLog with adminId, action, entityType, entityId

**Phase 7 success criteria:**
- [x] Raw API keys hashed (SHA-256), never stored raw — VERIFY: DB has hex hashes only
- [x] Raw API keys never logged — VERIFY: grep logs for "qlens-sk" → zero matches
- [x] Password hashing (bcrypt, cost 12) — VERIFY: hash starts with `$2b$12$`
- [x] JWT with refresh token rotation — VERIFY: old refresh token rejected after use
- [x] CORS strictly configured — VERIFY: unauthorized origin blocked
- [x] Request size limits (1MB max) — VERIFY: >1MB request rejected with 413
- [x] Rate limiting on auth endpoints — VERIFY: spam → 429
- [x] Midtrans webhook signature verified — VERIFY: forged signature → 400
- [x] Admin actions audit-logged — VERIFY: admin action appears in AuditLog
- [x] No secrets in frontend bundle — VERIFY: grep build output → zero secrets
- [x] IDOR: every user query scoped to userId — VERIFY: cross-user access → 404/403
- [x] XSS prevention — VERIFY: `<script>` input escaped
- [x] SQLi prevention — VERIFY: Prisma parameterized (automatic with Prisma)
- [x] Input validation on all DTOs — VERIFY: invalid input → 400 with error details
- [x] Error messages don't leak internals — VERIFY: error responses show generic messages only

---

## PHASE 8: TESTING & VERIFICATION — MAKE NO MISTAKE + FULL AUTONOMOUS

**⚠️ This is the FINAL GATE — nothing ships until ALL tests pass**

**Full autonomous execution rules for this phase:**
- Run EVERY test in the table below — don't skip any
- For each test: run it, capture the output, compare against expected result
- If a test fails, FIX the root cause, then re-run that test
- Document all test results with actual curl output, HTTP status codes, and response bodies
- IDOR cross-tenant test is MANDATORY: register User A, register User B, use B's token to access A's data
- SSR test: curl the landing page — must get full HTML, not a spinner or 404
- Streaming test: curl with stream:true — must see SSE chunks with content
- Quota test: exhaust daily quota → use top-up → verify deduction_source = "topup_balance"

**Phase 8 success criteria — ALL must pass:**
- [ ] ALL 15 tests in table 8.1 pass with correct expected results
- [ ] IDOR cross-tenant test: User B cannot access User A's data
- [ ] Streaming returns real content (not empty responses)
- [ ] Quota deduction uses correct source (plan_daily vs topup_balance)
- [ ] Landing page SSR returns 30KB+ HTML on curl
- [ ] Zero console errors in browser dev tools
- [ ] No raw API keys in database or logs
- [ ] All admin pages blocked for non-admin users
- [ ] Payment webhook processes correctly and credits tokens
- [ ] Final deliverable: fully working, tested, deployable QLens AI SaaS

### 8.1 Run ALL tests before declaring "done"

| Test | Method | Expected |
|------|--------|----------|
| Register flow | POST /api/auth/register → verify email → login | 200, JWT returned |
| API key create | POST /api/api-keys → check format `qlens-sk-{env}_xxx` | Raw key once, hash in DB |
| OpenAI endpoint | POST /v1/chat/completions with qlens key | 200, content, tokens deducted |
| Anthropic endpoint | POST /v1/messages with x-api-key | 200, correct format |
| Quota deduction | Use API → check subscription.dailyUsed | Incremented correctly |
| Top-up overflow | Exhaust daily → use top-up | deduction_source = topup_balance |
| Rate limit | Spam > RPM limit | 429 Too Many Requests |
| Invalid key | Request with fake key | 401 Unauthorized |
| Revoked key | Revoke → try request | 401 |
| Model access | Free user → premium model | 403 Forbidden |
| Payment webhook | Simulate Midtrans settlement | Payment PAID, tokens credited |
| Admin dashboard | Login admin → view | Revenue, users, health visible |
| Abuse detection | Register 5+ accounts same IP | Risk score > 60 |
| IDOR protection | User A → access User B's data | 404/403 |
| SSR landing | curl / | Full HTML, not spinner |

### 8.2 IDOR Cross-Tenant Test Pattern
```bash
# Register user A → get token A → get user A's ID
# Register user B → get token B
# Use token B to access user A's resources → MUST return 404 or 403
```

---

## 🔴 EXECUTION ORDER — MAKE NO MISTAKE

1. **Phase 1**: Scaffold monorepo, docker-compose, .env → `pnpm install` → verify structure
2. **Phase 2**: Prisma schema, migrate, seed → verify all data in DB
3. **Phase 3**: API server (auth, users, api-keys, billing, payments, usage, admin, abuse) → build → test endpoints
4. **Phase 4**: Gateway (OpenAI/Anthropic proxy, streaming, quota) → test streaming + non-stream
5. **Phase 5**: Frontend (landing, dashboard, admin, auth pages, docs) → SSR test + browser test
6. **Phase 6**: Anti-abuse system → test bulk registration triggers
7. **Phase 7**: Security hardening → test EVERY checklist item with real attacks
8. **Phase 8**: Run full test suite → ALL 15 tests must pass

**🔴 ABSOLUTE RULES:**
- **Do NOT skip phases.** Each phase depends on the previous one being complete and verified.
- **Do NOT build everything then test.** Test after each phase — fix failures immediately.
- **Do NOT claim "done" without real test output.** Show curl results, HTTP status, response bodies.
- **Do NOT use stubs or placeholders.** Every endpoint must be fully functional.
- **Do NOT proceed to next phase if current phase has failures.** Fix first, then move on.
- **Make no mistake.** Read before writing. Verify after writing. Test before claiming done.
- **Full autonomous.** Execute without asking permission. Handle errors yourself. Deliver working system.

**When user says "udah?" → provide:**
1. Current phase status (complete/in-progress)
2. Concrete test output (curl results, HTTP status, response body)
3. What was verified and what's still pending
4. Next step — NOT "should I continue?" but "proceeding to Phase X"
