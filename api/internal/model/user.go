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
	// Wallpaper (cover image) URL — stored in S3 similarly to LogoURL
	WallpaperURL *string `json:"wallpaper_url,omitempty" db:"wallpaper_url"`
	// Short bio / about me
	Bio *string `json:"bio,omitempty" db:"bio"`
	// FindWork — enum indicating whether user is looking for a job
	FindWork *FindWork `json:"find_work,omitempty" db:"find_work"`
	// Education — free text
	Education      *string `json:"education,omitempty" db:"education"`
	TelegramURL    *string `json:"telegram_url,omitempty" db:"telegram_url"`
	TelegramChatID *int64  `json:"telegram_chat_id,omitempty" db:"telegram_chat_id"`
	Conversation   int     `json:"conversation" db:"conversation"`
	// ConversationUpdatedAt — when conversation stage was last changed
	ConversationUpdatedAt time.Time `json:"conversation_updated_at" db:"conversation_updated_at"`
	CreatedAt             time.Time `json:"created_at" db:"created_at"`
}

// FindWork — вариант поиска работы
type FindWork string

const (
	// Use ASCII codes at storage level to avoid DB encoding issues; map to localized strings at UI
	FindWorkLooking     FindWork = "LOOKING"
	FindWorkNotLooking  FindWork = "NOT_LOOKING"
	FindWorkOpenToOffer FindWork = "OPEN_TO_OFFERS"
)

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
	// ProjectTopImages содержит URL главных изображений (position = 0)
	// последних (по created_at) до трёх проектов пользователя.
	ProjectTopImages []string `json:"projectTopImages,omitempty"`
}

// UserProfilePublicationItem описывает короткую информацию о публикации в профиле пользователя.
type UserProfilePublicationItem struct {
	ID         int64           `json:"id"`
	Type       PublicationType `json:"type"`
	LikesCount int64           `json:"likesCount"`
	ImageURL   *string         `json:"imageUrl,omitempty"`
	IsAuthor   bool            `json:"isAuthor"`
}

// UserProfileResponse — расширенный профиль пользователя для страницы профиля.
type UserProfileResponse struct {
	User                  *TarelkaUserFull             `json:"user"`
	Publications          []UserProfilePublicationItem `json:"publications"`
	TeammatesCount        int64                        `json:"teammatesCount"`
	OutgoingRequestsCount int64                        `json:"outgoingRequestsCount"`
	ProjectsCount         int64                        `json:"projectsCount"`
}
