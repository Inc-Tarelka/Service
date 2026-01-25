package repository

import (
	"context"
	"errors"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrTokenNotFound = errors.New("refresh token not found")
	ErrTokenRevoked  = errors.New("refresh token revoked")
	ErrTokenExpired  = errors.New("refresh token expired")
)

type TokenRepository interface {
	CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error
	FindRefreshToken(ctx context.Context, token string) (*model.RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, token string) error
	RevokeAllUserTokens(ctx context.Context, userID int64) error
	DeleteExpiredTokens(ctx context.Context) error
}

type tokenRepository struct {
	pool *pgxpool.Pool
}

func NewTokenRepository(pool *pgxpool.Pool) TokenRepository {
	return &tokenRepository{pool: pool}
}

func (r *tokenRepository) CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error {
	query := `
		INSERT INTO refresh_tokens (tarelka_user_id, token, expires_at)
		VALUES ($1, $2, $3)
		RETURNING id, created_at
	`
	return r.pool.QueryRow(ctx, query, token.TarelkaUserID, token.Token, token.ExpiresAt).
		Scan(&token.ID, &token.CreatedAt)
}

func (r *tokenRepository) FindRefreshToken(ctx context.Context, token string) (*model.RefreshToken, error) {
	query := `
		SELECT id, tarelka_user_id, token, expires_at, created_at, revoked
		FROM refresh_tokens WHERE token = $1
	`

	var rt model.RefreshToken
	err := r.pool.QueryRow(ctx, query, token).Scan(
		&rt.ID,
		&rt.TarelkaUserID,
		&rt.Token,
		&rt.ExpiresAt,
		&rt.CreatedAt,
		&rt.Revoked,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrTokenNotFound
		}
		return nil, err
	}
	return &rt, nil
}

func (r *tokenRepository) RevokeRefreshToken(ctx context.Context, token string) error {
	query := `UPDATE refresh_tokens SET revoked = true WHERE token = $1`
	_, err := r.pool.Exec(ctx, query, token)
	return err
}

func (r *tokenRepository) RevokeAllUserTokens(ctx context.Context, userID int64) error {
	query := `UPDATE refresh_tokens SET revoked = true WHERE tarelka_user_id = $1`
	_, err := r.pool.Exec(ctx, query, userID)
	return err
}

func (r *tokenRepository) DeleteExpiredTokens(ctx context.Context) error {
	query := `DELETE FROM refresh_tokens WHERE expires_at < NOW() OR revoked = true`
	_, err := r.pool.Exec(ctx, query)
	return err
}
