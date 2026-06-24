import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting QLens AI database seed...');

  const plans = [
    { slug: 'free', displayName: 'Free Trial', price: 0, billingCycle: 'MONTHLY', dailyQuota: 50000, monthlyQuota: 500000, rpmLimit: 10, tpmLimit: 10000, maxActiveKeys: 1, allowedModels: JSON.stringify(['qlens-lite']), priority: 0, enabled: true },
    { slug: 'starter', displayName: 'Starter', price: 5000000, billingCycle: 'MONTHLY', dailyQuota: 500000, monthlyQuota: 10000000, rpmLimit: 30, tpmLimit: 50000, maxActiveKeys: 3, allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart']), priority: 1, enabled: true },
    { slug: 'pro', displayName: 'Pro', price: 15000000, billingCycle: 'MONTHLY', dailyQuota: 2000000, monthlyQuota: 50000000, rpmLimit: 60, tpmLimit: 100000, maxActiveKeys: 5, allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart', 'qlens-reasoning']), priority: 2, enabled: true },
    { slug: 'max', displayName: 'Max', price: 50000000, billingCycle: 'MONTHLY', dailyQuota: 10000000, monthlyQuota: 200000000, rpmLimit: 120, tpmLimit: 500000, maxActiveKeys: 10, allowedModels: JSON.stringify(['qlens-lite', 'qlens-fast', 'qlens-smart', 'qlens-reasoning', 'qlens-agent', 'qlens-premium']), priority: 3, enabled: true },
  ];

  for (const plan of plans) await prisma.plan.upsert({ where: { slug: plan.slug }, update: plan, create: plan });

  const models = [
    { publicModelId: 'qlens-lite', displayName: 'QLens Lite', description: 'Fast and efficient for simple tasks', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 8192, maxOutputTokens: 4096, category: 'fast', costPerToken: 0.000001, enabled: true, priority: 0 },
    { publicModelId: 'qlens-fast', displayName: 'QLens Fast', description: 'High-throughput optimized model', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 16384, maxOutputTokens: 8192, category: 'general', costPerToken: 0.000002, enabled: true, priority: 1 },
    { publicModelId: 'qlens-smart', displayName: 'QLens Smart', description: 'Balanced model for complex tasks', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 32768, maxOutputTokens: 8192, category: 'general', costPerToken: 0.000005, enabled: true, priority: 2 },
    { publicModelId: 'qlens-reasoning', displayName: 'QLens Reasoning', description: 'Deep reasoning and analysis', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 65536, maxOutputTokens: 16384, category: 'reasoning', costPerToken: 0.00001, enabled: true, priority: 3 },
    { publicModelId: 'qlens-agent', displayName: 'QLens Agent', description: 'Optimized for coding agents', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 131072, maxOutputTokens: 32768, category: 'general', costPerToken: 0.00002, enabled: true, priority: 4 },
    { publicModelId: 'qlens-premium', displayName: 'QLens Premium', description: 'Highest quality model', compatibilityModes: JSON.stringify(['OPENAI', 'ANTHROPIC']), internalRoute: 'http://localhost:1930/v1/chat/completions', contextLength: 262144, maxOutputTokens: 65536, category: 'reasoning', costPerToken: 0.00005, enabled: true, priority: 5 },
  ];

  for (const data of models) {
    const model = await prisma.model.upsert({ where: { publicModelId: data.publicModelId }, update: data, create: data });
    await prisma.modelHealth.upsert({ where: { modelId: model.id }, update: { status: 'HEALTHY', lastHeartbeat: new Date() }, create: { modelId: model.id, status: 'HEALTHY', lastHeartbeat: new Date() } });
  }

  const packages = [
    { name: 'Mini', price: 5000000, tokens: 1000000, sortOrder: 1 },
    { name: 'Starter', price: 10000000, tokens: 2500000, sortOrder: 2 },
    { name: 'Builder', price: 25000000, tokens: 7500000, sortOrder: 3 },
    { name: 'Power', price: 50000000, tokens: 20000000, sortOrder: 4 },
  ];

  for (const data of packages) {
    const existing = await prisma.topUpPackage.findFirst({ where: { name: data.name } });
    if (existing) await prisma.topUpPackage.update({ where: { id: existing.id }, data });
    else await prisma.topUpPackage.create({ data });
  }

  console.log('Seed completed. Admin user creation is intentionally excluded from seed.');
}

main()
  .catch((e: unknown) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
