// This is a Go file for the TgUserRepository implementation
// It contains methods for interacting with the tg_users table

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
	GetInviteFields(ctx context.Context, telegramID int64) (model.InviteAccountType, int, error)
	IncreaseInviteCountWithLimit(ctx context.Context, telegramID int64) (model.InviteAccountType, int, error)
	SetInviteAccountType(ctx context.Context, telegramID int64, t model.InviteAccountType) error
}

type tgUserRepository struct {
	pool *pgxpool.Pool
}

func NewTgUserRepository(pool *pgxpool.Pool) TgUserRepository {
	return &tgUserRepository{pool: pool}
}

func (r *tgUserRepository) FindByTelegramID(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	query := `SELECT telegram_id, created_at, invite_account_type, invite_referral_count FROM tg_users WHERE telegram_id = $1`

	var user model.TgUser
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&user.TelegramID, &user.CreatedAt, &user.InviteAccountType, &user.InviteReferralCount)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (r *tgUserRepository) Create(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	query := `INSERT INTO tg_users (telegram_id) VALUES ($1) RETURNING telegram_id, created_at, invite_account_type, invite_referral_count`

	var user model.TgUser
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&user.TelegramID, &user.CreatedAt, &user.InviteAccountType, &user.InviteReferralCount)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetInviteFields возвращает поля инвайт-системы для Telegram-пользователя
func (r *tgUserRepository) GetInviteFields(ctx context.Context, telegramID int64) (model.InviteAccountType, int, error) {
	query := `SELECT invite_account_type, invite_referral_count FROM tg_users WHERE telegram_id = $1`
	var t model.InviteAccountType
	var cnt int
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&t, &cnt)
	return t, cnt, err
}

// IncreaseInviteCountWithLimit инкрементирует invite_referral_count с учётом лимита
func (r *tgUserRepository) IncreaseInviteCountWithLimit(ctx context.Context, telegramID int64) (model.InviteAccountType, int, error) {
	query := `
		UPDATE tg_users
		SET invite_referral_count = invite_referral_count + 1
		WHERE telegram_id = $1
		  AND (
			invite_account_type = 'CLUB_PARTICIPANT'
			OR (invite_account_type = 'DEFAULT' AND invite_referral_count < 5)
		  )
		RETURNING invite_account_type, invite_referral_count
	`
	var t model.InviteAccountType
	var cnt int
	err := r.pool.QueryRow(ctx, query, telegramID).Scan(&t, &cnt)
	if err != nil {
		return "", 0, err
	}
	return t, cnt, nil
}

// SetInviteAccountType устанавливает invite_account_type для Telegram-пользователя
func (r *tgUserRepository) SetInviteAccountType(ctx context.Context, telegramID int64, t model.InviteAccountType) error {
	query := `UPDATE tg_users SET invite_account_type = $1 WHERE telegram_id = $2`
	_, err := r.pool.Exec(ctx, query, t, telegramID)
	return err
}

func (r *tgUserRepository) FindOrCreate(ctx context.Context, telegramID int64) (*model.TgUser, error) {
	user, err := r.FindByTelegramID(ctx, telegramID)
	if err == nil {
		return user, nil
	}
	return r.Create(ctx, telegramID)
}
