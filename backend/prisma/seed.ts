import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed script for Bankr database
 * Creates test users with EMPTY accounts for development
 */
async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create test users with empty accounts
  const freeUser = await prisma.user.upsert({
    where: { email: 'free@bankr.local' },
    update: {},
    create: {
      email: 'free@bankr.local',
      passwordHash: hashedPassword,
      firstName: 'Free',
      lastName: 'User',
      role: 'FREE',
      emailVerified: true,
    },
  });

  const premiumUser = await prisma.user.upsert({
    where: { email: 'premium@bankr.local' },
    update: {},
    create: {
      email: 'premium@bankr.local',
      passwordHash: hashedPassword,
      firstName: 'Premium',
      lastName: 'User',
      role: 'PREMIUM',
      emailVerified: true,
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bankr.local' },
    update: {},
    create: {
      email: 'admin@bankr.local',
      passwordHash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  console.log('✅ Created test users with empty accounts:', {
    free: freeUser.email,
    premium: premiumUser.email,
    admin: adminUser.email,
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('💡 All accounts start fresh - add your own data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
