package repository

import (
	"context"
	"errors"
	"fmt"
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
	AddComment(ctx context.Context, pubID int64, authorID int64, content string, parentCommentID *int64) (*model.Comment, error)
	GetServiceComments(ctx context.Context, pubID int64, limit, offset int) (int64, []model.PublicationCommentItem, error)
	// ToggleLike ставит лайк, если его нет, и убирает, если он уже есть; возвращает итоговое состояние isLiked
	ToggleLike(ctx context.Context, pubID int64, authorID int64) (bool, error)
	// AddImages attaches images to an existing publication and returns created rows
	AddImages(ctx context.Context, pubID int64, authorID int64, imgs []model.PublicationImage) ([]model.PublicationImage, error)
	// Search publications with optional filters; userID используется для вычисления поля IsLiked
	Search(ctx context.Context, f model.PublicationSearchFilters, limit, offset int, userID *int64) ([]model.Publication, error)
	// SearchNeeds returns needs filtered by optional criteria
	SearchNeeds(ctx context.Context, f model.NeedSearchFilters, limit, offset int) ([]model.NeedSearchItem, error)
	// GetNeedByID returns single need with tags by id
	GetNeedByID(ctx context.Context, id int64) (*model.Need, error)
	// GetByID returns a single publication by id with details; userID используется для вычисления поля IsLiked
	GetByID(ctx context.Context, id int64, userID *int64) (*model.Publication, []model.PublicationTeamMember, []model.Need, error)
	// GetUserPublications возвращает все публикации, в которых пользователь является автором или соавтором,
	// отсортированные по дате создания (сначала новые).
	GetUserPublications(ctx context.Context, userID int64) ([]model.UserPublicationShort, error)
	// GetUserProjectsCount возвращает число проектов (type = 'PROJECT'), где пользователь автор или соавтор.
	GetUserProjectsCount(ctx context.Context, userID int64) (int64, error)
}

type publicationRepository struct {
	pool *pgxpool.Pool
}

func NewPublicationRepository(pool *pgxpool.Pool) PublicationRepository {
	return &publicationRepository{pool: pool}
}

