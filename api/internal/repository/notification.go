package repository

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type NotificationRepository interface {
	Create(ctx context.Context, n *model.Notification) (*model.Notification, error)
	ListByReceiverAndType(ctx context.Context, receiverID int64, nType model.NotificationType, limit, offset int) ([]*model.Notification, error)
	// CountUnreadByReceiver возвращает число непрочитанных уведомлений для получателя.
	CountUnreadByReceiver(ctx context.Context, receiverID int64) (int64, error)
	// GetByID возвращает уведомление по id.
	GetByID(ctx context.Context, id int64) (*model.Notification, error)
	// SetApproval устанавливает флаг is_approve для уведомления (обычно типа TeamInvite)
	// и помечает его как прочитанное.
	SetApproval(ctx context.Context, id int64, receiverID int64, isApprove bool) (*model.Notification, error)
}

type notificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) NotificationRepository {
	return &notificationRepository{pool: pool}
}

func (r *notificationRepository) Create(ctx context.Context, n *model.Notification) (*model.Notification, error) {
	query := `
		INSERT INTO notifications (type, publication_id, creator_id, receiver_id, message, need_id, is_read, is_approve)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve
	`

	err := r.pool.QueryRow(ctx, query,
		n.Type,
		n.PublicationID,
		n.CreatorID,
		n.ReceiverID,
		n.Message,
		n.NeedID,
		n.IsRead,
		n.IsApprove,
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
		&n.IsApprove,
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
		SELECT id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve
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
			&n.IsApprove,
		); err != nil {
			return nil, err
		}
		res = append(res, &n)
	}

	return res, rows.Err()
}

func (r *notificationRepository) CountUnreadByReceiver(ctx context.Context, receiverID int64) (int64, error) {
	query := `
		SELECT COUNT(*)
		FROM notifications
		WHERE receiver_id = $1 AND is_read = FALSE
	`
	var count int64
	if err := r.pool.QueryRow(ctx, query, receiverID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (r *notificationRepository) GetByID(ctx context.Context, id int64) (*model.Notification, error) {
	query := `
		SELECT id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve
		FROM notifications
		WHERE id = $1
	`
	var n model.Notification
	if err := r.pool.QueryRow(ctx, query, id).Scan(
		&n.ID,
		&n.Type,
		&n.PublicationID,
		&n.CreatedAt,
		&n.CreatorID,
		&n.ReceiverID,
		&n.Message,
		&n.NeedID,
		&n.IsRead,
		&n.IsApprove,
	); err != nil {
		return nil, err
	}
	return &n, nil
}

func (r *notificationRepository) SetApproval(ctx context.Context, id int64, receiverID int64, isApprove bool) (*model.Notification, error) {
	query := `
		UPDATE notifications
		SET is_approve = $3, is_read = TRUE
		WHERE id = $1 AND receiver_id = $2
		RETURNING id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve
	`
	var n model.Notification
	if err := r.pool.QueryRow(ctx, query, id, receiverID, isApprove).Scan(
		&n.ID,
		&n.Type,
		&n.PublicationID,
		&n.CreatedAt,
		&n.CreatorID,
		&n.ReceiverID,
		&n.Message,
		&n.NeedID,
		&n.IsRead,
		&n.IsApprove,
	); err != nil {
		return nil, err
	}
	return &n, nil
}
