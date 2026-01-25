-- +migrate Up
-- Add wallpaper_url, bio, education and find_work enum
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS wallpaper_url VARCHAR(2000);
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS education VARCHAR(255);

-- Create enum type for find_work if not exists (ASCII codes to avoid encoding issues)
-- +migrate StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'find_work_enum') THEN
        CREATE TYPE find_work_enum AS ENUM (
            'LOOKING',
            'NOT_LOOKING',
            'OPEN_TO_OFFERS'
        );
    END IF;
END $$;
-- +migrate StatementEnd

ALTER TABLE tarelka_users ADD COLUMN IF NOT EXISTS find_work find_work_enum;

-- +migrate Down
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS wallpaper_url;
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS bio;
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS education;
ALTER TABLE tarelka_users DROP COLUMN IF EXISTS find_work;

-- +migrate StatementBegin
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'find_work_enum') THEN
        DROP TYPE find_work_enum;
    END IF;
END $$;
-- +migrate StatementEnd
