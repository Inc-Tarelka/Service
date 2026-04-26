-- +migrate Up

-- Add new notification type for team invitations and approval flag
ALTER TYPE notification_type ADD VALUE IF NOT EXISTS 'TeamInvite';

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS is_approve BOOLEAN;

-- +migrate Down

ALTER TABLE notifications
    DROP COLUMN IF EXISTS is_approve;

-- NOTE: PostgreSQL doesn't support removing values from ENUM types in a simple way,
-- so the 'TeamInvite' value will remain in notification_type after down migration.
