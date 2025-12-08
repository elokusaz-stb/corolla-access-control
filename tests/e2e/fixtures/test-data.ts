/**
 * E2E Test Data Constants
 *
 * Export test data for use in E2E tests without needing to import the seed directly.
 * This ensures tests can reference consistent IDs and values.
 */

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

export const TEST_GRANTS = {
  activeGrant1: {
    id: 'test-grant-active-1',
    userId: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.magento.id,
    instanceId: TEST_INSTANCES.magentoWellness.id,
    tierId: TEST_TIERS.magentoEditor.id,
    status: 'active',
  },
  activeGrant2: {
    id: 'test-grant-active-2',
    userId: TEST_USERS.regular.id,
    systemId: TEST_SYSTEMS.salesforce.id,
    instanceId: null,
    tierId: TEST_TIERS.salesforceUser.id,
    status: 'active',
  },
  removedGrant: {
    id: 'test-grant-removed',
    userId: TEST_USERS.manager.id,
    systemId: TEST_SYSTEMS.sap.id,
    instanceId: null,
    tierId: TEST_TIERS.sapViewer.id,
    status: 'removed',
  },
};

// CSV content for bulk upload testing
export const VALID_CSV_CONTENT = `user_email,system_name,instance_name,access_tier_name,notes
${TEST_USERS.newHire.email},${TEST_SYSTEMS.magento.name},${TEST_INSTANCES.magentoWellness.name},${TEST_TIERS.magentoViewer.name},New hire onboarding
${TEST_USERS.newHire.email},${TEST_SYSTEMS.salesforce.name},${TEST_INSTANCES.salesforceProd.name},${TEST_TIERS.salesforceUser.name},CRM access`;

export const INVALID_CSV_CONTENT = `user_email,system_name,instance_name,access_tier_name,notes
invalid@unknown.com,${TEST_SYSTEMS.magento.name},,${TEST_TIERS.magentoViewer.name},Invalid user
${TEST_USERS.newHire.email},UnknownSystem,,Admin,Invalid system`;

export const MIXED_CSV_CONTENT = `user_email,system_name,instance_name,access_tier_name,notes
${TEST_USERS.newHire.email},${TEST_SYSTEMS.magento.name},,${TEST_TIERS.magentoViewer.name},Valid row
invalid@unknown.com,${TEST_SYSTEMS.magento.name},,${TEST_TIERS.magentoViewer.name},Invalid user row`;
