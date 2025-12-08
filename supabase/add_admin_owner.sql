-- Add elokusaz as user and owner of all systems
-- Run this in Supabase SQL Editor

-- 1. Create the admin user
INSERT INTO ai_bootcamp_user (id, name, email, created_at, updated_at)
VALUES (
  'user-elokusaz-admin',
  'Elokusaz',
  'elokusaz@silvertreebrands.com',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = 'Elokusaz',
  updated_at = NOW();

-- Also add the silvertree.cloud email variant
INSERT INTO ai_bootcamp_user (id, name, email, created_at, updated_at)
VALUES (
  'user-elokusaz-cloud',
  'Elokusaz',
  'elokusaz@silvertree.cloud',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  name = 'Elokusaz',
  updated_at = NOW();

-- 2. Add both as owners to ALL systems
INSERT INTO ai_bootcamp_system_owner (user_id, system_id, created_at)
SELECT 'user-elokusaz-admin', id, NOW()
FROM ai_bootcamp_system
ON CONFLICT DO NOTHING;

INSERT INTO ai_bootcamp_system_owner (user_id, system_id, created_at)
SELECT 'user-elokusaz-cloud', id, NOW()
FROM ai_bootcamp_system
ON CONFLICT DO NOTHING;

-- 3. Verify results
SELECT 
  u.name as user_name,
  u.email,
  COUNT(so.system_id) as systems_owned
FROM ai_bootcamp_user u
LEFT JOIN ai_bootcamp_system_owner so ON u.id = so.user_id
WHERE u.email LIKE '%elokusaz%'
GROUP BY u.id, u.name, u.email;
