import { PrismaClient, GrantStatus, RequestStatus } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * E2E Test Database Seed
 *
 * This script creates a consistent test dataset for Playwright E2E tests.
 * It creates:
 * - Test users (admin and regular)
 * - Systems with tiers and instances
 * - System owners
 * - Sample access grants
 * - Sample access requests
 */

// Test User IDs (fixed for consistent test references)
export const TEST_USERS = {
  admin: {
    id: 'test-user-admin',
    name: 'Test Admin',
    email: 'admin@test.corolla.com',
  },
  regular: {
    id: 'test-user-regular',
    name: 'Test User',
    email: 'user@test.corolla.com',
  },
  manager: {
    id: 'test-user-manager',
    name: 'Test Manager',
    email: 'manager@test.corolla.com',
  },
  newHire: {
    id: 'test-user-newhire',
    name: 'New Hire User',
    email: 'newhire@test.corolla.com',
  },
};

// Test System IDs
export const TEST_SYSTEMS = {
  magento: {
    id: 'test-system-magento',
    name: 'Magento',
    description: 'E-commerce platform for online stores',
  },
  salesforce: {
    id: 'test-system-salesforce',
    name: 'Salesforce',
    description: 'Customer relationship management platform',
  },
  sap: {
    id: 'test-system-sap',
    name: 'SAP',
    description: 'Enterprise resource planning system',
  },
};

// Test Tier IDs
export const TEST_TIERS = {
  magentoAdmin: {
    id: 'test-tier-magento-admin',
    name: 'Admin',
    systemId: TEST_SYSTEMS.magento.id,
  },
  magentoEditor: {
    id: 'test-tier-magento-editor',
    name: 'Editor',
    systemId: TEST_SYSTEMS.magento.id,
  },
  magentoViewer: {
    id: 'test-tier-magento-viewer',
    name: 'Viewer',
    systemId: TEST_SYSTEMS.magento.id,
  },
  salesforceAdmin: {
    id: 'test-tier-sf-admin',
    name: 'Admin',
    systemId: TEST_SYSTEMS.salesforce.id,
  },
  salesforceUser: {
    id: 'test-tier-sf-user',
    name: 'User',
    systemId: TEST_SYSTEMS.salesforce.id,
  },
  sapAdmin: {
    id: 'test-tier-sap-admin',
    name: 'Admin',
    systemId: TEST_SYSTEMS.sap.id,
  },
  sapViewer: {
    id: 'test-tier-sap-viewer',
    name: 'Viewer',
    systemId: TEST_SYSTEMS.sap.id,
  },
};

// Test Instance IDs
export const TEST_INSTANCES = {
  magentoWellness: {
    id: 'test-instance-magento-wellness',
    name: 'Wellness',
    systemId: TEST_SYSTEMS.magento.id,
  },
  magentoCookies: {
    id: 'test-instance-magento-cookies',
    name: 'Cape Cookies',
    systemId: TEST_SYSTEMS.magento.id,
  },
  salesforceProd: {
    id: 'test-instance-sf-prod',
    name: 'Production',
    systemId: TEST_SYSTEMS.salesforce.id,
  },
  salesforceStaging: {
    id: 'test-instance-sf-staging',
    name: 'Staging',
    systemId: TEST_SYSTEMS.salesforce.id,
  },
};

// Test Access Grant IDs (for remove flow testing)
export const TEST_GRANTS = {
  activeGrant1: {
    id: 'test-grant-active-1',
    userId: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.magento.id,
    instanceId: TEST_INSTANCES.magentoWellness.id,
    tierId: TEST_TIERS.magentoEditor.id,
    status: 'active' as GrantStatus,
  },
  activeGrant2: {
    id: 'test-grant-active-2',
    userId: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.salesforce.id,
    instanceId: null,
    tierId: TEST_TIERS.salesforceUser.id,
    status: 'active' as GrantStatus,
  },
  removedGrant: {
    id: 'test-grant-removed',
    userId: TEST_USERS.manager.id,
    systemId: TEST_SYSTEMS.sap.id,
    instanceId: null,
    tierId: TEST_TIERS.sapViewer.id,
    status: 'removed' as GrantStatus,
  },
};

// Test Access Request IDs
export const TEST_REQUESTS = {
  pendingRequest: {
    id: 'test-request-pending',
    userId: TEST_USERS.regular.id,
    requestedBy: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.sap.id,
    instanceId: null,
    tierId: TEST_TIERS.sapViewer.id,
    status: 'requested' as RequestStatus,
    reason: 'Need access for audit project',
  },
  managerApprovedRequest: {
    id: 'test-request-manager-approved',
    userId: TEST_USERS.newHire.id,
    requestedBy: TEST_USERS.newHire.id,
    systemId: TEST_SYSTEMS.salesforce.id,
    instanceId: TEST_INSTANCES.salesforceStaging.id,
    tierId: TEST_TIERS.salesforceUser.id,
    status: 'manager_approved' as RequestStatus,
    reason: 'Onboarding training',
  },
  rejectedRequest: {
    id: 'test-request-rejected',
    userId: TEST_USERS.regular.id,
    requestedBy: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.magento.id,
    instanceId: null,
    tierId: TEST_TIERS.magentoAdmin.id,
    status: 'rejected' as RequestStatus,
    reason: 'I want admin access please',
  },
};

