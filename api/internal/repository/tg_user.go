package repository

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type TgUserRepository interface {
	FindByTelegramID(ctx context.Context, telegramID int64) (*model.TgUser, error)
	Create(ctx context.Context, telegramID int64) (*model.TgUser, error)
	FindOrCreate(ctx context.Context, telegramID int64) (*model.TgUser, error)
}

type tgUserRepository struct {
	pool *pgxpool.Pool
}

func NewTgUserRepository(pool *pgxpool.Pool) TgUserRepository {
	return &tgUserRepository{pool: pool}
}

func (r *tgUserRepository) FindByTelegramID(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	query := `SELECT telegram_id, created_at FROM tg_users WHERE telegram_id = $1`

	var user model.TgUser
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&user.TelegramID, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *tgUserRepository) Create(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	query := `INSERT INTO tg_users (telegram_id) VALUES ($1) RETURNING telegram_id, created_at`

	var user model.TgUser
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&user.TelegramID, &user.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *tgUserRepository) FindOrCreate(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	user, err := r.FindByTelegramID(ctx, telegramID)
	if err == nil {
		return user, nil
	}
	return r.Create(ctx, telegramID)
}
