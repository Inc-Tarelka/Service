package repository

import (
	"context"
	"errors"
	"strconv"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5"
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

	// ListIncoming возвращает входящие уведомления для пользователя (receiver).
	// Если nType == nil, возвращаются все типы.
	ListIncoming(ctx context.Context, receiverID int64, nType *model.NotificationType, limit, offset int) ([]*model.NotificationWithCreator, error)
	// ListOutgoing возвращает исходящие уведомления для пользователя (creator).
	// Если nType == nil, возвращаются все типы.
	ListOutgoing(ctx context.Context, creatorID int64, nType *model.NotificationType, limit, offset int) ([]*model.NotificationWithCreator, error)
	// GetByIDForReceiverAndMarkRead возвращает уведомление по id для конкретного получателя
	// и помечает его как прочитанное. Если уведомление не найдено или принадлежит другому
	// получателю, возвращается ошибка ErrNotificationNotFound.
	GetByIDForReceiverAndMarkRead(ctx context.Context, id int64, receiverID int64) (*model.NotificationWithCreator, error)

	// MarkAsDeleted помечает уведомление как удаленное (is_deleted = true)
	MarkAsDeleted(ctx context.Context, id int64, userID int64) error
	// ListNotifiedUsers возвращает список пользователей, которым отправлялись уведомления от creator.
	ListNotifiedUsers(ctx context.Context, creatorID int64, limit, offset int) ([]model.NotifiedUserItem, error)
}

// MarkAsDeleted помечает уведомление как удаленное (is_deleted = true) для receiver или creator
func (r *notificationRepository) MarkAsDeleted(ctx context.Context, id int64, userID int64) error {
	// Можно удалять только если пользователь — receiver или creator
	query := `UPDATE notifications SET is_deleted = TRUE WHERE id = $1 AND (receiver_id = $2 OR creator_id = $2)`
	res, err := r.pool.Exec(ctx, query, id, userID)
	if err != nil {
		return err
	}
	if res.RowsAffected() == 0 {
		return ErrNotificationNotFound
	}
	return nil
}

type notificationRepository struct {
	pool *pgxpool.Pool
}

// ErrNotificationNotFound возвращается, когда уведомление не найдено
// или не принадлежит указанному пользователю.
var ErrNotificationNotFound = errors.New("notification not found")

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

