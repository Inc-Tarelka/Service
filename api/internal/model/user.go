package model

import (
	"time"
)

// AccountType тип аккаунта
type AccountType string

const (
	AccountTypePerson  AccountType = "PERSON"
	AccountTypeCompany AccountType = "COMPANY"
)

// TgUser - Telegram пользователь (владелец)
type TgUser struct {
	TelegramID int64     `json:"telegram_id" db:"telegram_id"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
}

// TarelkaUser - базовая identity и auth-сущность
type TarelkaUser struct {
	ID           int64       `json:"id" db:"id"`
	TgUserID     int64       `json:"tg_user_id" db:"tg_user_id"`
	Type         AccountType `json:"type" db:"type"`
	Username     string      `json:"username" db:"username"`
	Phone        *string     `json:"phone,omitempty" db:"phone"`
	PasswordHash string      `json:"-" db:"password_hash"`
	LogoURL      *string     `json:"logo_url,omitempty" db:"logo_url"`
	TelegramURL  *string     `json:"telegram_url,omitempty" db:"telegram_url"`
	CreatedAt    time.Time   `json:"created_at" db:"created_at"`
}

// TarelkaPerson - дополнение для PERSON
type TarelkaPerson struct {
	TarelkaUserID int64  `json:"tarelka_user_id" db:"tarelka_user_id"`
	Name          string `json:"name" db:"name"`
	Surname       string `json:"surname" db:"surname"`
}

// TarelkaCompany - дополнение для COMPANY
type TarelkaCompany struct {
	TarelkaUserID int64  `json:"tarelka_user_id" db:"tarelka_user_id"`
	CompanyName   string `json:"company_name" db:"company_name"`
}

// TarelkaUserFull - полная информация о пользователе
type TarelkaUserFull struct {
	TarelkaUser
	Person          *TarelkaPerson   `json:"person,omitempty"`
	Company         *TarelkaCompany  `json:"company,omitempty"`
	Specializations []Specialization `json:"specializations,omitempty"`
	Directions      []Direction      `json:"directions,omitempty"`
	Cities          []City           `json:"cities,omitempty"`
}
