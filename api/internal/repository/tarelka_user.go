package repository

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

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
	UpdateWallpaperURL(ctx context.Context, userID int64, url string) error
	// UpdateConversation bumps user's conversation stage to at least the given value
	UpdateConversation(ctx context.Context, userID int64, stage int) error
	// UpdateProfile updates profile fields (name/surname or company name, username, city, bio, find_work, education).
	// Pass nil for pointer fields and empty string for username if they shouldn't be changed.
	UpdateProfile(ctx context.Context, userID int64,
		personName *string, personSurname *string,
		companyName *string,
		username string,
		cityID *int64,
		bio *string,
		findWork *model.FindWork,
		education *string,
	) error
	// Delete user and related rows
	Delete(ctx context.Context, userID int64) error

	// Search helpers
	// SearchByName finds users by person name/surname or company name (ILIKE, contains)
	SearchByName(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error)
	// SearchByTelegram finds users by telegram_url (ILIKE, contains)
	SearchByTelegram(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error)

	// Advanced filters
	// SearchByFilters finds users by optional filters: name, specialization IDs, account type, status (find_work), city IDs
	SearchByFilters(ctx context.Context, name string, specializationIDs []int64, accountType *model.AccountType, status *model.FindWork, cityIDs []int64, limit, offset int) ([]*model.TarelkaUserFull, error)

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
		INSERT INTO tarelka_users (tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, telegram_chat_id, conversation)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, telegram_chat_id, conversation, conversation_updated_at, created_at
	`

	err := r.pool.QueryRow(ctx, query,
		user.TgUserID,
		user.Type,
		user.Username,
		user.Phone,
		user.PasswordHash,
		user.LogoURL,
		user.TelegramURL,
		user.TelegramChatID,
		user.Conversation,
	).Scan(
		&user.ID,
		&user.TgUserID,
		&user.Type,
		&user.Username,
		&user.Phone,
		&user.PasswordHash,
		&user.LogoURL,
		&user.TelegramURL,
		&user.TelegramChatID,
		&user.Conversation,
		&user.ConversationUpdatedAt,
		&user.CreatedAt,
	)
	if err != nil {
		return nil, err
	}
	return user, nil
}

func (r *tarelkaUserRepository) FindByID(ctx context.Context, id int64) (*model.TarelkaUser, error) {
	query := `
		SELECT id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, telegram_chat_id, conversation, conversation_updated_at, created_at
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
		&user.TelegramChatID,
		&user.Conversation,
		&user.ConversationUpdatedAt,
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
		SELECT id, tg_user_id, type, username, phone, password_hash, logo_url, telegram_url, telegram_chat_id, conversation, conversation_updated_at, created_at
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
		&user.TelegramChatID,
		&user.Conversation,
		&user.ConversationUpdatedAt,
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

