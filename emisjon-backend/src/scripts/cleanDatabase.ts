import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log('🧹 Starting database cleanup...');

    // 1. Delete all emissions and related data
    console.log('Deleting all emissions and related data...');
    await prisma.emissionAuditLog.deleteMany({});
    await prisma.shareholderSnapshot.deleteMany({});
    await prisma.emissionSubscription.deleteMany({});
    await prisma.emission.deleteMany({});
    console.log('✅ All emissions deleted');

    // 2. Delete all audit logs
    console.log('Deleting all audit logs...');
    await prisma.auditLog.deleteMany({});
    console.log('✅ All audit logs deleted');

    // 3. Delete all users except the two specified
    console.log('Deleting users (keeping only kgl@oblinor.no and hewamohammed522@gmail.com)...');
    const usersToKeep = ['kgl@oblinor.no', 'hewamohammed522@gmail.com'];
    
    await prisma.user.deleteMany({
      where: {
        email: {
          notIn: usersToKeep
        }
      }
    });
    console.log('✅ Users cleaned up');

    // 4. Delete all shareholders except the one linked to hewamohammed522@gmail.com
    console.log('Deleting shareholders (keeping only hewamohammed522@gmail.com)...');
    await prisma.shareholder.deleteMany({
      where: {
        email: {
          not: 'hewamohammed522@gmail.com'
        }
      }
    });

    // 5. Reset Hewa's shares to initial 10,000
    console.log('Resetting Hewa\'s shares to 10,000...');
    await prisma.shareholder.updateMany({
      where: {
        email: 'hewamohammed522@gmail.com'
      },
      data: {
        sharesOwned: 10000,
        ownershipPercentage: 100.00 // Since it's the only shareholder now
      }
    });
    console.log('✅ Shareholder data reset');

    // 6. Verify the final state
    const remainingUsers = await prisma.user.count();
    const remainingShareholders = await prisma.shareholder.count();
    const remainingEmissions = await prisma.emission.count();
    const remainingSubscriptions = await prisma.emissionSubscription.count();
    
    console.log('\n📊 Final database state:');
    console.log(`  Users: ${remainingUsers} (should be 2)`);
    console.log(`  Shareholders: ${remainingShareholders} (should be 1)`);
    console.log(`  Emissions: ${remainingEmissions} (should be 0)`);
    console.log(`  Subscriptions: ${remainingSubscriptions} (should be 0)`);

    // Show the remaining users
    const users = await prisma.user.findMany({
      select: {
        email: true,
        name: true,
        role: true,
        level: true
      }
    });
    
    console.log('\n👥 Remaining users:');
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.role} Level ${user.level})`);
    });

    // Show the shareholder
    const shareholder = await prisma.shareholder.findFirst({
      where: {
        email: 'hewamohammed522@gmail.com'
      }
    });
    
    if (shareholder) {
      console.log('\n💼 Shareholder status:');
      console.log(`  - ${shareholder.name}: ${shareholder.sharesOwned} shares (${shareholder.ownershipPercentage}%)`);
    }

    console.log('\n✅ Database cleanup complete!');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanDatabase();