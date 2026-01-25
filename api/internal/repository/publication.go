package repository

import (
	"context"
	"errors"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrPublicationNotFound = errors.New("publication not found")
)

type PublicationRepository interface {
	Create(ctx context.Context, authorID int64, req model.CreateOrUpdatePublicationRequest) (int64, error)
	Update(ctx context.Context, pubID int64, authorID int64, req model.CreateOrUpdatePublicationRequest) error
	AddComment(ctx context.Context, pubID int64, authorID int64, content string) (*model.Comment, error)
	AddLike(ctx context.Context, pubID int64, authorID int64) error
}

type publicationRepository struct {
	pool *pgxpool.Pool
}

func NewPublicationRepository(pool *pgxpool.Pool) PublicationRepository {
	return &publicationRepository{pool: pool}
}

func (r *publicationRepository) Create(ctx context.Context, authorID int64, req model.CreateOrUpdatePublicationRequest) (int64, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return 0, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var pubID int64
	err = tx.QueryRow(ctx,
		`INSERT INTO publications (author_id, name, description, type, city_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
		authorID, req.Name, req.Description, req.Type, req.CityID,
	).Scan(&pubID)
	if err != nil {
		return 0, err
	}

	// images
	for i, url := range req.ImageURLs {
		var pos *int
		p := i
		pos = &p
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_images (publication_id, url, position) VALUES ($1, $2, $3)`,
			pubID, url, pos,
		); err != nil {
			return 0, err
		}
	}

	// tags
	for _, tagID := range req.TagIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_tag_links (publication_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			pubID, tagID,
		); err != nil {
			return 0, err
		}
	}

	// co-authors
	for _, uid := range req.CoAuthorIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_co_authors (publication_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			pubID, uid,
		); err != nil {
			return 0, err
		}
	}

	// needs
	for _, n := range req.Needs {
		var ds, de *time.Time
		if n.DeadlineStart != nil {
			if t, err := time.Parse(time.RFC3339, *n.DeadlineStart); err == nil {
				ds = &t
			} else {
				return 0, err
			}
		}
		if n.DeadlineEnd != nil {
			if t, err := time.Parse(time.RFC3339, *n.DeadlineEnd); err == nil {
				de = &t
			} else {
				return 0, err
			}
		}
		var needID int64
		err := tx.QueryRow(ctx,
			`INSERT INTO needs (publication_id, name, description, budget, deadline_start, deadline_end, city_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
			pubID, n.Name, n.Description, n.Budget, ds, de, n.CityID,
		).Scan(&needID)
		if err != nil {
			return 0, err
		}
		for _, tagID := range n.TagIDs {
			if _, err := tx.Exec(ctx,
				`INSERT INTO need_tag_links (need_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
				needID, tagID,
			); err != nil {
				return 0, err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return 0, err
	}
	return pubID, nil
}

func (r *publicationRepository) Update(ctx context.Context, pubID int64, authorID int64, req model.CreateOrUpdatePublicationRequest) error {
	// enforce author ownership at DB level (optional: check in service)
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// verify publication exists and author
	var exists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM publications WHERE id = $1 AND author_id = $2)`, pubID, authorID).Scan(&exists); err != nil {
		return err
	}
	if !exists {
		return ErrPublicationNotFound
	}

	// update main
	if _, err := tx.Exec(ctx,
		`UPDATE publications SET name = $1, description = $2, type = $3, city_id = $4 WHERE id = $5`,
		req.Name, req.Description, req.Type, req.CityID, pubID,
	); err != nil {
		return err
	}

	// rebuild images
	if _, err := tx.Exec(ctx, `DELETE FROM publication_images WHERE publication_id = $1`, pubID); err != nil {
		return err
	}
	for i, url := range req.ImageURLs {
		var pos *int
		p := i
		pos = &p
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_images (publication_id, url, position) VALUES ($1, $2, $3)`,
			pubID, url, pos,
		); err != nil {
			return err
		}
	}

	// rebuild tag links
	if _, err := tx.Exec(ctx, `DELETE FROM publication_tag_links WHERE publication_id = $1`, pubID); err != nil {
		return err
	}
	for _, tagID := range req.TagIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_tag_links (publication_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			pubID, tagID,
		); err != nil {
			return err
		}
	}

	// rebuild co-authors
	if _, err := tx.Exec(ctx, `DELETE FROM publication_co_authors WHERE publication_id = $1`, pubID); err != nil {
		return err
	}
	for _, uid := range req.CoAuthorIDs {
		if _, err := tx.Exec(ctx,
			`INSERT INTO publication_co_authors (publication_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			pubID, uid,
		); err != nil {
			return err
		}
	}

	// rebuild needs: for базовая логика — удалить и создать заново
	if _, err := tx.Exec(ctx, `DELETE FROM need_tag_links WHERE need_id IN (SELECT id FROM needs WHERE publication_id = $1)`, pubID); err != nil {
		return err
	}
	if _, err := tx.Exec(ctx, `DELETE FROM needs WHERE publication_id = $1`, pubID); err != nil {
		return err
	}
	for _, n := range req.Needs {
		var ds, de *time.Time
		if n.DeadlineStart != nil {
			if t, err := time.Parse(time.RFC3339, *n.DeadlineStart); err == nil {
				ds = &t
			} else {
				return err
			}
		}
		if n.DeadlineEnd != nil {
			if t, err := time.Parse(time.RFC3339, *n.DeadlineEnd); err == nil {
				de = &t
			} else {
				return err
			}
		}
		var needID int64
		err := tx.QueryRow(ctx,
			`INSERT INTO needs (publication_id, name, description, budget, deadline_start, deadline_end, city_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id`,
			pubID, n.Name, n.Description, n.Budget, ds, de, n.CityID,
		).Scan(&needID)
		if err != nil {
			return err
		}
		for _, tagID := range n.TagIDs {
			if _, err := tx.Exec(ctx,
				`INSERT INTO need_tag_links (need_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
				needID, tagID,
			); err != nil {
				return err
			}
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

func (r *publicationRepository) AddComment(ctx context.Context, pubID int64, authorID int64, content string) (*model.Comment, error) {
	var c model.Comment
	err := r.pool.QueryRow(ctx,
		`INSERT INTO publication_comments (publication_id, author_id, content)
         VALUES ($1, $2, $3)
         RETURNING id, content, author_id, created_at`,
		pubID, authorID, content,
	).Scan(&c.ID, &c.Content, &c.AuthorID, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *publicationRepository) AddLike(ctx context.Context, pubID int64, authorID int64) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO publication_likes (publication_id, author_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		pubID, authorID,
	)
	return err
}
