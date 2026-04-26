-- +migrate Up

-- Enum for publication type
-- +migrate StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_type_enum') THEN
        CREATE TYPE publication_type_enum AS ENUM ('PROJECT', 'SERVICE');
    END IF;
END $$;
-- +migrate StatementEnd

-- Publications main table
CREATE TABLE IF NOT EXISTS publications (
    id BIGSERIAL PRIMARY KEY,
    author_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type publication_type_enum NOT NULL,
    city_id BIGINT REFERENCES cities(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_publications_author ON publications(author_id);
CREATE INDEX IF NOT EXISTS idx_publications_city ON publications(city_id);
CREATE INDEX IF NOT EXISTS idx_publications_type ON publications(type);
CREATE INDEX IF NOT EXISTS idx_publications_created_at ON publications(created_at DESC);

-- Images for publications
CREATE TABLE IF NOT EXISTS publication_images (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    position INT
);
CREATE INDEX IF NOT EXISTS idx_publication_images_pub ON publication_images(publication_id);
-- Optional unique on position per publication
-- CREATE UNIQUE INDEX IF NOT EXISTS uq_publication_images_position ON publication_images(publication_id, position) WHERE position IS NOT NULL;

-- Tags dictionary for publications
CREATE TABLE IF NOT EXISTS publication_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Link publication ↔ tag
CREATE TABLE IF NOT EXISTS publication_tag_links (
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES publication_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, tag_id)
);

-- Co-authors
CREATE TABLE IF NOT EXISTS publication_co_authors (
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    PRIMARY KEY (publication_id, user_id)
);

-- Needs table
CREATE TABLE IF NOT EXISTS needs (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    budget BIGINT,
    deadline_start TIMESTAMP WITH TIME ZONE,
    deadline_end TIMESTAMP WITH TIME ZONE,
    city_id BIGINT REFERENCES cities(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_needs_pub ON needs(publication_id);

-- Need tags dictionary
CREATE TABLE IF NOT EXISTS need_tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Link need ↔ tag
CREATE TABLE IF NOT EXISTS need_tag_links (
    need_id BIGINT NOT NULL REFERENCES needs(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES need_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (need_id, tag_id)
);

-- Likes
CREATE TABLE IF NOT EXISTS publication_likes (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_publication_like_unique ON publication_likes(publication_id, author_id);
CREATE INDEX IF NOT EXISTS idx_publication_likes_pub ON publication_likes(publication_id);

-- Comments
CREATE TABLE IF NOT EXISTS publication_comments (
    id BIGSERIAL PRIMARY KEY,
    publication_id BIGINT NOT NULL REFERENCES publications(id) ON DELETE CASCADE,
    author_id BIGINT NOT NULL REFERENCES tarelka_users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_publication_comments_pub ON publication_comments(publication_id);
CREATE INDEX IF NOT EXISTS idx_publication_comments_created ON publication_comments(created_at DESC);

-- +migrate Down
DROP TABLE IF EXISTS publication_comments;
DROP INDEX IF EXISTS idx_publication_comments_created;
DROP INDEX IF EXISTS idx_publication_comments_pub;
DROP TABLE IF EXISTS publication_likes;
DROP INDEX IF EXISTS idx_publication_likes_pub;
DROP INDEX IF EXISTS uq_publication_like_unique;
DROP TABLE IF EXISTS need_tag_links;
DROP TABLE IF EXISTS need_tags;
DROP INDEX IF EXISTS idx_needs_pub;
DROP TABLE IF EXISTS needs;
DROP TABLE IF EXISTS publication_co_authors;
DROP TABLE IF EXISTS publication_tag_links;
DROP TABLE IF EXISTS publication_tags;
DROP INDEX IF EXISTS idx_publication_images_pub;
DROP TABLE IF EXISTS publication_images;
DROP INDEX IF EXISTS idx_publications_created_at;
DROP INDEX IF EXISTS idx_publications_type;
DROP INDEX IF EXISTS idx_publications_city;
DROP INDEX IF EXISTS idx_publications_author;
DROP TABLE IF EXISTS publications;
-- +migrate StatementBegin
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'publication_type_enum') THEN
        DROP TYPE publication_type_enum;
    END IF;
END $$;
-- +migrate StatementEnd