// UpdateTelegramChatIDByTelegramURL updates telegram_chat_id for a user identified by telegram_url
func (r *tarelkaUserRepository) UpdateTelegramChatIDByTelegramURL(ctx context.Context, telegramURL string, chatID int64) error {
	query := `
		UPDATE tarelka_users
		SET telegram_chat_id = $1
		WHERE telegram_url = $2
	`
	_, err := r.pool.Exec(ctx, query, chatID, telegramURL)
	return err
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

// GetLastProjectTopImages возвращает до 3 URL главных изображений (position = 0)
// последних по дате создания проектов пользователя.
func (r *tarelkaUserRepository) GetLastProjectTopImages(ctx context.Context, userID int64, limit int) ([]string, error) {
	if limit <= 0 {
		limit = 3
	}
	query := `
		SELECT pi.url
		FROM publications p
		JOIN publication_images pi ON pi.publication_id = p.id AND pi.position = 0
		WHERE p.author_id = $1 AND p.type = 'PROJECT'
		ORDER BY p.created_at DESC
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var urls []string
	for rows.Next() {
		var u string
		if err := rows.Scan(&u); err != nil {
			return nil, err
		}
		urls = append(urls, u)
	}
	return urls, nil
}

// SearchByName finds users by person name/surname or company name
func (r *tarelkaUserRepository) SearchByName(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error) {
	// Если строка поиска пустая, возвращаем всех пользователей (как в SearchByFilters при пустом name)
	if strings.TrimSpace(q) == "" {
		q = ""
	}
	// Delegate search logic to shared helper so it behaves like SearchByFilters (name + telegram_url)
	rows, err := r.searchUsersWithNameLike(ctx, q, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*model.TarelkaUserFull
	for rows.Next() {
		var (
			u           model.TarelkaUser
			name        *string
			surname     *string
			companyName *string
		)
		if err := rows.Scan(
			&u.ID, &u.TgUserID, &u.Type, &u.Username, &u.Phone, &u.LogoURL, &u.TelegramURL, &u.Conversation, &u.ConversationUpdatedAt, &u.CreatedAt,
			&name, &surname, &companyName,
		); err != nil {
			return nil, err
		}
		fu := &model.TarelkaUserFull{TarelkaUser: u}
		if name != nil || surname != nil {
			fu.Person = &model.TarelkaPerson{TarelkaUserID: u.ID, Name: valueOrEmpty(name), Surname: valueOrEmpty(surname)}
		}
		if companyName != nil {
			fu.Company = &model.TarelkaCompany{TarelkaUserID: u.ID, CompanyName: *companyName}
		}
		// Обогащаем PERSON городами и специализациями, как в SearchByFilters
		if u.Type == model.AccountTypePerson {
			if specs, err := r.GetSpecializations(ctx, u.ID); err == nil {
				fu.Specializations = specs
			}
			if cities, err := r.GetCities(ctx, u.ID); err == nil {
				fu.Cities = cities
			}
		}
		// Добавляем главные изображения последних проектов (для всех типов аккаунта)
		if imgs, err := r.GetLastProjectTopImages(ctx, u.ID, 3); err == nil {
			fu.ProjectTopImages = imgs
		}
		result = append(result, fu)
	}
	return result, nil
}

// searchUsersWithNameLike реализует общую логику поиска по имени/фамилии/компании и telegram_url
// и используется в SearchByName и SearchByFilters, чтобы поведение оставалось единым.
func (r *tarelkaUserRepository) searchUsersWithNameLike(ctx context.Context, raw string, limit, offset int) (pgx.Rows, error) {
	base := strings.TrimSpace(raw)

	args := []interface{}{}
	where := ""

	// Если base пустая, не добавляем WHERE и просто возвращаем всех пользователей
	if base != "" {
		pattern := "%" + base + "%"
		tokens := strings.Fields(base)

		where = "WHERE ( (p.name ILIKE $1 OR p.surname ILIKE $1 OR (p.name || ' ' || p.surname) ILIKE $1) OR c.company_name ILIKE $1 )"
		args = append(args, pattern)

		if len(tokens) >= 2 {
			t1 := "%" + tokens[0] + "%"
			t2 := "%" + tokens[1] + "%"
			where += " OR ((p.name ILIKE $2 AND p.surname ILIKE $3) OR (p.name ILIKE $3 AND p.surname ILIKE $2))"
			args = append(args, t1, t2)
		}

		// также ищем по telegram_url, как в SearchByFilters
		handle := strings.TrimPrefix(base, "@")
		if handle != "" {
			patternTg := "%" + handle + "%"
			pos := len(args) + 1
			where += fmt.Sprintf(" OR u.telegram_url ILIKE $%d", pos)
			args = append(args, patternTg)
		}
	}

	limPos := len(args) + 1
	offPos := len(args) + 2
	query := fmt.Sprintf(`
		SELECT 
			u.id, u.tg_user_id, u.type, u.username, u.phone, u.logo_url, u.telegram_url, u.conversation, u.conversation_updated_at, u.created_at,
			p.name, p.surname, c.company_name
		FROM tarelka_users u
		LEFT JOIN tarelka_persons p ON p.tarelka_user_id = u.id
		LEFT JOIN tarelka_companies c ON c.tarelka_user_id = u.id
		%s
		ORDER BY u.created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, limPos, offPos)

	args = append(args, limit, offset)
	return r.pool.Query(ctx, query, args...)
}

