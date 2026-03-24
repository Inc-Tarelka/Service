-- +migrate Up
-- Поля для инвайт-системы в tarelka_users
ALTER TABLE tarelka_users
	ADD COLUMN IF NOT EXISTS invite_account_type TEXT NOT NULL DEFAULT 'DEFAULT',
	ADD COLUMN IF NOT EXISTS invite_referral_count INT NOT NULL DEFAULT 0;

-- +migrate Down
ALTER TABLE tarelka_users
	DROP COLUMN IF EXISTS invite_account_type,
	DROP COLUMN IF EXISTS invite_referral_count;
