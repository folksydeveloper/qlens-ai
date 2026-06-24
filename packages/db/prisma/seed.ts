import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting QLens AI v1.4 database seed...');

  // ─── Plans ──────────────────────────────────────────────────────────────────
  console.log('📦 Creating plans...');

  const plans = [
    {
      slug: 'free',
      displayName: 'Free Trial',
      price: 0,
      billingCycle: 'MONTHLY',
      dailyQuota: 50000,
      monthlyQuota: 500000,
      rpmLimit: 10,
      tpmLimit: 10000,
      maxActiveKeys: 1,
      allowedModels: JSON.stringify(['qlens-lite']),
      priority: 0,
      enabled: true,
    },
    {
      slug: 'starter',
      displayName: 'Starter',
      price: 5000000,
      billingCycle: 'MONTHLY',
      dailyQuota: 500000,
      monthlyQuota: 10000000,
      rpmLimit: 30,
      tpmLimit: 50000,
      maxActiveKeys: 3,
      allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart']),
      priority: 1,
      enabled: true,
    },
    {
      slug: 'pro',
      displayName: 'Pro',
      price: 15000000,
      billingCycle: 'MONTHLY',
      dailyQuota: 2000000,
      monthlyQuota: 50000000,
      rpmLimit: 60,
      tpmLimit: 100000,
      maxActiveKeys: 5,
      allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart', 'qlens-reasoning']),
      priority: 2,
      enabled: true,
    },
    {
      slug: 'max',
      displayName: 'Max',
      price: 50000000,
      billingCycle: 'MONTHLY',
      dailyQuota: 10000000,
      monthlyQuota: 200000000,
      rpmLimit: 120,
      tpmLimit: 500000,
      maxActiveKeys: 10,
      allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart', 'qlens-reasoning', 'qlens-agent', 'qlens-premium']),
      priority: 3,
      enabled: true,
    },
  ];

  for (const p of plans) {
    await prisma.plan.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    });
  }
  console.log('   ✅ Created 4 plans');

  // ─── Models ─────────────────────────────────────────────────────────────────
  console.log('🤖 Creating models...');

  const models = [
    {
      publicModelId: 'qlens-lite',
      displayName: 'QLens Lite',
      description: 'Fast and efficient for simple tasks',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 8192,
      maxOutputTokens: 4096,
      category: 'fast',
      costPerToken: 0.000001,
      enabled: true,
      priority: 0,
    },
    {
      publicModelId: 'qlens-fast',
      displayName: 'QLens Fast',
      description: 'High-throughput optimized model',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 16384,
      maxOutputTokens: 8192,
      category: 'general',
      costPerToken: 0.000002,
      enabled: true,
      priority: 1,
    },
    {
      publicModelId: 'qlens-smart',
      displayName: 'QLens Smart',
      description: 'Balanced model for complex tasks',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 32768,
      maxOutputTokens: 8192,
      category: 'general',
      costPerToken: 0.000005,
      enabled: true,
      priority: 2,
    },
    {
      publicModelId: 'qlens-reasoning',
      displayName: 'QLens Reasoning',
      description: 'Deep reasoning and analysis',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 65536,
      maxOutputTokens: 16384,
      category: 'reasoning',
      costPerToken: 0.00001,
      enabled: true,
      priority: 3,
    },
    {
      publicModelId: 'qlens-agent',
      displayName: 'QLens Agent',
      description: 'Optimized for coding agents',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 131072,
      maxOutputTokens: 32768,
      category: 'general',
      costPerToken: 0.00002,
      enabled: true,
      priority: 4,
    },
    {
      publicModelId: 'qlens-premium',
      displayName: 'QLens Premium',
      description: 'Highest quality model',
      compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']),
      internalRoute: 'http://localhost:1930/v1/chat/completions',
      contextLength: 262144,
      maxOutputTokens: 65536,
      category: 'reasoning',
      costPerToken: 0.00005,
      enabled: true,
      priority: 5,
    },
  ];

  for (const m of models) {
    const created = await prisma.model.upsert({
      where: { publicModelId: m.publicModelId },
      update: {},
      create: m,
    });
    // Create health entry
    await prisma.modelHealth.upsert({
      where: { modelId: created.id },
      update: {},
      create: {
        modelId: created.id,
        status: 'HEALTHY',
        lastHeartbeat: new Date(),
      },
    });
  }
  console.log('   ✅ Created 6 models + health entries');

  // ─── Top Up Packages ────────────────────────────────────────────────────────
  console.log('💰 Creating top-up packages...');

  const packages = [
    { name: 'Mini', price: 5000000, tokens: 1000000, sortOrder: 1 },
    { name: 'Starter', price: 10000000, tokens: 2500000, sortOrder: 2 },
    { name: 'Builder', price: 25000000, tokens: 7500000, sortOrder: 3 },
    { name: 'Power', price: 50000000, tokens: 20000000, sortOrder: 4 },
  ];

  for (const p of packages) {
    await prisma.topUpPackage.create({ data: p });
  }
  console.log('   ✅ Created 4 top-up packages');

  // ─── Admin User ─────────────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');

  const adminPasswordHash = await bcrypt.hash('QlensAdmin2026!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@qlens.ai' },
    update: {},
    create: {
      email: 'admin@qlens.ai',
      emailVerified: true,
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      riskScore: 0,
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
  console.log('   ✅ Created admin user: admin@qlens.ai / QlensAdmin2026!');

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
