import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a super admin user (example)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@shipit.dev' },
    update: {},
    create: {
      email: 'admin@shipit.dev',
      passwordHash: '$argon2id$v=19$m=65536,t=3,p=4$placeholder', // Replace with real hash in development
      firstName: 'Super',
      lastName: 'Admin',
      emailVerified: true,
      isSuperAdmin: true,
      language: 'en',
    },
  });

  console.log('✅ Super admin created:', superAdmin.email);

  // Create a test organization
  const testOrg = await prisma.organization.upsert({
    where: { slug: 'test-organization' },
    update: {},
    create: {
      name: 'Test Organization',
      slug: 'test-organization',
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
    },
  });

  console.log('✅ Test organization created:', testOrg.name);

  // Add super admin to test organization
  await prisma.organizationMember.upsert({
    where: {
      userId_organizationId: {
        userId: superAdmin.id,
        organizationId: testOrg.id,
      },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      organizationId: testOrg.id,
      role: 'admin',
    },
  });

  console.log('✅ Super admin added to test organization');

  console.log('🎉 Database seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