async function cleanDatabase() {
  console.log('🧹 Cleaning test data...');

  // Delete in order to respect foreign key constraints
  await prisma.accessRequest.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  await prisma.accessGrant.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  await prisma.systemOwner.deleteMany({
    where: {
      OR: [
        { systemId: { startsWith: 'test-' } },
        { userId: { startsWith: 'test-' } },
      ],
    },
  });

  await prisma.accessTier.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  await prisma.instance.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  await prisma.system.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  await prisma.user.deleteMany({
    where: { id: { startsWith: 'test-' } },
  });

  console.log('✅ Test data cleaned');
}

async function seedUsers() {
  console.log('👤 Seeding users...');

  // Create manager first (no manager reference)
  await prisma.user.create({
    data: {
      id: TEST_USERS.manager.id,
      name: TEST_USERS.manager.name,
      email: TEST_USERS.manager.email,
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      id: TEST_USERS.admin.id,
      name: TEST_USERS.admin.name,
      email: TEST_USERS.admin.email,
      managerId: TEST_USERS.manager.id,
    },
  });

  // Create regular user
  await prisma.user.create({
    data: {
      id: TEST_USERS.regular.id,
      name: TEST_USERS.regular.name,
      email: TEST_USERS.regular.email,
      managerId: TEST_USERS.manager.id,
    },
  });

  // Create new hire user (for testing user autocomplete)
  await prisma.user.create({
    data: {
      id: TEST_USERS.newHire.id,
      name: TEST_USERS.newHire.name,
      email: TEST_USERS.newHire.email,
      managerId: TEST_USERS.manager.id,
    },
  });

  console.log('✅ Users seeded');
}

async function seedSystems() {
  console.log('🖥️ Seeding systems...');

  for (const system of Object.values(TEST_SYSTEMS)) {
    await prisma.system.create({
      data: {
        id: system.id,
        name: system.name,
        description: system.description,
      },
    });
  }

  console.log('✅ Systems seeded');
}

async function seedTiers() {
  console.log('🔐 Seeding access tiers...');

  for (const tier of Object.values(TEST_TIERS)) {
    await prisma.accessTier.create({
      data: {
        id: tier.id,
        name: tier.name,
        systemId: tier.systemId,
      },
    });
  }

  console.log('✅ Access tiers seeded');
}

async function seedInstances() {
  console.log('📦 Seeding instances...');

  for (const instance of Object.values(TEST_INSTANCES)) {
    await prisma.instance.create({
      data: {
        id: instance.id,
        name: instance.name,
        systemId: instance.systemId,
      },
    });
  }

  console.log('✅ Instances seeded');
}

async function seedSystemOwners() {
  console.log('👑 Seeding system owners...');

  // Admin owns Magento
  await prisma.systemOwner.create({
    data: {
      systemId: TEST_SYSTEMS.magento.id,
      userId: TEST_USERS.admin.id,
    },
  });

  // Manager owns Salesforce and SAP
  await prisma.systemOwner.create({
    data: {
      systemId: TEST_SYSTEMS.salesforce.id,
      userId: TEST_USERS.manager.id,
    },
  });

  await prisma.systemOwner.create({
    data: {
      systemId: TEST_SYSTEMS.sap.id,
      userId: TEST_USERS.manager.id,
    },
  });

  console.log('✅ System owners seeded');
}