// SearchByTelegram finds users by telegram_url
func (r *tarelkaUserRepository) SearchByTelegram(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error) {
	if strings.TrimSpace(q) == "" {
		return []*model.TarelkaUserFull{}, nil
	}
	// Normalize handle: strip leading '@' and whitespace; search as substring in telegram_url
	handle := strings.TrimSpace(q)
	handle = strings.TrimPrefix(handle, "@")
	pattern := "%" + handle + "%"
	query := `
		SELECT 
			u.id, u.tg_user_id, u.type, u.username, u.phone, u.logo_url, u.telegram_url, u.conversation, u.conversation_updated_at, u.created_at,
			p.name, p.surname, c.company_name
		FROM tarelka_users u
		LEFT JOIN tarelka_persons p ON p.tarelka_user_id = u.id
		LEFT JOIN tarelka_companies c ON c.tarelka_user_id = u.id
		WHERE u.telegram_url ILIKE $1
		ORDER BY u.created_at DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, pattern, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*model.TarelkaUserFull
	for rows.Next() {
		var (
			u             model.TarelkaUser
			name, surname *string
			companyName   *string
		)
		if err := rows.Scan(
			&u.ID, &u.TgUserID, &u.Type, &u.Username, &u.Phone, &u.LogoURL, &u.TelegramURL, &u.Conversation, &u.ConversationUpdatedAt, &u.CreatedAt,
			&name, &surname, &companyName,
		); err != nil {
			return nil, err
		}
		fu := &model.TarelkaUserFull{TarelkaUser: u}
		if name != nil || surname != nil {
			fu.Person = &model.TarelkaPerson{TarelkaUserID: u.ID, Name: valueOrEmpty(name), Surname: valueOrEmpty(surname)}
		}
		if companyName != nil {
			fu.Company = &model.TarelkaCompany{TarelkaUserID: u.ID, CompanyName: *companyName}
		}
		result = append(result, fu)
	}
	return result, nil
}

// SearchByFilters finds users by optional filters combining name/company, specializations, type, status (find_work) and cities
func (r *tarelkaUserRepository) SearchByFilters(ctx context.Context, name string, specializationIDs []int64, accountType *model.AccountType, status *model.FindWork, cityIDs []int64, limit, offset int) ([]*model.TarelkaUserFull, error) {
	// Base SELECT with DISTINCT ON to avoid duplicates due to joins
	// Build joins dynamically based on provided filters
	joins := []string{
		"LEFT JOIN tarelka_persons p ON p.tarelka_user_id = u.id",
		"LEFT JOIN tarelka_companies c ON c.tarelka_user_id = u.id",
	}
	if len(specializationIDs) > 0 {
		joins = append(joins, "INNER JOIN user_specializations us ON us.tarelka_user_id = u.id")
	}
	if len(cityIDs) > 0 {
		joins = append(joins, "INNER JOIN user_cities uc ON uc.tarelka_user_id = u.id")
	}

	whereParts := []string{}
	args := []interface{}{}

	// Name filter: similar to SearchByName
	name = strings.TrimSpace(name)
	if name != "" {
		pattern := "%" + name + "%"
		tokens := strings.Fields(name)
		where := "( (p.name ILIKE $1 OR p.surname ILIKE $1 OR (p.name || ' ' || p.surname) ILIKE $1) OR c.company_name ILIKE $1 )"
		args = append(args, pattern)
		if len(tokens) >= 2 {
			t1 := "%" + tokens[0] + "%"
			t2 := "%" + tokens[1] + "%"
			where += " OR ((p.name ILIKE $2 AND p.surname ILIKE $3) OR (p.name ILIKE $3 AND p.surname ILIKE $2))"
			args = append(args, t1, t2)
		}
		// Also match by Telegram URL/handle when provided in 'name'
		// Normalize: strip leading '@' for handle to match stored urls like https://t.me/<handle>
		tgPattern := "%" + strings.TrimPrefix(name, "@") + "%"
		pos := len(args) + 1
		where += fmt.Sprintf(" OR u.telegram_url ILIKE $%d", pos)
		args = append(args, tgPattern)
		whereParts = append(whereParts, where)
	}

	// Type filter
	if accountType != nil {
		whereParts = append(whereParts, fmt.Sprintf("u.type = $%d", len(args)+1))
		args = append(args, *accountType)
	}

	// Status (find_work) filter
	if status != nil {
		whereParts = append(whereParts, fmt.Sprintf("u.find_work = $%d", len(args)+1))
		args = append(args, *status)
	}

	// Specializations filter (any of provided)
	if len(specializationIDs) > 0 {
		whereParts = append(whereParts, fmt.Sprintf("us.specialization_id = ANY($%d::bigint[])", len(args)+1))
		args = append(args, specializationIDs)
	}

	// Cities filter (any of provided)
	if len(cityIDs) > 0 {
		whereParts = append(whereParts, fmt.Sprintf("uc.city_id = ANY($%d::bigint[])", len(args)+1))
		args = append(args, cityIDs)
	}

	whereSQL := ""
	if len(whereParts) > 0 {
		whereSQL = "WHERE " + strings.Join(whereParts, " AND ")
	}

	// Compute positions for limit/offset
	limPos := len(args) + 1
	offPos := len(args) + 2

	query := fmt.Sprintf(`
		SELECT DISTINCT ON (u.id)
			u.id, u.tg_user_id, u.type, u.username, u.phone, u.logo_url, u.telegram_url, u.conversation, u.conversation_updated_at, u.created_at,
			p.name, p.surname, c.company_name
		FROM tarelka_users u
		%s
		%s
		ORDER BY u.id, u.created_at DESC
		LIMIT $%d OFFSET $%d
	`, strings.Join(joins, "\n"), whereSQL, limPos, offPos)

	args = append(args, limit, offset)
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var result []*model.TarelkaUserFull
	for rows.Next() {
		var (
			u                   model.TarelkaUser
			namePtr, surnamePtr *string
			companyName         *string
		)
		if err := rows.Scan(
			&u.ID, &u.TgUserID, &u.Type, &u.Username, &u.Phone, &u.LogoURL, &u.TelegramURL, &u.Conversation, &u.ConversationUpdatedAt, &u.CreatedAt,
			&namePtr, &surnamePtr, &companyName,
		); err != nil {
			return nil, err
		}
		fu := &model.TarelkaUserFull{TarelkaUser: u}
		if namePtr != nil || surnamePtr != nil {
			fu.Person = &model.TarelkaPerson{TarelkaUserID: u.ID, Name: valueOrEmpty(namePtr), Surname: valueOrEmpty(surnamePtr)}
		}
		if companyName != nil {
			fu.Company = &model.TarelkaCompany{TarelkaUserID: u.ID, CompanyName: *companyName}
		}
		// Enrich PERSON with specializations and cities
		if u.Type == model.AccountTypePerson {
			if specs, err := r.GetSpecializations(ctx, u.ID); err == nil {
				fu.Specializations = specs
			}
			if cities, err := r.GetCities(ctx, u.ID); err == nil {
				fu.Cities = cities
			}
		}
		// Attach last project top images (up to 3) for every user
		if imgs, err := r.GetLastProjectTopImages(ctx, u.ID, 3); err == nil {
			fu.ProjectTopImages = imgs
		}
		result = append(result, fu)
	}
	return result, nil
}

// helper to deref *string with empty fallback
func valueOrEmpty(s *string) string {
	if s == nil {
		return ""
	}
	return *s
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

// UpdateWallpaperURL обновляет ссылку на обложку пользователя
func (r *tarelkaUserRepository) UpdateWallpaperURL(ctx context.Context, userID int64, url string) error {
	query := `UPDATE tarelka_users SET wallpaper_url = $1 WHERE id = $2`
	cmd, err := r.pool.Exec(ctx, query, url, userID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}

// UpdateConversation обновляет стадию conversation пользователя, не понижая её.
// Использует GREATEST, чтобы гарантировать монотонный рост стадии.
func (r *tarelkaUserRepository) UpdateConversation(ctx context.Context, userID int64, stage int) error {
	query := `UPDATE tarelka_users SET conversation = GREATEST(conversation, $1), conversation_updated_at = NOW() WHERE id = $2`
	cmd, err := r.pool.Exec(ctx, query, stage, userID)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return ErrUserNotFound
	}
	return nil
}

// UpdateProfile updates profile fields selectively
func (r *tarelkaUserRepository) UpdateProfile(
	ctx context.Context,
	userID int64,
	personName *string,
	personSurname *string,
	companyName *string,
	username string,
	cityID *int64,
	bio *string,
	findWork *model.FindWork,
	education *string,
) error {
	parts := []string{}
	args := []interface{}{}
	idx := 1

	// Обновление имени/фамилии или company_name в зав-ти от типа пользователя
	if personName != nil {
		parts = append(parts, "name = $"+strconv.Itoa(idx))
		args = append(args, *personName)
		idx++
	}
	if personSurname != nil {
		parts = append(parts, "surname = $"+strconv.Itoa(idx))
		args = append(args, *personSurname)
		idx++
	}
	if companyName != nil {
		parts = append(parts, "company_name = $"+strconv.Itoa(idx))
		args = append(args, *companyName)
		idx++
	}

	// username храним в tarelka_users
	if username != "" {
		parts = append(parts, "username = $"+strconv.Itoa(idx))
		args = append(args, username)
		idx++
	}

	// city: для простоты обновим user_cities, установив один основной город
	if cityID != nil {
		// city будет обновлён отдельным запросом ниже
	}

	if bio != nil {
		parts = append(parts, "bio = $"+strconv.Itoa(idx))
		args = append(args, *bio)
		idx++
	}
	if findWork != nil {
		parts = append(parts, "find_work = $"+strconv.Itoa(idx))
		args = append(args, *findWork)
		idx++
	}
	if education != nil {
		parts = append(parts, "education = $"+strconv.Itoa(idx))
		args = append(args, *education)
		idx++
	}

	// Если нет полей для обновления в самой таблице tarelka_users — просто обновим город (если нужно)
	if len(parts) == 0 && cityID == nil {
		return nil
	}

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if len(parts) > 0 {
		argsWithUser := append(args, userID)
		query := fmt.Sprintf("UPDATE tarelka_users SET %s WHERE id = $%d", strings.Join(parts, ", "), idx)
		cmd, err := tx.Exec(ctx, query, argsWithUser...)
		if err != nil {
			return err
		}
		if cmd.RowsAffected() == 0 {
			return ErrUserNotFound
		}
	}

	if cityID != nil {
		// Удалим старые связи и добавим одну новую
		if _, err := tx.Exec(ctx, "DELETE FROM user_cities WHERE tarelka_user_id = $1", userID); err != nil {
			return err
		}
		if _, err := tx.Exec(ctx, "INSERT INTO user_cities (tarelka_user_id, city_id) VALUES ($1, $2)", userID, *cityID); err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}

// Delete удаляет пользователя и связанные сущности в транзакции
func (r *tarelkaUserRepository) Delete(ctx context.Context, userID int64) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer func() {
		_ = tx.Rollback(ctx)
	}()

	// remove relations and subtype entries
	stmts := []string{
		"DELETE FROM user_specializations WHERE tarelka_user_id = $1",
		"DELETE FROM user_directions WHERE tarelka_user_id = $1",
		"DELETE FROM user_cities WHERE tarelka_user_id = $1",
		"DELETE FROM tarelka_persons WHERE tarelka_user_id = $1",
		"DELETE FROM tarelka_companies WHERE tarelka_user_id = $1",
		"DELETE FROM tokens WHERE tarelka_user_id = $1",
		"DELETE FROM tarelka_users WHERE id = $1",
	}
	for _, q := range stmts {
		if _, err := tx.Exec(ctx, q, userID); err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return err
	}
	return nil
}
