package repository

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ActivityRepository interface {
	Create(ctx context.Context, a *model.Activity) error
}

type activityRepository struct {
	pool *pgxpool.Pool
}

func NewActivityRepository(pool *pgxpool.Pool) ActivityRepository {
	return &activityRepository{pool: pool}
}

func (r *activityRepository) Create(ctx context.Context, a *model.Activity) error {
	const query = `
		INSERT INTO activities (tarelka_user_id, type, time)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	return r.pool.QueryRow(ctx, query, a.TarelkaUserID, a.Type, a.Time).Scan(&a.ID)
}
