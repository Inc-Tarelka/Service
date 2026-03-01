package repository

import (
	"context"
	"errors"
	"strconv"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5"
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
	// AddImages attaches images to an existing publication and returns created rows
	AddImages(ctx context.Context, pubID int64, authorID int64, imgs []model.PublicationImage) ([]model.PublicationImage, error)
	// Search publications with optional filters
	Search(ctx context.Context, f model.PublicationSearchFilters, limit, offset int) ([]model.Publication, error)
	// SearchNeeds returns needs filtered by optional criteria
	SearchNeeds(ctx context.Context, f model.NeedSearchFilters, limit, offset int) ([]model.NeedSearchItem, error)
	// GetByID returns a single publication by id with details
	GetByID(ctx context.Context, id int64) (*model.Publication, error)
}

type publicationRepository struct {
	pool *pgxpool.Pool
}

func NewPublicationRepository(pool *pgxpool.Pool) PublicationRepository {
	return &publicationRepository{pool: pool}
}

// GetByID returns a single publication by id with aggregated likes/comments and top image.
func (r *publicationRepository) GetByID(ctx context.Context, id int64) (*model.Publication, error) {
	row := r.pool.QueryRow(ctx, `
		SELECT 
			p.id,
			p.author_id,
			tp.name,
			tp.surname,
			p.name,
			p.description,
			p.type,
			p.city_id,
			COALESCE(lc.cnt, 0) AS likes_count,
			COALESCE(cc.cnt, 0) AS comments_count,
			ti.url AS top_image_url,
			u.telegram_url AS author_telegram_url,
			p.created_at
		FROM publications p
		JOIN tarelka_users u ON u.id = p.author_id
		LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::BIGINT AS cnt FROM publication_likes pl WHERE pl.publication_id = p.id
		) lc ON TRUE
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::BIGINT AS cnt FROM publication_comments pc WHERE pc.publication_id = p.id
		) cc ON TRUE
		LEFT JOIN LATERAL (
			SELECT url FROM publication_images pi WHERE pi.publication_id = p.id AND pi.position = 1 ORDER BY pi.id ASC LIMIT 1
		) ti ON TRUE
		WHERE p.id = $1
	`, id)

	var p model.Publication
	var topImageURL *string
	var authorTelegramURL *string

	if err := row.Scan(
		&p.ID,
		&p.AuthorID,
		&p.AuthorFirstName,
		&p.AuthorLastName,
		&p.Name,
		&p.Description,
		&p.Type,
		&p.CityID,
		&p.LikesCount,
		&p.CommentsCount,
		&topImageURL,
		&authorTelegramURL,
		&p.CreatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrPublicationNotFound
		}
		return nil, err
	}

	p.TopImageURL = topImageURL
	p.AuthorTelegramURL = authorTelegramURL
	return &p, nil
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

