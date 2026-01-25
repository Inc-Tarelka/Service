package repository

import (
	"context"
	"errors"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrUserNotFound   = errors.New("user not found")
	ErrUsernameExists = errors.New("username already exists")
	ErrPhoneExists    = errors.New("phone already exists")
)

type TarelkaUserRepository interface {
	Create(ctx context.Context, user *model.TarelkaUser) (*model.TarelkaUser, error)
	FindByID(ctx context.Context, id int64) (*model.TarelkaUser, error)
	FindByUsername(ctx context.Context, username string) (*model.TarelkaUser, error)
	ExistsByUsername(ctx context.Context, username string) (bool, error)
	GetFullUser(ctx context.Context, id int64) (*model.TarelkaUserFull, error)
	UpdatePasswordHash(ctx context.Context, userID int64, newHash string) error
	UpdateLogoURL(ctx context.Context, userID int64, url string) error

	// Person
	CreatePerson(ctx context.Context, person *model.TarelkaPerson) error
	GetPerson(ctx context.Context, userID int64) (*model.TarelkaPerson, error)

	// Company
	CreateCompany(ctx context.Context, company *model.TarelkaCompany) error
	GetCompany(ctx context.Context, userID int64) (*model.TarelkaCompany, error)

	// Relations
	AddSpecializations(ctx context.Context, userID int64, ids []int64) error
	AddDirections(ctx context.Context, userID int64, ids []int64) error
	AddCities(ctx context.Context, userID int64, ids []int64) error
	GetSpecializations(ctx context.Context, userID int64) ([]model.Specialization, error)
	GetDirections(ctx context.Context, userID int64) ([]model.Direction, error)
	GetCities(ctx context.Context, userID int64) ([]model.City, error)
}

type tarelkaUserRepository struct {
	pool *pgxpool.Pool
}

func NewTarelkaUserRepository(pool *pgxpool.Pool) TarelkaUserRepository {
	return &tarelkaUserRepository{pool: pool}
}

func (r *tarelkaUserRepository) Create(ctx context.Context, user *model.TarelkaUser) (*model.TarelkaUser, error) {
	query := `
		INSERT INTO tarelka_users (tg_user_id, type, username, phone, password_hash, logo_url, telegram_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, created_at
	`

	err := r.pool.QueryRow(ctx, query,
		user.TgUserID,
		user.Type,
		user.Username,
		user.Phone,
		user.PasswordHash,
		user.LogoURL,
		user.TelegramURL,
	).Scan(
		&user.ID,
		&user.TgUserID,
		&user.Type,
		&user.Username,
		&user.Phone,
		&user.PasswordHash,
		&user.LogoURL,
		&user.TelegramURL,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *tarelkaUserRepository) FindByID(ctx context.Context, id int64) (*model.TarelkaUser, error) {
	query := `
		SELECT id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, created_at
		FROM tarelka_users WHERE id = $1
	`

	var user model.TarelkaUser
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&user.ID,
		&user.TgUserID,
		&user.Type,
		&user.Username,
		&user.Phone,
		&user.PasswordHash,
		&user.LogoURL,
		&user.TelegramURL,
		&user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *tarelkaUserRepository) FindByUsername(ctx context.Context, username string) (*model.TarelkaUser, error) {
	query := `
		SELECT id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, created_at
		FROM tarelka_users WHERE username = $1
	`

	var user model.TarelkaUser
	err := r.pool.QueryRow(ctx, query, username).Scan(
		&user.ID,
		&user.TgUserID,
		&user.Type,
		&user.Username,
		&user.Phone,
		&user.PasswordHash,
		&user.LogoURL,
		&user.TelegramURL,
		&user.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, err
	}
	return &user, nil
}

func (r *tarelkaUserRepository) ExistsByUsername(ctx context.Context, username string) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM tarelka_users WHERE username = $1)`
	var exists bool
	err := r.pool.QueryRow(ctx, query, username).Scan(&exists)
	return exists, err
}

func (r *tarelkaUserRepository) GetFullUser(ctx context.Context, id int64) (*model.TarelkaUserFull, error) {
	user, err := r.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	fullUser := &model.TarelkaUserFull{
		TarelkaUser: *user,
	}

	// Get subtype
	if user.Type == model.AccountTypePerson {
		fullUser.Person, _ = r.GetPerson(ctx, id)
	} else {
		fullUser.Company, _ = r.GetCompany(ctx, id)
	}

	// Get relations
	fullUser.Specializations, _ = r.GetSpecializations(ctx, id)
	fullUser.Directions, _ = r.GetDirections(ctx, id)
	fullUser.Cities, _ = r.GetCities(ctx, id)

	return fullUser, nil
}

// Person methods
func (r *tarelkaUserRepository) CreatePerson(ctx context.Context, person *model.TarelkaPerson) error {
	query := `INSERT INTO tarelka_persons (tarelka_user_id, name, surname) VALUES ($1, $2, $3)`
	_, err := r.pool.Exec(ctx, query, person.TarelkaUserID, person.Name, person.Surname)
	return err
}

func (r *tarelkaUserRepository) GetPerson(ctx context.Context, userID int64) (*model.TarelkaPerson, error) {
	query := `SELECT tarelka_user_id, name, surname FROM tarelka_persons WHERE tarelka_user_id = $1`
	var person model.TarelkaPerson
	err := r.pool.QueryRow(ctx, query, userID).Scan(&person.TarelkaUserID, &person.Name, &person.Surname)
	if err != nil {
		return nil, err
	}
	return &person, nil
}

// Company methods
func (r *tarelkaUserRepository) CreateCompany(ctx context.Context, company *model.TarelkaCompany) error {
	query := `INSERT INTO tarelka_companies (tarelka_user_id, company_name) VALUES ($1, $2)`
	_, err := r.pool.Exec(ctx, query, company.TarelkaUserID, company.CompanyName)
	return err
}

func (r *tarelkaUserRepository) GetCompany(ctx context.Context, userID int64) (*model.TarelkaCompany, error) {
	query := `SELECT tarelka_user_id, company_name FROM tarelka_companies WHERE tarelka_user_id = $1`
	var company model.TarelkaCompany
	err := r.pool.QueryRow(ctx, query, userID).Scan(&company.TarelkaUserID, &company.CompanyName)
	if err != nil {
		return nil, err
	}
	return &company, nil
}

// Relations
func (r *tarelkaUserRepository) AddSpecializations(ctx context.Context, userID int64, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}

	batch := &pgx.Batch{}
	for _, id := range ids {
		batch.Queue(`INSERT INTO user_specializations (tarelka_user_id, specialization_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, id)
	}

	results := r.pool.SendBatch(ctx, batch)
	defer results.Close()

	for range ids {
		if _, err := results.Exec(); err != nil {
			return err
		}
	}
	return nil
}