async function seedAccessGrants() {
  console.log('🎫 Seeding access grants...');

  // Active grant 1 - Regular user has Editor access to Magento Wellness
  await prisma.accessGrant.create({
    data: {
      id: TEST_GRANTS.activeGrant1.id,
      userId: TEST_GRANTS.activeGrant1.userId,
      systemId: TEST_GRANTS.activeGrant1.systemId,
      instanceId: TEST_GRANTS.activeGrant1.instanceId,
      tierId: TEST_GRANTS.activeGrant1.tierId,
      status: TEST_GRANTS.activeGrant1.status,
      grantedBy: TEST_USERS.admin.id,
      grantedAt: new Date(),
      requestedAt: new Date(Date.now() - 3600000), // 1 hour ago
      approvedBy: TEST_USERS.admin.id,
      approvedAt: new Date(),
      notes: 'Initial access for testing',
    },
  });

  // Active grant 2 - Regular user has User access to Salesforce (all instances)
  await prisma.accessGrant.create({
    data: {
      id: TEST_GRANTS.activeGrant2.id,
      userId: TEST_GRANTS.activeGrant2.userId,
      systemId: TEST_GRANTS.activeGrant2.systemId,
      instanceId: TEST_GRANTS.activeGrant2.instanceId,
      tierId: TEST_GRANTS.activeGrant2.tierId,
      status: TEST_GRANTS.activeGrant2.status,
      grantedBy: TEST_USERS.manager.id,
      grantedAt: new Date(),
      requestedAt: new Date(Date.now() - 7200000), // 2 hours ago
      approvedBy: TEST_USERS.manager.id,
      approvedAt: new Date(),
      notes: 'CRM access for sales team',
    },
  });

  // Removed grant - Manager had Viewer access to SAP
  await prisma.accessGrant.create({
    data: {
      id: TEST_GRANTS.removedGrant.id,
      userId: TEST_GRANTS.removedGrant.userId,
      systemId: TEST_GRANTS.removedGrant.systemId,
      instanceId: TEST_GRANTS.removedGrant.instanceId,
      tierId: TEST_GRANTS.removedGrant.tierId,
      status: TEST_GRANTS.removedGrant.status,
      grantedBy: TEST_USERS.admin.id,
      grantedAt: new Date(Date.now() - 86400000), // 1 day ago
      removedAt: new Date(),
      requestedAt: new Date(Date.now() - 90000000),
      approvedBy: TEST_USERS.admin.id,
      approvedAt: new Date(Date.now() - 86400000),
      notes: 'Access revoked - project completed',
    },
  });

  console.log('✅ Access grants seeded');
}

async function seedAccessRequests() {
  console.log('📝 Seeding access requests...');

  // Pending request
  await prisma.accessRequest.create({
    data: {
      id: TEST_REQUESTS.pendingRequest.id,
      userId: TEST_REQUESTS.pendingRequest.userId,
      requestedBy: TEST_REQUESTS.pendingRequest.requestedBy,
      systemId: TEST_REQUESTS.pendingRequest.systemId,
      instanceId: TEST_REQUESTS.pendingRequest.instanceId,
      tierId: TEST_REQUESTS.pendingRequest.tierId,
      status: TEST_REQUESTS.pendingRequest.status,
      reason: TEST_REQUESTS.pendingRequest.reason,
    },
  });

  // Manager approved request
  await prisma.accessRequest.create({
    data: {
      id: TEST_REQUESTS.managerApprovedRequest.id,
      userId: TEST_REQUESTS.managerApprovedRequest.userId,
      requestedBy: TEST_REQUESTS.managerApprovedRequest.requestedBy,
      systemId: TEST_REQUESTS.managerApprovedRequest.systemId,
      instanceId: TEST_REQUESTS.managerApprovedRequest.instanceId,
      tierId: TEST_REQUESTS.managerApprovedRequest.tierId,
      status: TEST_REQUESTS.managerApprovedRequest.status,
      reason: TEST_REQUESTS.managerApprovedRequest.reason,
    },
  });

  // Rejected request
  await prisma.accessRequest.create({
    data: {
      id: TEST_REQUESTS.rejectedRequest.id,
      userId: TEST_REQUESTS.rejectedRequest.userId,
      requestedBy: TEST_REQUESTS.rejectedRequest.requestedBy,
      systemId: TEST_REQUESTS.rejectedRequest.systemId,
      instanceId: TEST_REQUESTS.rejectedRequest.instanceId,
      tierId: TEST_REQUESTS.rejectedRequest.tierId,
      status: TEST_REQUESTS.rejectedRequest.status,
      reason: TEST_REQUESTS.rejectedRequest.reason,
    },
  });

  console.log('✅ Access requests seeded');
}

export async function seed() {
  console.log('🌱 Starting E2E test database seed...\n');

  try {
    await cleanDatabase();
    await seedUsers();
    await seedSystems();
    await seedTiers();
    await seedInstances();
    await seedSystemOwners();
    await seedAccessGrants();
    await seedAccessRequests();

    console.log('\n✨ E2E test database seeded successfully!');
    console.log('\n📊 Seed Summary:');
    console.log(`   - ${Object.keys(TEST_USERS).length} users`);
    console.log(`   - ${Object.keys(TEST_SYSTEMS).length} systems`);
    console.log(`   - ${Object.keys(TEST_TIERS).length} access tiers`);
    console.log(`   - ${Object.keys(TEST_INSTANCES).length} instances`);
    console.log(`   - ${Object.keys(TEST_GRANTS).length} access grants`);
    console.log(`   - ${Object.keys(TEST_REQUESTS).length} access requests`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

