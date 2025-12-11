-- ===========================================
-- Corolla - COMPLETE Seed Data
-- Run in Supabase SQL Editor
-- ===========================================

-- 1. USERS (create first - needed for foreign keys)
INSERT INTO ai_bootcamp_user (id, name, email) VALUES
  ('test-user-manager', 'Test Manager', 'manager@test.corolla.com'),
  ('test-user-admin', 'Test Admin', 'admin@test.corolla.com'),
  ('test-user-regular', 'Test User', 'user@test.corolla.com'),
  ('user-alice', 'Alice Johnson', 'alice@company.com'),
  ('user-bob', 'Bob Smith', 'bob@company.com'),
  ('user-carol', 'Carol Williams', 'carol@company.com'),
  ('user-david', 'David Lee', 'david@company.com'),
  ('user-emma', 'Emma Wilson', 'emma@company.com')
ON CONFLICT (id) DO NOTHING;

-- 2. SYSTEMS
INSERT INTO ai_bootcamp_system (id, name, description) VALUES
  ('system-magento', 'Magento', 'E-commerce platform for managing online stores and product catalogs'),
  ('system-acumatica', 'Acumatica', 'Cloud ERP software for financials, distribution, and CRM'),
  ('system-n8n', 'n8n', 'Workflow automation tool for connecting apps and services'),
  ('system-powerbi', 'Power BI', 'Business analytics and data visualization platform'),
  ('system-salesforce', 'Salesforce', 'Customer relationship management platform'),
  ('system-jira', 'Jira', 'Project management and issue tracking'),
  ('system-slack', 'Slack', 'Team communication platform')
ON CONFLICT (id) DO NOTHING;

-- 3. ACCESS TIERS
-- Magento
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-magento-admin', 'Admin', 'system-magento'),
  ('tier-magento-store-manager', 'Store Manager', 'system-magento'),
  ('tier-magento-catalog-manager', 'Catalog Manager', 'system-magento'),
  ('tier-magento-viewer', 'Viewer', 'system-magento')
ON CONFLICT (id) DO NOTHING;

-- Acumatica
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-acumatica-admin', 'Administrator', 'system-acumatica'),
  ('tier-acumatica-accountant', 'Accountant', 'system-acumatica'),
  ('tier-acumatica-ap-clerk', 'AP Clerk', 'system-acumatica'),
  ('tier-acumatica-viewer', 'Report Viewer', 'system-acumatica')
ON CONFLICT (id) DO NOTHING;

-- n8n
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-n8n-admin', 'Admin', 'system-n8n'),
  ('tier-n8n-editor', 'Workflow Editor', 'system-n8n'),
  ('tier-n8n-viewer', 'Viewer', 'system-n8n')
ON CONFLICT (id) DO NOTHING;

-- Power BI
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-powerbi-admin', 'Admin', 'system-powerbi'),
  ('tier-powerbi-creator', 'Report Creator', 'system-powerbi'),
  ('tier-powerbi-viewer', 'Viewer', 'system-powerbi')
ON CONFLICT (id) DO NOTHING;

-- Salesforce
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-sf-admin', 'Admin', 'system-salesforce'),
  ('tier-sf-user', 'User', 'system-salesforce'),
  ('tier-sf-viewer', 'Viewer', 'system-salesforce')
ON CONFLICT (id) DO NOTHING;

-- Jira
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-jira-admin', 'Admin', 'system-jira'),
  ('tier-jira-user', 'User', 'system-jira')
ON CONFLICT (id) DO NOTHING;

-- Slack
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-slack-admin', 'Workspace Admin', 'system-slack'),
  ('tier-slack-member', 'Member', 'system-slack')
ON CONFLICT (id) DO NOTHING;

-- 4. INSTANCES
-- Magento stores
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-magento-wellness', 'Wellness Store', 'system-magento'),
  ('instance-magento-cookies', 'Cape Cookies', 'system-magento'),
  ('instance-magento-staging', 'Staging', 'system-magento')
ON CONFLICT (id) DO NOTHING;

-- Acumatica environments
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-acumatica-prod', 'Production', 'system-acumatica'),
  ('instance-acumatica-sandbox', 'Sandbox', 'system-acumatica')
ON CONFLICT (id) DO NOTHING;

-- n8n environments
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-n8n-prod', 'Production', 'system-n8n'),
  ('instance-n8n-dev', 'Development', 'system-n8n')
ON CONFLICT (id) DO NOTHING;

-- Power BI workspaces
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-powerbi-finance', 'Finance Workspace', 'system-powerbi'),
  ('instance-powerbi-sales', 'Sales Workspace', 'system-powerbi'),
  ('instance-powerbi-ops', 'Operations Workspace', 'system-powerbi')
ON CONFLICT (id) DO NOTHING;

-- Salesforce environments
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-sf-prod', 'Production', 'system-salesforce'),
  ('instance-sf-sandbox', 'Sandbox', 'system-salesforce')
ON CONFLICT (id) DO NOTHING;

-- 5. SYSTEM OWNERS
INSERT INTO ai_bootcamp_system_owner (system_id, user_id) VALUES
  ('system-magento', 'test-user-admin'),
  ('system-acumatica', 'test-user-admin'),
  ('system-n8n', 'test-user-admin'),
  ('system-powerbi', 'test-user-manager'),
  ('system-salesforce', 'test-user-manager'),
  ('system-jira', 'test-user-admin'),
  ('system-slack', 'test-user-admin')
ON CONFLICT (system_id, user_id) DO NOTHING;

-- 6. SAMPLE ACCESS GRANTS
INSERT INTO ai_bootcamp_access_grant (id, user_id, system_id, instance_id, tier_id, status, granted_by, granted_at, notes) VALUES
  ('grant-alice-magento', 'user-alice', 'system-magento', 'instance-magento-wellness', 'tier-magento-store-manager', 'active', 'test-user-admin', NOW() - INTERVAL '10 days', 'Wellness store manager'),
  ('grant-bob-acumatica', 'user-bob', 'system-acumatica', 'instance-acumatica-prod', 'tier-acumatica-accountant', 'active', 'test-user-admin', NOW() - INTERVAL '30 days', 'Finance team'),
  ('grant-carol-powerbi', 'user-carol', 'system-powerbi', 'instance-powerbi-finance', 'tier-powerbi-viewer', 'active', 'test-user-manager', NOW() - INTERVAL '5 days', 'Monthly reporting access'),
  ('grant-david-n8n', 'user-david', 'system-n8n', 'instance-n8n-prod', 'tier-n8n-editor', 'active', 'test-user-admin', NOW() - INTERVAL '15 days', 'Automation team'),
  ('grant-emma-salesforce', 'user-emma', 'system-salesforce', 'instance-sf-prod', 'tier-sf-user', 'active', 'test-user-manager', NOW() - INTERVAL '20 days', 'Sales team member')
ON CONFLICT (id) DO NOTHING;

-- VERIFY DATA
SELECT 'Users: ' || COUNT(*)::text FROM ai_bootcamp_user;
SELECT 'Systems: ' || COUNT(*)::text FROM ai_bootcamp_system;
SELECT 'Tiers: ' || COUNT(*)::text FROM ai_bootcamp_access_tier;
SELECT 'Instances: ' || COUNT(*)::text FROM ai_bootcamp_instance;
SELECT 'Owners: ' || COUNT(*)::text FROM ai_bootcamp_system_owner;
SELECT 'Grants: ' || COUNT(*)::text FROM ai_bootcamp_access_grant;