func (r *publicationRepository) AddImages(ctx context.Context, pubID int64, authorID int64, imgs []model.PublicationImage) ([]model.PublicationImage, error) {
	if len(imgs) == 0 {
		return []model.PublicationImage{}, nil
	}
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	// verify publication exists and owned by author
	var exists bool
	if err := tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM publications WHERE id = $1 AND author_id = $2)`, pubID, authorID).Scan(&exists); err != nil {
		return nil, err
	}
	if !exists {
		return nil, ErrPublicationNotFound
	}

	// insert each image and return with IDs
	out := make([]model.PublicationImage, 0, len(imgs))
	for _, img := range imgs {
		var id int64
		var pos *int = img.Position
		if err := tx.QueryRow(ctx,
			`INSERT INTO publication_images (publication_id, url, position) VALUES ($1, $2, $3) RETURNING id`,
			pubID, img.URL, pos,
		).Scan(&id); err != nil {
			return nil, err
		}
		out = append(out, model.PublicationImage{ID: id, URL: img.URL, Position: pos})
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, err
	}
	return out, nil
}

// Search returns publications filtered by optional criteria.
func (r *publicationRepository) Search(ctx context.Context, f model.PublicationSearchFilters, limit, offset int) ([]model.Publication, error) {
	// Build dynamic query
	base := `
		SELECT 
			p.id,
			p.author_id,
			p.name,
			p.description,
			p.type,
			p.city_id,
			COALESCE(lc.cnt, 0) AS likes_count,
			COALESCE(cc.cnt, 0) AS comments_count,
			ti.url AS top_image_url,
			u.telegram_url AS author_telegram_url,
			p.created_at
		FROM publications p
		JOIN tarelka_users u ON u.id = p.author_id
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::BIGINT AS cnt FROM publication_likes pl WHERE pl.publication_id = p.id
		) lc ON TRUE
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::BIGINT AS cnt FROM publication_comments pc WHERE pc.publication_id = p.id
		) cc ON TRUE
		LEFT JOIN LATERAL (
			SELECT url FROM publication_images pi WHERE pi.publication_id = p.id AND pi.position = 1 ORDER BY pi.id ASC LIMIT 1
		) ti ON TRUE
		WHERE 1=1`

	args := []interface{}{}
	idx := 1

	if f.Type != nil {
		base += " AND p.type = $" + strconv.Itoa(idx)
		args = append(args, *f.Type)
		idx++
	}
	if f.CityID != nil {
		base += " AND p.city_id = $" + strconv.Itoa(idx)
		args = append(args, *f.CityID)
		idx++
	}
	if f.Name != nil {
		base += " AND p.name ILIKE $" + strconv.Itoa(idx)
		args = append(args, "%"+*f.Name+"%")
		idx++
	}
	if f.WorkingStatus != nil {
		base += " AND u.find_work = $" + strconv.Itoa(idx)
		args = append(args, *f.WorkingStatus)
		idx++
	}
	if f.SpecializationID != nil {
		base += " AND EXISTS (SELECT 1 FROM user_specializations us WHERE us.tarelka_user_id = u.id AND us.specialization_id = $" + strconv.Itoa(idx) + ")"
		args = append(args, *f.SpecializationID)
		idx++
	}
	if len(f.TagIDs) > 0 {
		base += " AND EXISTS (SELECT 1 FROM publication_tag_links ptl WHERE ptl.publication_id = p.id AND ptl.tag_id = ANY($" + strconv.Itoa(idx) + "))"
		args = append(args, f.TagIDs)
		idx++
	}

	base += " ORDER BY p.created_at DESC LIMIT $" + strconv.Itoa(idx) + " OFFSET $" + strconv.Itoa(idx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, base, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]model.Publication, 0)
	for rows.Next() {
		var p model.Publication
		var topImageURL *string
		var authorTelegramURL *string
		if err := rows.Scan(
			&p.ID,
			&p.AuthorID,
			&p.Name,
			&p.Description,
			&p.Type,
			&p.CityID,
			&p.LikesCount,
			&p.CommentsCount,
			&topImageURL,
			&authorTelegramURL,
			&p.CreatedAt,
		); err != nil {
			return nil, err
		}
		p.TopImageURL = topImageURL
		p.AuthorTelegramURL = authorTelegramURL
		out = append(out, p)
	}
	return out, nil
}

// SearchNeeds returns needs filtered by optional criteria and enriched with publication and city names
func (r *publicationRepository) SearchNeeds(ctx context.Context, f model.NeedSearchFilters, limit, offset int) ([]model.NeedSearchItem, error) {
	base := `
		SELECT 
			n.id,
			n.name,
			n.description,
			p.name AS publication_name,
			p.description AS publication_description,
			c.name AS city_name
		FROM needs n
		JOIN publications p ON p.id = n.publication_id
		-- Return city name from need.city_id if present, otherwise fallback to publication.city_id
		LEFT JOIN cities c ON c.id = COALESCE(n.city_id, p.city_id)
		WHERE 1=1`

	args := []interface{}{}
	idx := 1

	if f.CityID != nil {
		base += " AND n.city_id = $" + strconv.Itoa(idx)
		args = append(args, *f.CityID)
		idx++
	}
	if f.Name != nil {
		base += " AND n.name ILIKE $" + strconv.Itoa(idx)
		args = append(args, "%"+*f.Name+"%")
		idx++
	}
	if len(f.PublicationTagIDs) > 0 {
		base += " AND EXISTS (SELECT 1 FROM publication_tag_links ptl WHERE ptl.publication_id = n.publication_id AND ptl.tag_id = ANY($" + strconv.Itoa(idx) + "))"
		args = append(args, f.PublicationTagIDs)
		idx++
	}
	if len(f.NeedTagIDs) > 0 {
		base += " AND EXISTS (SELECT 1 FROM need_tag_links ntl WHERE ntl.need_id = n.id AND ntl.tag_id = ANY($" + strconv.Itoa(idx) + "))"
		args = append(args, f.NeedTagIDs)
		idx++
	}
	if f.Date != nil {
		base += " AND (n.deadline_start IS NULL OR n.deadline_start <= $" + strconv.Itoa(idx) + ") AND (n.deadline_end IS NULL OR n.deadline_end >= $" + strconv.Itoa(idx) + ")"
		args = append(args, *f.Date)
		idx++
	}
	if f.BudgetMax != nil {
		base += " AND n.budget <= $" + strconv.Itoa(idx)
		args = append(args, *f.BudgetMax)
		idx++
	}

	base += " ORDER BY p.created_at DESC, n.id DESC LIMIT $" + strconv.Itoa(idx) + " OFFSET $" + strconv.Itoa(idx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, base, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]model.NeedSearchItem, 0)
	for rows.Next() {
		var item model.NeedSearchItem
		var cityName *string
		if err := rows.Scan(&item.ID, &item.Name, &item.Description, &item.PublicationName, &item.PublicationDescription, &cityName); err != nil {
			return nil, err
		}
		item.CityName = cityName
		out = append(out, item)
	}
	return out, nil
}

// no-op
