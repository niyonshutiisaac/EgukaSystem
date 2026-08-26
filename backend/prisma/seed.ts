import { PrismaClient, PlanId } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const PLANS = [
  {
    id: PlanId.starter,
    name: 'Starter',
    priceMonthly: 15000,
    seats: 2,
    aiCredits: 100,
    sortOrder: 1,
    features: {
      multiBranch: false,
      production: false,
      forecasting: false,
      aiAssistant: true,
      advancedReports: false,
      expenses: true,
      procurement: false,
      auditLogs: false,
      apiAccess: false,
      bulkImport: false,
    },
  },
  {
    id: PlanId.growth,
    name: 'Growth',
    priceMonthly: 35000,
    seats: 5,
    aiCredits: 300,
    sortOrder: 2,
    features: {
      multiBranch: true,
      production: true,
      forecasting: false,
      aiAssistant: true,
      advancedReports: true,
      expenses: true,
      procurement: true,
      auditLogs: true,
      apiAccess: false,
      bulkImport: true,
    },
  },
  {
    id: PlanId.professional,
    name: 'Professional',
    priceMonthly: 75000,
    seats: 15,
    aiCredits: 1000,
    sortOrder: 3,
    features: {
      multiBranch: true,
      production: true,
      forecasting: true,
      aiAssistant: true,
      advancedReports: true,
      expenses: true,
      procurement: true,
      auditLogs: true,
      apiAccess: true,
      bulkImport: true,
    },
  },
  {
    id: PlanId.enterprise,
    name: 'Enterprise',
    priceMonthly: 0,
    seats: 9999,
    aiCredits: 100000,
    sortOrder: 4,
    features: {
      multiBranch: true,
      production: true,
      forecasting: true,
      aiAssistant: true,
      advancedReports: true,
      expenses: true,
      procurement: true,
      auditLogs: true,
      apiAccess: true,
      bulkImport: true,
    },
  },
];

async function main(): Promise<void> {
  for (const plan of PLANS) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: { ...plan },
      create: { ...plan },
    });
    console.log(`Plan ${plan.id} ready`);
  }

  const email = process.env.SUPERADMIN_EMAIL;
  const password = process.env.SUPERADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.upsert({
      where: { email },
      update: { role: 'superadmin' },
      create: { email, name: 'Super Admin', passwordHash, role: 'superadmin' },
    });
    console.log(`Superadmin ready: ${email}`);
  } else {
    console.log('SUPERADMIN_EMAIL/SUPERADMIN_PASSWORD not set — superadmin skipped');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());