package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

// MasterRepository управляет сущностями мастеров (таблица masters).
type MasterRepository interface {
	Create(ctx context.Context, name string) (int64, error)
}

type masterRepository struct {
	pool *pgxpool.Pool
}

func NewMasterRepository(pool *pgxpool.Pool) MasterRepository {
	return &masterRepository{pool: pool}
}

// Create создаёт нового мастера и возвращает его ID.
func (r *masterRepository) Create(ctx context.Context, name string) (int64, error) {
	query := `INSERT INTO masters (name) VALUES ($1) RETURNING id`
	var id int64
	if err := r.pool.QueryRow(ctx, query, name).Scan(&id); err != nil {
		return 0, err
	}
	return id, nil
}