// GetUserPublications возвращает все публикации пользователя (как автора и соавтора)
// вместе с числом лайков и URL изображения с приоритетом 0.
func (r *publicationRepository) GetUserPublications(ctx context.Context, userID int64) ([]model.UserPublicationShort, error) {
	query := `
		WITH user_publications AS (
			SELECT p.id, p.type, p.created_at, TRUE AS is_author
			FROM publications p
			WHERE p.author_id = $1
			UNION ALL
			SELECT p.id, p.type, p.created_at, FALSE AS is_author
			FROM publication_co_authors ca
			JOIN publications p ON p.id = ca.publication_id
			WHERE ca.user_id = $1
		)
		SELECT
			up.id,
			up.type,
			COALESCE(lc.cnt, 0) AS likes_count,
			ti.url AS image_url,
			up.is_author,
			up.created_at
		FROM user_publications up
		LEFT JOIN LATERAL (
			SELECT COUNT(*)::BIGINT AS cnt
			FROM publication_likes pl
			WHERE pl.publication_id = up.id
		) lc ON TRUE
		LEFT JOIN LATERAL (
			SELECT url
			FROM publication_images pi
			WHERE pi.publication_id = up.id AND pi.position = 0
			ORDER BY pi.id
			LIMIT 1
		) ti ON TRUE
		ORDER BY up.created_at DESC, up.id DESC
	`

	rows, err := r.pool.Query(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	res := make([]model.UserPublicationShort, 0)
	for rows.Next() {
		var item model.UserPublicationShort
		if err := rows.Scan(&item.ID, &item.Type, &item.LikesCount, &item.ImageURL, &item.IsAuthor, &item.CreatedAt); err != nil {
			return nil, err
		}
		res = append(res, item)
	}
	return res, rows.Err()
}

// GetUserProjectsCount возвращает число уникальных проектов (PROJECT),
// где пользователь является автором или соавтором.
func (r *publicationRepository) GetUserProjectsCount(ctx context.Context, userID int64) (int64, error) {
	query := `
		SELECT COUNT(DISTINCT p.id)
		FROM publications p
		LEFT JOIN publication_co_authors ca ON ca.publication_id = p.id
		WHERE p.type = 'PROJECT' AND (p.author_id = $1 OR ca.user_id = $1)
	`
	var count int64
	if err := r.pool.QueryRow(ctx, query, userID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

// GetByID returns a single publication by id with aggregated likes/comments and top image.
// Если userID не nil, дополнительно рассчитывается IsLiked для текущего пользователя.
func (r *publicationRepository) GetByID(ctx context.Context, id int64, userID *int64) (*model.Publication, []model.PublicationTeamMember, []model.Need, error) {
	var row pgx.Row
	if userID != nil {
		row = r.pool.QueryRow(ctx, `
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
				p.created_at,
				COALESCE(ul.is_liked, FALSE) AS is_liked
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
			LEFT JOIN LATERAL (
				SELECT TRUE AS is_liked
				FROM publication_likes pl
				WHERE pl.publication_id = p.id AND pl.author_id = $2
				LIMIT 1
			) ul ON TRUE
			WHERE p.id = $1`, id, *userID)
	} else {
		// Если пользователь не передан, считаем, что лайк не поставлен
		row = r.pool.QueryRow(ctx, `
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
				p.created_at,
				FALSE AS is_liked
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
			WHERE p.id = $1`, id)
	}

	var p model.Publication
	var topImageURL *string
	var authorTelegramURL *string
	var isLiked bool

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
		&isLiked,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil, nil, ErrPublicationNotFound
		}
		return nil, nil, nil, err
	}

	p.TopImageURL = topImageURL
	p.AuthorTelegramURL = authorTelegramURL
	p.IsLiked = isLiked

	// Load team: author + co-authors with specialization and city
	team := make([]model.PublicationTeamMember, 0)

	teamRows, err := r.pool.Query(ctx, `
		WITH author AS (
			SELECT 
				u.id AS user_id,
				tp.name,
				tp.surname,
				u.logo_url,
				(
					SELECT s.name
					FROM user_specializations us
					JOIN specializations s ON s.id = us.specialization_id
					WHERE us.tarelka_user_id = u.id
					ORDER BY us.specialization_id
					LIMIT 1
				) AS specialization,
				(
					SELECT c.name
					FROM user_cities uc
					JOIN cities c ON c.id = uc.city_id
					WHERE uc.tarelka_user_id = u.id
					ORDER BY uc.city_id
					LIMIT 1
				) AS city_name,
				TRUE AS is_author
			FROM publications p
			JOIN tarelka_users u ON u.id = p.author_id
			LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
			WHERE p.id = $1
		),
		coauthors AS (
			SELECT 
				u.id AS user_id,
				tp.name,
				tp.surname,
				u.logo_url,
				(
					SELECT s.name
					FROM user_specializations us
					JOIN specializations s ON s.id = us.specialization_id
					WHERE us.tarelka_user_id = u.id
					ORDER BY us.specialization_id
					LIMIT 1
				) AS specialization,
				(
					SELECT c.name
					FROM user_cities uc
					JOIN cities c ON c.id = uc.city_id
					WHERE uc.tarelka_user_id = u.id
					ORDER BY uc.city_id
					LIMIT 1
				) AS city_name,
				FALSE AS is_author
			FROM publication_co_authors pca
			JOIN tarelka_users u ON u.id = pca.user_id
			LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
			WHERE pca.publication_id = $1
		)
		SELECT * FROM author
		UNION ALL
		SELECT * FROM coauthors
	`, id)
	if err != nil {
		return nil, nil, nil, err
	}
	defer teamRows.Close()

	for teamRows.Next() {
		var m model.PublicationTeamMember
		var avatarURL *string
		var spec *string
		var cityName *string
		if err := teamRows.Scan(&m.UserID, &m.FirstName, &m.LastName, &avatarURL, &spec, &cityName, &m.IsAuthor); err != nil {
			return nil, nil, nil, err
		}
		m.AvatarURL = avatarURL
		m.Specialization = spec
		m.CityName = cityName
		team = append(team, m)
	}

	// Load needs for this publication
	needRows, err := r.pool.Query(ctx, `
		SELECT id, publication_id, name, description, budget, deadline_start, deadline_end, city_id
		FROM needs
		WHERE publication_id = $1
		ORDER BY id
	`, id)
	if err != nil {
		return nil, nil, nil, err
	}
	defer needRows.Close()

	needs := make([]model.Need, 0)
	for needRows.Next() {
		var n model.Need
		if err := needRows.Scan(
			&n.ID,
			&n.PublicationID,
			&n.Name,
			&n.Description,
			&n.Budget,
			&n.DeadlineStart,
			&n.DeadlineEnd,
			&n.CityID,
		); err != nil {
			return nil, nil, nil, err
		}
		needs = append(needs, n)
	}

	// Load publication images
	imgRows, err := r.pool.Query(ctx, `
		SELECT id, url, position
		FROM publication_images
		WHERE publication_id = $1
		ORDER BY COALESCE(position, 0), id
	`, id)
	if err != nil {
		return nil, nil, nil, err
	}
	defer imgRows.Close()

	images := make([]model.PublicationImage, 0)
	for imgRows.Next() {
		var img model.PublicationImage
		if err := imgRows.Scan(&img.ID, &img.URL, &img.Position); err != nil {
			return nil, nil, nil, err
		}
		images = append(images, img)
	}
	if imgRows.Err() != nil {
		return nil, nil, nil, imgRows.Err()
	}
	p.Images = images

	// Load publication tags
	tagRows, err := r.pool.Query(ctx, `
		SELECT t.id, t.name
		FROM publication_tag_links l
		JOIN publication_tags t ON t.id = l.tag_id
		WHERE l.publication_id = $1
		ORDER BY t.name
	`, id)
	if err != nil {
		return nil, nil, nil, err
	}
	defer tagRows.Close()

	tags := make([]model.PublicationTag, 0)
	for tagRows.Next() {
		var t model.PublicationTag
		if err := tagRows.Scan(&t.ID, &t.Name); err != nil {
			return nil, nil, nil, err
		}
		tags = append(tags, t)
	}
	if tagRows.Err() != nil {
		return nil, nil, nil, tagRows.Err()
	}
	p.Tags = tags

	return &p, team, needs, nil
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

func (r *publicationRepository) AddComment(ctx context.Context, pubID int64, authorID int64, content string, parentCommentID *int64) (*model.Comment, error) {
	var c model.Comment
	err := r.pool.QueryRow(ctx,
		`INSERT INTO publication_comments (publication_id, author_id, content, parent_comment_id)
	         VALUES ($1, $2, $3, $4)
	         RETURNING id, content, author_id, created_at`,
		pubID, authorID, content, parentCommentID,
	).Scan(&c.ID, &c.Content, &c.AuthorID, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// ToggleLike ставит лайк, если его нет, и убирает, если он уже есть.
// Возвращает итоговое состояние isLiked (true, если лайк установлен после операции).
func (r *publicationRepository) ToggleLike(ctx context.Context, pubID int64, authorID int64) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	var exists bool
	if err := tx.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM publication_likes WHERE publication_id = $1 AND author_id = $2)`,
		pubID, authorID,
	).Scan(&exists); err != nil {
		return false, err
	}

	if exists {
		if _, err := tx.Exec(ctx,
			`DELETE FROM publication_likes WHERE publication_id = $1 AND author_id = $2`,
			pubID, authorID,
		); err != nil {
			return false, err
		}
		if err := tx.Commit(ctx); err != nil {
			return false, err
		}
		return false, nil
	}

	if _, err := tx.Exec(ctx,
		`INSERT INTO publication_likes (publication_id, author_id) VALUES ($1, $2)`,
		pubID, authorID,
	); err != nil {
		return false, err
	}
	if err := tx.Commit(ctx); err != nil {
		return false, err
	}
	return true, nil
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

// GetServiceComments возвращает список комментариев услуги (включая ответы на комментарии, относящиеся к этой услуге)
// Отсортированы по дате создания (новые сначала).
func (r *publicationRepository) GetServiceComments(ctx context.Context, pubID int64, limit, offset int) (int64, []model.PublicationCommentItem, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	rows, err := r.pool.Query(ctx, `
		SELECT
			pc.id,
			pc.author_id,
			pc.content,
			pc.created_at,
			pc.parent_comment_id,
			tp.name AS author_first_name,
			tp.surname AS author_last_name,
			tc.company_name AS author_org_name,
			COUNT(*) OVER() AS total_count
		FROM publication_comments pc
		JOIN tarelka_users u ON u.id = pc.author_id
		LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		LEFT JOIN tarelka_companies tc ON tc.tarelka_user_id = u.id
		WHERE pc.publication_id = $1
		ORDER BY pc.created_at DESC
		LIMIT $2 OFFSET $3
	`, pubID, limit, offset)
	if err != nil {
		return 0, nil, err
	}
	defer rows.Close()

	var (
		items []model.PublicationCommentItem
		total int64
	)

	for rows.Next() {
		var item model.PublicationCommentItem
		var firstName, lastName, orgName *string
		var parentID *int64
		if err := rows.Scan(
			&item.ID,
			&item.AuthorID,
			&item.Content,
			&item.CreatedAt,
			&parentID,
			&firstName,
			&lastName,
			&orgName,
			&total,
		); err != nil {
			return 0, nil, err
		}
		item.ParentCommentID = parentID
		item.AuthorFirstName = firstName
		item.AuthorLastName = lastName
		item.AuthorOrgName = orgName
		items = append(items, item)
	}

	if rows.Err() != nil {
		return 0, nil, rows.Err()
	}

	return total, items, nil
}

// Search returns publications filtered by optional criteria.
func (r *publicationRepository) Search(ctx context.Context, f model.PublicationSearchFilters, limit, offset int, userID *int64) ([]model.Publication, error) {
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
			p.created_at,
			COALESCE(ul.is_liked, FALSE) AS is_liked
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
		LEFT JOIN LATERAL (
			SELECT TRUE AS is_liked
			FROM publication_likes pl
			WHERE pl.publication_id = p.id AND pl.author_id = $1
			LIMIT 1
		) ul ON TRUE
		WHERE 1=1`

	args := []interface{}{}
	idx := 1

	if userID != nil {
		args = append(args, *userID)
		idx++
	} else {
		// Если userID не передан, заполним плейсхолдер фиктивным значением и не будем использовать его в фильтрах
		args = append(args, int64(0))
		idx++
	}

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
		var isLiked bool
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
			&isLiked,
		); err != nil {
			return nil, err
		}
		p.TopImageURL = topImageURL
		p.AuthorTelegramURL = authorTelegramURL
		p.IsLiked = isLiked
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

// GetNeedByID returns single need with its tags by id
func (r *publicationRepository) GetNeedByID(ctx context.Context, id int64) (*model.Need, error) {
	var n model.Need
	row := r.pool.QueryRow(ctx, `
		SELECT id, publication_id, name, description, budget, deadline_start, deadline_end, city_id
		FROM needs
		WHERE id = $1
	`, id)
	if err := row.Scan(
		&n.ID,
		&n.PublicationID,
		&n.Name,
		&n.Description,
		&n.Budget,
		&n.DeadlineStart,
		&n.DeadlineEnd,
		&n.CityID,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("need not found")
		}
		return nil, err
	}

	rows, err := r.pool.Query(ctx, `
		SELECT t.id, t.name
		FROM need_tag_links l
		JOIN need_tags t ON t.id = l.tag_id
		WHERE l.need_id = $1
		ORDER BY t.name
	`, id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tags := make([]model.NeedTag, 0)
	for rows.Next() {
		var t model.NeedTag
		if err := rows.Scan(&t.ID, &t.Name); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	if rows.Err() != nil {
		return nil, rows.Err()
	}

	n.Tags = tags
	return &n, nil
}