func (r *tarelkaUserRepository) AddDirections(ctx context.Context, userID int64, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}

	batch := &pgx.Batch{}
	for _, id := range ids {
		batch.Queue(`INSERT INTO user_directions (tarelka_user_id, direction_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, id)
	}

	results := r.pool.SendBatch(ctx, batch)
	defer results.Close()

	for range ids {
		if _, err := results.Exec(); err != nil {
			return err
		}
	}
	return nil
}

func (r *tarelkaUserRepository) AddCities(ctx context.Context, userID int64, ids []int64) error {
	if len(ids) == 0 {
		return nil
	}

	batch := &pgx.Batch{}
	for _, id := range ids {
		batch.Queue(`INSERT INTO user_cities (tarelka_user_id, city_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, id)
	}

	results := r.pool.SendBatch(ctx, batch)
	defer results.Close()

	for range ids {
		if _, err := results.Exec(); err != nil {
			return err
		}
	}
	return nil
}

func (r *tarelkaUserRepository) GetSpecializations(ctx context.Context, userID int64) ([]model.Specialization, error) {
	query := `
		SELECT s.id, s.name 
		FROM specializations s
		JOIN user_specializations us ON s.id = us.specialization_id
		WHERE us.tarelka_user_id = $1
	`
	rows, err := r.pool.Query(ctx, query, userID)
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

func (r *tarelkaUserRepository) GetDirections(ctx context.Context, userID int64) ([]model.Direction, error) {
	query := `
		SELECT d.id, d.name 
		FROM directions d
		JOIN user_directions ud ON d.id = ud.direction_id
		WHERE ud.tarelka_user_id = $1
	`
	rows, err := r.pool.Query(ctx, query, userID)
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

func (r *tarelkaUserRepository) GetCities(ctx context.Context, userID int64) ([]model.City, error) {
	query := `
		SELECT c.id, c.name 
		FROM cities c
		JOIN user_cities uc ON c.id = uc.city_id
		WHERE uc.tarelka_user_id = $1
	`
	rows, err := r.pool.Query(ctx, query, userID)
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

// UpdatePasswordHash обновляет хеш пароля пользователя
func (r *tarelkaUserRepository) UpdatePasswordHash(ctx context.Context, userID int64, newHash string) error {
	query := `UPDATE tarelka_users SET password_hash = $1 WHERE id = $2`
	cmd, err := r.pool.Exec(ctx, query, newHash, userID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}

// UpdateLogoURL обновляет ссылку на логотип пользователя
func (r *tarelkaUserRepository) UpdateLogoURL(ctx context.Context, userID int64, url string) error {
	query := `UPDATE tarelka_users SET logo_url = $1 WHERE id = $2`
	cmd, err := r.pool.Exec(ctx, query, url, userID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}
