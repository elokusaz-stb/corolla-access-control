-- ===========================================
-- Corolla Access Control - Supabase SQL Schema
-- ===========================================
-- Run this file in the Supabase SQL Editor
-- All tables are prefixed with ai_bootcamp_

-- ===========================================
-- 1. ENUMS
-- ===========================================

-- Grant status enum for tracking access state
CREATE TYPE ai_bootcamp_grant_status AS ENUM ('active', 'removed');

-- ===========================================
-- 2. TABLES
-- ===========================================

-- User table: Organization members with hierarchical manager relationships
CREATE TABLE ai_bootcamp_user (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    manager_id TEXT REFERENCES ai_bootcamp_user(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_bootcamp_user IS 'Organization members who can own systems and receive access grants';
COMMENT ON COLUMN ai_bootcamp_user.manager_id IS 'Self-reference to user manager for org hierarchy';

-- System table: Applications/services requiring access control
CREATE TABLE ai_bootcamp_system (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_bootcamp_system IS 'Applications, services, or tools that require access control';

-- Instance table: Environments/deployments of a system
CREATE TABLE ai_bootcamp_instance (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    system_id TEXT NOT NULL REFERENCES ai_bootcamp_system(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(system_id, name)
);

COMMENT ON TABLE ai_bootcamp_instance IS 'Specific deployments or environments of a system (e.g., prod, staging, dev)';

-- Access Tier table: Permission levels within a system
CREATE TABLE ai_bootcamp_access_tier (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT NOT NULL,
    system_id TEXT NOT NULL REFERENCES ai_bootcamp_system(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(system_id, name)
);

COMMENT ON TABLE ai_bootcamp_access_tier IS 'Permission levels within a system (e.g., viewer, editor, admin)';

-- System Owners junction table: Many-to-many relationship between users and systems
CREATE TABLE ai_bootcamp_system_owner (
    system_id TEXT NOT NULL REFERENCES ai_bootcamp_system(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES ai_bootcamp_user(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (system_id, user_id)
);

COMMENT ON TABLE ai_bootcamp_system_owner IS 'Junction table for system ownership (many-to-many)';

-- Access Grant table: Links user to system/instance with a specific tier
CREATE TABLE ai_bootcamp_access_grant (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES ai_bootcamp_user(id) ON DELETE CASCADE,
    system_id TEXT NOT NULL REFERENCES ai_bootcamp_system(id) ON DELETE CASCADE,
    instance_id TEXT REFERENCES ai_bootcamp_instance(id) ON DELETE SET NULL,
    tier_id TEXT NOT NULL REFERENCES ai_bootcamp_access_tier(id) ON DELETE RESTRICT,
    status ai_bootcamp_grant_status NOT NULL DEFAULT 'active',
    granted_by TEXT NOT NULL,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    removed_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE ai_bootcamp_access_grant IS 'Records of access permissions granted to users for systems';
COMMENT ON COLUMN ai_bootcamp_access_grant.instance_id IS 'Optional - NULL means access to all instances';
COMMENT ON COLUMN ai_bootcamp_access_grant.granted_by IS 'User ID or identifier of who granted access';

-- ===========================================
-- 3. INDEXES
-- ===========================================

-- User indexes
CREATE INDEX idx_ai_bootcamp_user_manager_id ON ai_bootcamp_user(manager_id);
CREATE INDEX idx_ai_bootcamp_user_email ON ai_bootcamp_user(email);

-- System indexes
CREATE INDEX idx_ai_bootcamp_system_name ON ai_bootcamp_system(name);

-- Instance indexes
CREATE INDEX idx_ai_bootcamp_instance_system_id ON ai_bootcamp_instance(system_id);

-- Access Tier indexes
CREATE INDEX idx_ai_bootcamp_access_tier_system_id ON ai_bootcamp_access_tier(system_id);

-- Access Grant indexes
CREATE INDEX idx_ai_bootcamp_access_grant_user_id ON ai_bootcamp_access_grant(user_id);
CREATE INDEX idx_ai_bootcamp_access_grant_system_id ON ai_bootcamp_access_grant(system_id);
CREATE INDEX idx_ai_bootcamp_access_grant_instance_id ON ai_bootcamp_access_grant(instance_id);
CREATE INDEX idx_ai_bootcamp_access_grant_tier_id ON ai_bootcamp_access_grant(tier_id);
CREATE INDEX idx_ai_bootcamp_access_grant_status ON ai_bootcamp_access_grant(status);
CREATE INDEX idx_ai_bootcamp_access_grant_granted_at ON ai_bootcamp_access_grant(granted_at);
CREATE INDEX idx_ai_bootcamp_access_grant_user_system_status ON ai_bootcamp_access_grant(user_id, system_id, status);

-- ===========================================
-- 4. UPDATED_AT TRIGGER FUNCTION
-- ===========================================

CREATE OR REPLACE FUNCTION ai_bootcamp_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER trigger_ai_bootcamp_user_updated_at
    BEFORE UPDATE ON ai_bootcamp_user
    FOR EACH ROW EXECUTE FUNCTION ai_bootcamp_update_updated_at();

CREATE TRIGGER trigger_ai_bootcamp_system_updated_at
    BEFORE UPDATE ON ai_bootcamp_system
    FOR EACH ROW EXECUTE FUNCTION ai_bootcamp_update_updated_at();

CREATE TRIGGER trigger_ai_bootcamp_instance_updated_at
    BEFORE UPDATE ON ai_bootcamp_instance
    FOR EACH ROW EXECUTE FUNCTION ai_bootcamp_update_updated_at();

CREATE TRIGGER trigger_ai_bootcamp_access_tier_updated_at
    BEFORE UPDATE ON ai_bootcamp_access_tier
    FOR EACH ROW EXECUTE FUNCTION ai_bootcamp_update_updated_at();

CREATE TRIGGER trigger_ai_bootcamp_access_grant_updated_at
    BEFORE UPDATE ON ai_bootcamp_access_grant
    FOR EACH ROW EXECUTE FUNCTION ai_bootcamp_update_updated_at();

-- ===========================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ===========================================

-- Enable RLS on all tables
ALTER TABLE ai_bootcamp_user ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bootcamp_system ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bootcamp_instance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bootcamp_access_tier ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bootcamp_system_owner ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_bootcamp_access_grant ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 5.1 USER TABLE POLICIES
-- ===========================================

-- Users can view all users (for org directory)
CREATE POLICY "ai_bootcamp_user_select_all"
    ON ai_bootcamp_user
    FOR SELECT
    TO authenticated
    USING (true);

-- Users can update their own profile
CREATE POLICY "ai_bootcamp_user_update_own"
    ON ai_bootcamp_user
    FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (email = auth.jwt()->>'email');

-- Only service role can insert/delete users (admin operations)
CREATE POLICY "ai_bootcamp_user_insert_service"
    ON ai_bootcamp_user
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "ai_bootcamp_user_delete_service"
    ON ai_bootcamp_user
    FOR DELETE
    TO service_role
    USING (true);

-- ===========================================
-- 5.2 SYSTEM TABLE POLICIES
-- ===========================================

-- All authenticated users can view systems
CREATE POLICY "ai_bootcamp_system_select_all"
    ON ai_bootcamp_system
    FOR SELECT
    TO authenticated
    USING (true);

-- System owners can update their systems
CREATE POLICY "ai_bootcamp_system_update_owner"
    ON ai_bootcamp_system
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_system.id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- Only service role can insert/delete systems
CREATE POLICY "ai_bootcamp_system_insert_service"
    ON ai_bootcamp_system
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "ai_bootcamp_system_delete_service"
    ON ai_bootcamp_system
    FOR DELETE
    TO service_role
    USING (true);

-- ===========================================
-- 5.3 INSTANCE TABLE POLICIES
-- ===========================================

-- All authenticated users can view instances
CREATE POLICY "ai_bootcamp_instance_select_all"
    ON ai_bootcamp_instance
    FOR SELECT
    TO authenticated
    USING (true);

-- System owners can manage instances
CREATE POLICY "ai_bootcamp_instance_insert_owner"
    ON ai_bootcamp_instance
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_instance.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "ai_bootcamp_instance_update_owner"
    ON ai_bootcamp_instance
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_instance.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "ai_bootcamp_instance_delete_owner"
    ON ai_bootcamp_instance
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_instance.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- ===========================================
-- 5.4 ACCESS TIER TABLE POLICIES
-- ===========================================

-- All authenticated users can view access tiers
CREATE POLICY "ai_bootcamp_access_tier_select_all"
    ON ai_bootcamp_access_tier
    FOR SELECT
    TO authenticated
    USING (true);

-- System owners can manage access tiers
CREATE POLICY "ai_bootcamp_access_tier_insert_owner"
    ON ai_bootcamp_access_tier
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_tier.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "ai_bootcamp_access_tier_update_owner"
    ON ai_bootcamp_access_tier
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_tier.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

CREATE POLICY "ai_bootcamp_access_tier_delete_owner"
    ON ai_bootcamp_access_tier
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_tier.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- ===========================================
-- 5.5 SYSTEM OWNER TABLE POLICIES
-- ===========================================

-- All authenticated users can view system owners
CREATE POLICY "ai_bootcamp_system_owner_select_all"
    ON ai_bootcamp_system_owner
    FOR SELECT
    TO authenticated
    USING (true);

-- Only service role can manage system owners
CREATE POLICY "ai_bootcamp_system_owner_insert_service"
    ON ai_bootcamp_system_owner
    FOR INSERT
    TO service_role
    WITH CHECK (true);

CREATE POLICY "ai_bootcamp_system_owner_delete_service"
    ON ai_bootcamp_system_owner
    FOR DELETE
    TO service_role
    USING (true);

-- ===========================================
-- 5.6 ACCESS GRANT TABLE POLICIES
-- ===========================================

-- Users can view their own grants
CREATE POLICY "ai_bootcamp_access_grant_select_own"
    ON ai_bootcamp_access_grant
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_user u
            WHERE u.id = ai_bootcamp_access_grant.user_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- System owners can view all grants for their systems
CREATE POLICY "ai_bootcamp_access_grant_select_owner"
    ON ai_bootcamp_access_grant
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_grant.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- Managers can view grants for their team members
CREATE POLICY "ai_bootcamp_access_grant_select_manager"
    ON ai_bootcamp_access_grant
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_user grantee
            JOIN ai_bootcamp_user manager ON manager.id = grantee.manager_id
            WHERE grantee.id = ai_bootcamp_access_grant.user_id
            AND manager.email = auth.jwt()->>'email'
        )
    );

-- System owners can insert grants for their systems
CREATE POLICY "ai_bootcamp_access_grant_insert_owner"
    ON ai_bootcamp_access_grant
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_grant.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- System owners can update grants for their systems
CREATE POLICY "ai_bootcamp_access_grant_update_owner"
    ON ai_bootcamp_access_grant
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_grant.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- System owners can delete grants for their systems
CREATE POLICY "ai_bootcamp_access_grant_delete_owner"
    ON ai_bootcamp_access_grant
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM ai_bootcamp_system_owner so
            JOIN ai_bootcamp_user u ON u.id = so.user_id
            WHERE so.system_id = ai_bootcamp_access_grant.system_id
            AND u.email = auth.jwt()->>'email'
        )
    );

-- ===========================================
-- 6. SEED DATA (Optional - for testing)
-- ===========================================

-- Uncomment below to add sample data for testing

/*
-- Sample Systems
INSERT INTO ai_bootcamp_system (id, name, description) VALUES
    ('sys_github', 'GitHub', 'Source code repository'),
    ('sys_aws', 'AWS Console', 'Cloud infrastructure'),
    ('sys_jira', 'Jira', 'Project management');

-- Sample Access Tiers for GitHub
INSERT INTO ai_bootcamp_access_tier (id, name, system_id) VALUES
    ('tier_gh_read', 'Read', 'sys_github'),
    ('tier_gh_write', 'Write', 'sys_github'),
    ('tier_gh_admin', 'Admin', 'sys_github');

-- Sample Instances for AWS
INSERT INTO ai_bootcamp_instance (id, name, system_id) VALUES
    ('inst_aws_prod', 'Production', 'sys_aws'),
    ('inst_aws_staging', 'Staging', 'sys_aws'),
    ('inst_aws_dev', 'Development', 'sys_aws');
*/

-- ===========================================
-- MIGRATION COMPLETE
-- ===========================================


