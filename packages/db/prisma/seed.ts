import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QLens AI database seed...');

  // ─── Plans ──────────────────────────────────────────────────────────────────
  console.log('📦 Creating plans...');

  const freePlan = await prisma.plan.upsert({
    where: { slug: 'free' },
    update: {},
    create: {
      slug: 'free',
      displayName: 'Free',
      price: 0,
      billingCycle: 'MONTHLY',
      dailyQuota: 50000,
      monthlyQuota: 500000,
      rpmLimit: 10,
      tpmLimit: 10000,
      maxActiveKeys: 1,
      allowedModels: 'qlens-lite',
      priority: 0,
      enabled: true,
    },
  });

  const starterPlan = await prisma.plan.upsert({
    where: { slug: 'starter' },
    update: {},
    create: {
      slug: 'starter',
      displayName: 'Starter',
      price: 5000000, // 5M IDR in cents
      billingCycle: 'MONTHLY',
      dailyQuota: 500000,
      monthlyQuota: 10000000,
      rpmLimit: 30,
      tpmLimit: 50000,
      maxActiveKeys: 3,
      allowedModels: 'qlens-lite,qlens-fast,qlens-smart',
      priority: 1,
      enabled: true,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { slug: 'pro' },
    update: {},
    create: {
      slug: 'pro',
      displayName: 'Pro',
      price: 15000000, // 15M IDR in cents
      billingCycle: 'MONTHLY',
      dailyQuota: 2000000,
      monthlyQuota: 50000000,
      rpmLimit: 60,
      tpmLimit: 100000,
      maxActiveKeys: 5,
      allowedModels: 'qlens-lite,qlens-fast,qlens-smart,qlens-reasoning',
      priority: 2,
      enabled: true,
    },
  });

  const maxPlan = await prisma.plan.upsert({
    where: { slug: 'max' },
    update: {},
    create: {
      slug: 'max',
      displayName: 'Max',
      price: 50000000, // 50M IDR in cents
      billingCycle: 'MONTHLY',
      dailyQuota: 10000000,
      monthlyQuota: 200000000,
      rpmLimit: 120,
      tpmLimit: 500000,
      maxActiveKeys: 10,
      allowedModels: 'qlens-lite,qlens-fast,qlens-smart,qlens-reasoning,qlens-agent,qlens-premium',
      priority: 3,
      enabled: true,
    },
  });

  console.log(`   ✅ Created plans: ${freePlan.displayName}, ${starterPlan.displayName}, ${proPlan.displayName}, ${maxPlan.displayName}`);

  // ─── Models ─────────────────────────────────────────────────────────────────
  console.log('🤖 Creating models...');

  const modelsData = [
    {
      publicModelId: 'qlens-lite',
      displayName: 'QLens Lite',
      description: 'Fast and efficient model for simple queries and basic tasks',
      compatibilityModes: 'chat,completion',
      internalRoute: '/api/models/qlens-lite',
      contextLength: 8192,
      maxOutputTokens: 4096,
      category: 'general',
      costPerToken: 0,
      priority: 0,
    },
    {
      publicModelId: 'qlens-fast',
      displayName: 'QLens Fast',
      description: 'Optimized model for high-throughput production workloads',
      compatibilityModes: 'chat,completion,streaming',
      internalRoute: '/api/models/qlens-fast',
      contextLength: 16384,
      maxOutputTokens: 8192,
      category: 'general',
      costPerToken: 1,
      priority: 1,
    },
    {
      publicModelId: 'qlens-smart',
      displayName: 'QLens Smart',
      description: 'Balanced model for complex reasoning and analysis tasks',
      compatibilityModes: 'chat,completion,streaming,function-calling',
      internalRoute: '/api/models/qlens-smart',
      contextLength: 32768,
      maxOutputTokens: 8192,
      category: 'reasoning',
      costPerToken: 2,
      priority: 2,
    },
    {
      publicModelId: 'qlens-reasoning',
      displayName: 'QLens Reasoning',
      description: 'Advanced model with deep reasoning and multi-step thinking capabilities',
      compatibilityModes: 'chat,completion,streaming,function-calling',
      internalRoute: '/api/models/qlens-reasoning',
      contextLength: 65536,
      maxOutputTokens: 16384,
      category: 'reasoning',
      costPerToken: 5,
      priority: 3,
    },
    {
      publicModelId: 'qlens-agent',
      displayName: 'QLens Agent',
      description: 'Autonomous agent model capable of tool use and multi-step execution',
      compatibilityModes: 'chat,streaming,function-calling,agent',
      internalRoute: '/api/models/qlens-agent',
      contextLength: 131072,
      maxOutputTokens: 16384,
      category: 'agent',
      costPerToken: 10,
      priority: 4,
    },
    {
      publicModelId: 'qlens-premium',
      displayName: 'QLens Premium',
      description: 'Most capable model with maximum performance and broadest capabilities',
      compatibilityModes: 'chat,completion,streaming,function-calling,agent,vision',
      internalRoute: '/api/models/qlens-premium',
      contextLength: 131072,
      maxOutputTokens: 32768,
      category: 'premium',
      costPerToken: 15,
      priority: 5,
    },
  ];

  const createdModels = [];
  for (const modelData of modelsData) {
    const model = await prisma.model.upsert({
      where: { publicModelId: modelData.publicModelId },
      update: {},
      create: modelData,
    });
    createdModels.push(model);
  }
  console.log(`   ✅ Created ${createdModels.length} models`);

  // ─── Model Health ───────────────────────────────────────────────────────────
  console.log('💓 Creating model health entries...');

  for (const model of createdModels) {
    await prisma.modelHealth.upsert({
      where: { modelId: model.id },
      update: {},
      create: {
        modelId: model.id,
        status: 'HEALTHY',
        latencyP50: 50 + Math.floor(Math.random() * 100),
        latencyP95: 200 + Math.floor(Math.random() * 300),
        errorRate: 0.001,
        lastHeartbeat: new Date(),
        requestsPerMin: 0,
        tokensPerMin: 0,
        activeStreams: 0,
        queueDepth: 0,
      },
    });
  }
  console.log(`   ✅ Created health entries for ${createdModels.length} models`);

  // ─── Top-Up Packages ────────────────────────────────────────────────────────
  console.log('💰 Creating top-up packages...');

  const topUpPackages = [
    { name: 'Mini', price: 10000, tokens: 1000000, sortOrder: 0 },
    { name: 'Starter', price: 25000, tokens: 3000000, sortOrder: 1 },
    { name: 'Builder', price: 50000, tokens: 7000000, sortOrder: 2 },
    { name: 'Power', price: 100000, tokens: 15000000, sortOrder: 3 },
  ];

  for (const pkg of topUpPackages) {
    await prisma.topUpPackage.create({
      data: pkg,
    });
  }
  console.log(`   ✅ Created ${topUpPackages.length} top-up packages`);

  // ─── Admin User ─────────────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');

  const adminPasswordHash = await bcrypt.hash('QlensAdmin2026!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qlens.ai' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
    create: {
      email: 'admin@qlens.ai',
      emailVerified: true,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Admin',
          lastName: 'QLens',
          timezone: 'Asia/Jakarta',
          twoFAEnabled: false,
        },
      },
    },
  });
  console.log(`   ✅ Created admin user: ${adminUser.email}`);

  // ─── Summary ────────────────────────────────────────────────────────────────
  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Summary:');
  console.log('  Plans:           4 (free, starter, pro, max)');
  console.log('  Models:          6 (qlens-lite → qlens-premium)');
  console.log('  Model Health:    6 entries');
  console.log('  Top-Up Packages: 4 (Mini, Starter, Builder, Power)');
  console.log('  Admin User:      admin@qlens.ai');
  console.log('');
}

main()
  .catch((e: unknown) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
