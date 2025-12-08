-- ===========================================
-- Corolla Seed Data - Run in Supabase SQL Editor
-- ===========================================

-- 1. USERS
INSERT INTO ai_bootcamp_user (id, name, email) VALUES
  ('test-user-manager', 'Test Manager', 'manager@test.corolla.com'),
  ('test-user-admin', 'Test Admin', 'admin@test.corolla.com'),
  ('test-user-regular', 'Test User', 'user@test.corolla.com'),
  ('test-user-newhire', 'New Hire User', 'newhire@test.corolla.com'),
  ('user-alice', 'Alice Johnson', 'alice@company.com'),
  ('user-bob', 'Bob Smith', 'bob@company.com'),
  ('user-carol', 'Carol Williams', 'carol@company.com')
ON CONFLICT (id) DO NOTHING;

-- Set manager relationships
UPDATE ai_bootcamp_user SET manager_id = 'test-user-manager' WHERE id IN ('test-user-admin', 'test-user-regular', 'test-user-newhire');

-- 2. SYSTEMS
INSERT INTO ai_bootcamp_system (id, name, description) VALUES
  ('test-system-magento', 'Magento', 'E-commerce platform for online stores'),
  ('test-system-salesforce', 'Salesforce', 'Customer relationship management platform'),
  ('test-system-sap', 'SAP', 'Enterprise resource planning system'),
  ('system-jira', 'Jira', 'Project management and issue tracking'),
  ('system-slack', 'Slack', 'Team communication platform')
ON CONFLICT (id) DO NOTHING;

-- 3. ACCESS TIERS
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  -- Magento tiers
  ('test-tier-magento-admin', 'Admin', 'test-system-magento'),
  ('test-tier-magento-editor', 'Editor', 'test-system-magento'),
  ('test-tier-magento-viewer', 'Viewer', 'test-system-magento'),
  -- Salesforce tiers
  ('test-tier-sf-admin', 'Admin', 'test-system-salesforce'),
  ('test-tier-sf-user', 'User', 'test-system-salesforce'),
  -- SAP tiers
  ('test-tier-sap-admin', 'Admin', 'test-system-sap'),
  ('test-tier-sap-viewer', 'Viewer', 'test-system-sap'),
  -- Jira tiers
  ('tier-jira-admin', 'Admin', 'system-jira'),
  ('tier-jira-user', 'User', 'system-jira'),
  -- Slack tiers
  ('tier-slack-admin', 'Workspace Admin', 'system-slack'),
  ('tier-slack-member', 'Member', 'system-slack')
ON CONFLICT (id) DO NOTHING;

-- 4. INSTANCES
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  -- Magento instances
  ('test-instance-magento-wellness', 'Wellness', 'test-system-magento'),
  ('test-instance-magento-cookies', 'Cape Cookies', 'test-system-magento'),
  -- Salesforce instances
  ('test-instance-sf-prod', 'Production', 'test-system-salesforce'),
  ('test-instance-sf-staging', 'Staging', 'test-system-salesforce')
ON CONFLICT (id) DO NOTHING;

-- 5. SYSTEM OWNERS
INSERT INTO ai_bootcamp_system_owner (system_id, user_id) VALUES
  ('test-system-magento', 'test-user-admin'),
  ('test-system-salesforce', 'test-user-manager'),
  ('test-system-sap', 'test-user-manager'),
  ('system-jira', 'test-user-admin'),
  ('system-slack', 'test-user-admin')
ON CONFLICT (system_id, user_id) DO NOTHING;

-- 6. ACCESS GRANTS
INSERT INTO ai_bootcamp_access_grant (id, user_id, system_id, instance_id, tier_id, status, granted_by, granted_at, notes) VALUES
  -- Active grants
  ('test-grant-active-1', 'test-user-regular', 'test-system-magento', 'test-instance-magento-wellness', 'test-tier-magento-editor', 'active', 'test-user-admin', NOW(), 'Initial access for testing'),
  ('test-grant-active-2', 'test-user-regular', 'test-system-salesforce', NULL, 'test-tier-sf-user', 'active', 'test-user-manager', NOW(), 'CRM access for sales team'),
  ('grant-alice-magento', 'user-alice', 'test-system-magento', 'test-instance-magento-cookies', 'test-tier-magento-admin', 'active', 'test-user-admin', NOW() - INTERVAL '5 days', 'Store manager access'),
  ('grant-bob-jira', 'user-bob', 'system-jira', NULL, 'tier-jira-user', 'active', 'test-user-admin', NOW() - INTERVAL '10 days', 'Project access'),
  ('grant-carol-slack', 'user-carol', 'system-slack', NULL, 'tier-slack-member', 'active', 'test-user-admin', NOW() - INTERVAL '30 days', 'Team member')
ON CONFLICT (id) DO NOTHING;

-- Add a removed grant for testing
INSERT INTO ai_bootcamp_access_grant (id, user_id, system_id, instance_id, tier_id, status, granted_by, granted_at, removed_at, notes) VALUES
  ('test-grant-removed', 'test-user-manager', 'test-system-sap', NULL, 'test-tier-sap-viewer', 'removed', 'test-user-admin', NOW() - INTERVAL '1 day', NOW(), 'Access revoked - project completed')
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT 'Users:' as entity, COUNT(*) as count FROM ai_bootcamp_user
UNION ALL
SELECT 'Systems:', COUNT(*) FROM ai_bootcamp_system
UNION ALL
SELECT 'Tiers:', COUNT(*) FROM ai_bootcamp_access_tier
UNION ALL
SELECT 'Instances:', COUNT(*) FROM ai_bootcamp_instance
UNION ALL
SELECT 'Owners:', COUNT(*) FROM ai_bootcamp_system_owner
UNION ALL
SELECT 'Grants:', COUNT(*) FROM ai_bootcamp_access_grant;

