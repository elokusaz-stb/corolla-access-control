-- ===========================================
-- Corolla - Additional Systems Seed Data
-- Run in Supabase SQL Editor
-- ===========================================

-- SYSTEMS
INSERT INTO ai_bootcamp_system (id, name, description) VALUES
  ('system-magento', 'Magento', 'E-commerce platform for managing online stores and product catalogs'),
  ('system-acumatica', 'Acumatica', 'Cloud ERP software for financials, distribution, and CRM'),
  ('system-n8n', 'n8n', 'Workflow automation tool for connecting apps and services'),
  ('system-powerbi', 'Power BI', 'Business analytics and data visualization platform')
ON CONFLICT (id) DO NOTHING;

-- ACCESS TIERS FOR MAGENTO
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-magento-admin', 'Admin', 'system-magento'),
  ('tier-magento-store-manager', 'Store Manager', 'system-magento'),
  ('tier-magento-catalog-manager', 'Catalog Manager', 'system-magento'),
  ('tier-magento-order-processor', 'Order Processor', 'system-magento'),
  ('tier-magento-viewer', 'Viewer', 'system-magento')
ON CONFLICT (id) DO NOTHING;

-- ACCESS TIERS FOR ACUMATICA
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-acumatica-admin', 'Administrator', 'system-acumatica'),
  ('tier-acumatica-accountant', 'Accountant', 'system-acumatica'),
  ('tier-acumatica-ap-clerk', 'AP Clerk', 'system-acumatica'),
  ('tier-acumatica-ar-clerk', 'AR Clerk', 'system-acumatica'),
  ('tier-acumatica-inventory', 'Inventory Manager', 'system-acumatica'),
  ('tier-acumatica-viewer', 'Report Viewer', 'system-acumatica')
ON CONFLICT (id) DO NOTHING;

-- ACCESS TIERS FOR N8N
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-n8n-admin', 'Admin', 'system-n8n'),
  ('tier-n8n-editor', 'Workflow Editor', 'system-n8n'),
  ('tier-n8n-executor', 'Workflow Executor', 'system-n8n'),
  ('tier-n8n-viewer', 'Viewer', 'system-n8n')
ON CONFLICT (id) DO NOTHING;

-- ACCESS TIERS FOR POWER BI
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
  ('tier-powerbi-admin', 'Admin', 'system-powerbi'),
  ('tier-powerbi-creator', 'Report Creator', 'system-powerbi'),
  ('tier-powerbi-contributor', 'Contributor', 'system-powerbi'),
  ('tier-powerbi-viewer', 'Viewer', 'system-powerbi')
ON CONFLICT (id) DO NOTHING;

-- INSTANCES FOR MAGENTO (different stores)
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-magento-wellness', 'Wellness Store', 'system-magento'),
  ('instance-magento-cookies', 'Cape Cookies', 'system-magento'),
  ('instance-magento-staging', 'Staging', 'system-magento'),
  ('instance-magento-dev', 'Development', 'system-magento')
ON CONFLICT (id) DO NOTHING;

-- INSTANCES FOR ACUMATICA (environments)
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-acumatica-prod', 'Production', 'system-acumatica'),
  ('instance-acumatica-sandbox', 'Sandbox', 'system-acumatica'),
  ('instance-acumatica-test', 'Test', 'system-acumatica')
ON CONFLICT (id) DO NOTHING;

-- INSTANCES FOR N8N (environments)
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-n8n-prod', 'Production', 'system-n8n'),
  ('instance-n8n-dev', 'Development', 'system-n8n')
ON CONFLICT (id) DO NOTHING;

-- INSTANCES FOR POWER BI (workspaces)
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
  ('instance-powerbi-finance', 'Finance Workspace', 'system-powerbi'),
  ('instance-powerbi-sales', 'Sales Workspace', 'system-powerbi'),
  ('instance-powerbi-ops', 'Operations Workspace', 'system-powerbi'),
  ('instance-powerbi-executive', 'Executive Workspace', 'system-powerbi')
ON CONFLICT (id) DO NOTHING;

-- SYSTEM OWNERS (assign test-user-admin as owner)
INSERT INTO ai_bootcamp_system_owner (system_id, user_id) VALUES
  ('system-magento', 'test-user-admin'),
  ('system-acumatica', 'test-user-admin'),
  ('system-n8n', 'test-user-admin'),
  ('system-powerbi', 'test-user-manager')
ON CONFLICT (system_id, user_id) DO NOTHING;

-- Verify the new data
SELECT '=== Systems ===' as info;
SELECT id, name FROM ai_bootcamp_system ORDER BY name;

SELECT '=== Tiers by System ===' as info;
SELECT s.name as system, t.name as tier 
FROM ai_bootcamp_access_tier t 
JOIN ai_bootcamp_system s ON t.system_id = s.id 
ORDER BY s.name, t.name;

SELECT '=== Instances by System ===' as info;
SELECT s.name as system, i.name as instance 
FROM ai_bootcamp_instance i 
JOIN ai_bootcamp_system s ON i.system_id = s.id 
ORDER BY s.name, i.name;

