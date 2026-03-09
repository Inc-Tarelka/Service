package repository

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationRepository interface {
	Create(ctx context.Context, n *model.Notification) (*model.Notification, error)
	ListByReceiverAndType(ctx context.Context, receiverID int64, nType model.NotificationType, limit, offset int) ([]*model.Notification, error)
}

type notificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) NotificationRepository {
	return &notificationRepository{pool: pool}
}

func (r *notificationRepository) Create(ctx context.Context, n *model.Notification) (*model.Notification, error) {
	query := `
		INSERT INTO notifications (type, publication_id, creator_id, receiver_id, message, need_id, is_read)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read
	`

	err := r.pool.QueryRow(ctx, query,
		n.Type,
		n.PublicationID,
		n.CreatorID,
		n.ReceiverID,
		n.Message,
		n.NeedID,
		n.IsRead,
	).Scan(
		&n.ID,
		&n.Type,
		&n.PublicationID,
		&n.CreatedAt,
		&n.CreatorID,
		&n.ReceiverID,
		&n.Message,
		&n.NeedID,
		&n.IsRead,
	)
	if err != nil {
		return nil, err
	}
	return n, nil
}

func (r *notificationRepository) ListByReceiverAndType(
	ctx context.Context,
	receiverID int64,
	nType model.NotificationType,
	limit, offset int,
) ([]*model.Notification, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	query := `
		SELECT id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read
		FROM notifications
		WHERE receiver_id = $1 AND type = $2
		ORDER BY created_at DESC
		LIMIT $3 OFFSET $4
	`

	rows, err := r.pool.Query(ctx, query, receiverID, nType, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*model.Notification
	for rows.Next() {
		var n model.Notification
		if err := rows.Scan(
			&n.ID,
			&n.Type,
			&n.PublicationID,
			&n.CreatedAt,
			&n.CreatorID,
			&n.ReceiverID,
			&n.Message,
			&n.NeedID,
			&n.IsRead,
		); err != nil {
			return nil, err
		}
		res = append(res, &n)
	}

	return res, rows.Err()
}
