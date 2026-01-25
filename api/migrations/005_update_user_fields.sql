-- +migrate Up
-- Add username column, migrate data from login, add NOT NULL and UNIQUE
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS username VARCHAR(255);
UPDATE tarelka_users SET username = login WHERE username IS NULL;
ALTER TABLE tarelka_users ALTER COLUMN username SET NOT NULL;
-- Add unique constraint for username if not exists
-- +migrate StatementBegin
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'uq_tarelka_users_username'
	) THEN
		ALTER TABLE tarelka_users ADD CONSTRAINT uq_tarelka_users_username UNIQUE (username);
	END IF;
END $$;
-- +migrate StatementEnd
CREATE INDEX IF NOT EXISTS idx_tarelka_users_username ON tarelka_users(username);

-- Add phone column (non-unique)
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
-- No unique constraint for phone

-- Drop old login column and index if exist
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS login;
DROP INDEX IF EXISTS idx_tarelka_users_login;

-- +migrate Down
-- Restore login from username and drop username/phone
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS login VARCHAR(255);
UPDATE tarelka_users SET login = username WHERE login IS NULL;
ALTER TABLE tarelka_users ALTER COLUMN login SET NOT NULL;
-- Add unique constraint for login if not exists
-- +migrate StatementBegin
DO $$
BEGIN
	IF NOT EXISTS (
		SELECT 1 FROM pg_constraint WHERE conname = 'uq_tarelka_users_login'
	) THEN
		ALTER TABLE tarelka_users ADD CONSTRAINT uq_tarelka_users_login UNIQUE (login);
	END IF;
END $$;
-- +migrate StatementEnd
CREATE INDEX IF NOT EXISTS idx_tarelka_users_login ON tarelka_users(login);

-- Remove username
ALTER TABLE tarelka_users DROP CONSTRAINT IF EXISTS uq_tarelka_users_username;
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS username;
DROP INDEX IF EXISTS idx_tarelka_users_username;

-- Remove phone
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS phone;
