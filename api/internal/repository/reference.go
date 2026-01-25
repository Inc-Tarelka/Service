package repository

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type ReferenceRepository interface {
	// Specializations
	GetAllSpecializations(ctx context.Context) ([]model.Specialization, error)
	GetSpecializationsByIDs(ctx context.Context, ids []int64) ([]model.Specialization, error)
	SpecializationsExist(ctx context.Context, ids []int64) (bool, error)

	// Directions
	GetAllDirections(ctx context.Context) ([]model.Direction, error)
	GetDirectionsByIDs(ctx context.Context, ids []int64) ([]model.Direction, error)
	DirectionsExist(ctx context.Context, ids []int64) (bool, error)

	// Cities
	GetAllCities(ctx context.Context) ([]model.City, error)
	GetCitiesByIDs(ctx context.Context, ids []int64) ([]model.City, error)
	CitiesExist(ctx context.Context, ids []int64) (bool, error)
}

type referenceRepository struct {
	pool *pgxpool.Pool
}

func NewReferenceRepository(pool *pgxpool.Pool) ReferenceRepository {
	return &referenceRepository{pool: pool}
}

// Specializations
func (r *referenceRepository) GetAllSpecializations(ctx context.Context) ([]model.Specialization, error) {
	query := `SELECT id, name FROM specializations ORDER BY name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var specs []model.Specialization
	for rows.Next() {
		var s model.Specialization
		if err := rows.Scan(&s.ID, &s.Name); err != nil {
			return nil, err
		}
		specs = append(specs, s)
	}
	return specs, nil
}

func (r *referenceRepository) GetSpecializationsByIDs(ctx context.Context, ids []int64) ([]model.Specialization, error) {
	if len(ids) == 0 {
		return []model.Specialization{}, nil
	}

	query := `SELECT id, name FROM specializations WHERE id = ANY($1)`
	rows, err := r.pool.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var specs []model.Specialization
	for rows.Next() {
		var s model.Specialization
		if err := rows.Scan(&s.ID, &s.Name); err != nil {
			return nil, err
		}
		specs = append(specs, s)
	}
	return specs, nil
}

func (r *referenceRepository) SpecializationsExist(ctx context.Context, ids []int64) (bool, error) {
	if len(ids) == 0 {
		return true, nil
	}

	query := `SELECT COUNT(*) FROM specializations WHERE id = ANY($1)`
	var count int
	err := r.pool.QueryRow(ctx, query, ids).Scan(&count)
	if err != nil {
		return false, err
	}
	return count == len(ids), nil
}

// Directions
func (r *referenceRepository) GetAllDirections(ctx context.Context) ([]model.Direction, error) {
	query := `SELECT id, name FROM directions ORDER BY name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dirs []model.Direction
	for rows.Next() {
		var d model.Direction
		if err := rows.Scan(&d.ID, &d.Name); err != nil {
			return nil, err
		}
		dirs = append(dirs, d)
	}
	return dirs, nil
}

func (r *referenceRepository) GetDirectionsByIDs(ctx context.Context, ids []int64) ([]model.Direction, error) {
	if len(ids) == 0 {
		return []model.Direction{}, nil
	}

	query := `SELECT id, name FROM directions WHERE id = ANY($1)`
	rows, err := r.pool.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var dirs []model.Direction
	for rows.Next() {
		var d model.Direction
		if err := rows.Scan(&d.ID, &d.Name); err != nil {
			return nil, err
		}
		dirs = append(dirs, d)
	}
	return dirs, nil
}

func (r *referenceRepository) DirectionsExist(ctx context.Context, ids []int64) (bool, error) {
	if len(ids) == 0 {
		return true, nil
	}

	query := `SELECT COUNT(*) FROM directions WHERE id = ANY($1)`
	var count int
	err := r.pool.QueryRow(ctx, query, ids).Scan(&count)
	if err != nil {
		return false, err
	}
	return count == len(ids), nil
}

// Cities
func (r *referenceRepository) GetAllCities(ctx context.Context) ([]model.City, error) {
	query := `SELECT id, name FROM cities ORDER BY name`
	rows, err := r.pool.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cities []model.City
	for rows.Next() {
		var c model.City
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, err
		}
		cities = append(cities, c)
	}
	return cities, nil
}

func (r *referenceRepository) GetCitiesByIDs(ctx context.Context, ids []int64) ([]model.City, error) {
	if len(ids) == 0 {
		return []model.City{}, nil
	}

	query := `SELECT id, name FROM cities WHERE id = ANY($1)`
	rows, err := r.pool.Query(ctx, query, ids)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var cities []model.City
	for rows.Next() {
		var c model.City
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, err
		}
		cities = append(cities, c)
	}
	return cities, nil
}

func (r *referenceRepository) CitiesExist(ctx context.Context, ids []int64) (bool, error) {
	if len(ids) == 0 {
		return true, nil
	}

	query := `SELECT COUNT(*) FROM cities WHERE id = ANY($1)`
	var count int
	err := r.pool.QueryRow(ctx, query, ids).Scan(&count)
	if err != nil {
		return false, err
	}
	return count == len(ids), nil
}
