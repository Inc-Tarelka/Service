-- +migrate Up
-- Добавляем поля для инвайт-системы в tg_users
ALTER TABLE tg_users
	ADD COLUMN IF NOT EXISTS invite_account_type TEXT NOT NULL DEFAULT 'DEFAULT',
	ADD COLUMN IF NOT EXISTS invite_referral_count INT NOT NULL DEFAULT 0;

-- Переносим значения из tarelka_users в tg_users (берём максимальный invite_referral_count и CLUB_PARTICIPANT если есть хотя бы один)
UPDATE tg_users t SET
	invite_account_type = COALESCE((
		SELECT 'CLUB_PARTICIPANT'
		FROM tarelka_users u
		WHERE u.tg_user_id = t.telegram_id AND u.invite_account_type = 'CLUB_PARTICIPANT'
		LIMIT 1
	), 'DEFAULT'),
	invite_referral_count = COALESCE((
		SELECT MAX(invite_referral_count)
		FROM tarelka_users u
		WHERE u.tg_user_id = t.telegram_id
	), 0);

-- +migrate Down
ALTER TABLE tg_users
	DROP COLUMN IF EXISTS invite_account_type,
	DROP COLUMN IF EXISTS invite_referral_count;
