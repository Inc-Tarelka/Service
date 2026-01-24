-- +migrate Up
-- Remove optional phone column
ALTER TABLE tarelka_users
    DROP COLUMN IF EXISTS phone;

-- +migrate StatementBegin
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE schemaname = ANY(current_schemas(false)) 
        AND indexname = 'idx_tarelka_users_phone'
    ) THEN
        EXECUTE 'DROP INDEX idx_tarelka_users_phone';
    END IF;
END $$;
-- +migrate StatementEnd

-- +migrate Down
ALTER TABLE tarelka_users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

CREATE UNIQUE INDEX IF NOT EXISTS idx_tarelka_users_phone 
ON tarelka_users(phone) 
WHERE phone IS NOT NULL;