// ListNotifiedUsers возвращает уникальных получателей уведомлений от пользователя creatorID.
func (r *notificationRepository) ListNotifiedUsers(ctx context.Context, creatorID int64, limit, offset int) ([]model.NotifiedUserItem, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	query := `
		WITH receivers AS (
			SELECT DISTINCT ON (n.receiver_id)
				n.receiver_id,
				n.created_at
			FROM notifications n
			LEFT JOIN publications p ON p.id = n.publication_id
			WHERE n.creator_id = $1
			  AND n.is_deleted = FALSE
			  AND (
				n.publication_id IS NULL OR p.is_deleted = FALSE
			  )
			ORDER BY n.receiver_id, n.created_at DESC
		)
		SELECT
			u.id,
			COALESCE(
				NULLIF(TRIM(COALESCE(tp.name, '') || ' ' || COALESCE(tp.surname, '')), ''),
				tc.company_name,
				u.username
			) AS display_name,
			u.username,
			u.type,
			u.logo_url,
			u.telegram_url
		FROM receivers r
		JOIN tarelka_users u ON u.id = r.receiver_id
		LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		LEFT JOIN tarelka_companies tc ON tc.tarelka_user_id = u.id
		ORDER BY r.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, creatorID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]model.NotifiedUserItem, 0)
	for rows.Next() {
		var item model.NotifiedUserItem
		if err := rows.Scan(
			&item.ID,
			&item.DisplayName,
			&item.Username,
			&item.Type,
			&item.LogoURL,
			&item.TelegramURL,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
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
	       SELECT id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve, is_deleted
	       FROM notifications
	       WHERE receiver_id = $1
	         AND type = $2
	         AND is_deleted = FALSE
	         AND (
	           publication_id IS NULL OR EXISTS (
	             SELECT 1 FROM publications p
	             WHERE p.id = notifications.publication_id AND p.is_deleted = FALSE
	           )
	         )
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
			&n.IsDeleted,
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
	       WHERE receiver_id = $1
	         AND is_read = FALSE
	         AND is_deleted = FALSE
	         AND (
	           publication_id IS NULL OR EXISTS (
	             SELECT 1 FROM publications p
	             WHERE p.id = notifications.publication_id AND p.is_deleted = FALSE
	           )
	         )
       `
	var count int64
	if err := r.pool.QueryRow(ctx, query, receiverID).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (r *notificationRepository) GetByID(ctx context.Context, id int64) (*model.Notification, error) {
	query := `
	       SELECT id, type, publication_id, created_at, creator_id, receiver_id, message, need_id, is_read, is_approve, is_deleted
	       FROM notifications
	       WHERE id = $1
	         AND is_deleted = FALSE
	         AND (
	           publication_id IS NULL OR EXISTS (
	             SELECT 1 FROM publications p
	             WHERE p.id = notifications.publication_id AND p.is_deleted = FALSE
	           )
	         )
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
		&n.IsDeleted,
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

// ListIncoming возвращает входящие уведомления (receiver_id = user)
// с опциональной фильтрацией по типу.
func (r *notificationRepository) ListIncoming(
	ctx context.Context,
	receiverID int64,
	nType *model.NotificationType,
	limit, offset int,
) ([]*model.NotificationWithCreator, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	baseQuery := `
		 SELECT n.id, n.type, n.publication_id, n.created_at, n.creator_id, n.receiver_id,
			 n.message, n.need_id, n.is_read, n.is_approve, n.is_deleted,
			 COALESCE(tp.name || ' ' || tp.surname, tc.company_name, u.username) AS creator_name
		 FROM notifications n
		 JOIN tarelka_users u ON u.id = n.creator_id
		 LEFT JOIN publications p ON p.id = n.publication_id
		 LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		 LEFT JOIN tarelka_companies tc ON tc.tarelka_user_id = u.id
		 WHERE n.receiver_id = $1 AND n.is_deleted = FALSE
		   AND (n.publication_id IS NULL OR p.is_deleted = FALSE)`

	args := []interface{}{receiverID}
	idx := 2

	if nType != nil {
		baseQuery += " AND n.type = $" + strconv.Itoa(idx)
		args = append(args, *nType)
		idx++
	}

	baseQuery += " ORDER BY n.created_at DESC"
	baseQuery += " LIMIT $" + strconv.Itoa(idx)
	args = append(args, limit)
	idx++
	baseQuery += " OFFSET $" + strconv.Itoa(idx)
	args = append(args, offset)

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*model.NotificationWithCreator
	for rows.Next() {
		var n model.NotificationWithCreator
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
			&n.IsDeleted,
			&n.CreatorName,
		); err != nil {
			return nil, err
		}
		res = append(res, &n)
	}

	return res, rows.Err()
}

// ListOutgoing возвращает исходящие уведомления (creator_id = user)
// с опциональной фильтрацией по типу.
func (r *notificationRepository) ListOutgoing(
	ctx context.Context,
	creatorID int64,
	nType *model.NotificationType,
	limit, offset int,
) ([]*model.NotificationWithCreator, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	baseQuery := `
		 SELECT n.id, n.type, n.publication_id, n.created_at, n.creator_id, n.receiver_id,
			 n.message, n.need_id, n.is_read, n.is_approve, n.is_deleted,
			 COALESCE(tp.name || ' ' || tp.surname, tc.company_name, u.username) AS creator_name
		 FROM notifications n
		 JOIN tarelka_users u ON u.id = n.creator_id
		 LEFT JOIN publications p ON p.id = n.publication_id
		 LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		 LEFT JOIN tarelka_companies tc ON tc.tarelka_user_id = u.id
		 WHERE n.creator_id = $1 AND n.is_deleted = FALSE
		   AND (n.publication_id IS NULL OR p.is_deleted = FALSE)`

	args := []interface{}{creatorID}
	idx := 2

	if nType != nil {
		baseQuery += " AND n.type = $" + strconv.Itoa(idx)
		args = append(args, *nType)
		idx++
	}

	baseQuery += " ORDER BY n.created_at DESC"
	baseQuery += " LIMIT $" + strconv.Itoa(idx)
	args = append(args, limit)
	idx++
	baseQuery += " OFFSET $" + strconv.Itoa(idx)
	args = append(args, offset)

	rows, err := r.pool.Query(ctx, baseQuery, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var res []*model.NotificationWithCreator
	for rows.Next() {
		var n model.NotificationWithCreator
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
			&n.IsDeleted,
			&n.CreatorName,
		); err != nil {
			return nil, err
		}
		res = append(res, &n)
	}

	return res, rows.Err()
}

// GetByIDForReceiverAndMarkRead возвращает уведомление по id, если
// оно принадлежит указанному получателю, и помечает его прочитанным.
func (r *notificationRepository) GetByIDForReceiverAndMarkRead(
	ctx context.Context,
	id int64,
	receiverID int64,
) (*model.NotificationWithCreator, error) {
	query := `
		UPDATE notifications n
		SET is_read = TRUE
		FROM tarelka_users u
		LEFT JOIN tarelka_persons tp ON tp.tarelka_user_id = u.id
		LEFT JOIN tarelka_companies tc ON tc.tarelka_user_id = u.id
		WHERE n.id = $1
		  AND n.receiver_id = $2
		  AND u.id = n.creator_id
		  AND (
		    n.publication_id IS NULL OR EXISTS (
		      SELECT 1 FROM publications p
		      WHERE p.id = n.publication_id AND p.is_deleted = FALSE
		    )
		  )
		RETURNING n.id, n.type, n.publication_id, n.created_at, n.creator_id, n.receiver_id,
		          n.message, n.need_id, n.is_read, n.is_approve,
		          COALESCE(tp.name || ' ' || tp.surname, tc.company_name, u.username) AS creator_name
	`

	var n model.NotificationWithCreator
	if err := r.pool.QueryRow(ctx, query, id, receiverID).Scan(
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
		&n.CreatorName,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrNotificationNotFound
		}
		return nil, err
	}

	return &n, nil
}
