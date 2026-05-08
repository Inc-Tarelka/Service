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

// InviteAccountType определяет приглашательный статус пользователя
// (используется для ограничения количества регистраций по ссылке).
// DEFAULT        — обычный пользователь (может пригласить до 5 человек)
// CLUB_PARTICIPANT — «клубный» пользователь с неограниченным числом приглашений.
type InviteAccountType string

const (
	InviteAccountTypeDefault         InviteAccountType = "DEFAULT"
	InviteAccountTypeClubParticipant InviteAccountType = "CLUB_PARTICIPANT"
)

// TgUser - Telegram пользователь (владелец)
type TgUser struct {
	TelegramID          int64             `json:"telegram_id" db:"telegram_id"`
	CreatedAt           time.Time         `json:"created_at" db:"created_at"`
	InviteAccountType   InviteAccountType `json:"invite_account_type" db:"invite_account_type"`
	InviteReferralCount int               `json:"invite_referral_count" db:"invite_referral_count"`
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
	// InviteAccountType — приглашательный статус (DEFAULT/CLUB_PARTICIPANT)
	InviteAccountType InviteAccountType `json:"invite_account_type" db:"invite_account_type"`
	// InviteReferralCount — сколько пользователей уже зарегалось по его инвайт‑ссылке
	InviteReferralCount int `json:"invite_referral_count" db:"invite_referral_count"`
	// InvitedByUserID — идентификатор пользователя-пригласителя (sender), если есть
	InvitedByUserID *int64 `json:"invitedByUserId,omitempty" db:"invited_by_user_id"`
	// MasterID — идентификатор мастера. В зависимости от IsMasterFromTable
	// либо указывает на запись в таблице masters, либо на другого tarelka пользователя.
	MasterID *int64 `json:"masterId,omitempty" db:"master_id"`
	// IsMasterFromTable — если true, masterId ссылается на таблицу masters.
	// Если false, masterId трактуется как id другого tarelka пользователя.
	IsMasterFromTable bool      `json:"isMasterFromTable" db:"is_master_from_table"`
	CreatedAt         time.Time `json:"created_at" db:"created_at"`
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

// SenderInfo — краткая информация о пригласителе (sender), который инициировал регистрацию.
type SenderInfo struct {
	ID      int64  `json:"id"`
	Name    string `json:"name"`
	Surname string `json:"surname"`
}

// MasterInfo — информация о мастере пользователя.
// Может ссылаться либо на отдельную запись в таблице masters, либо на другого tarelka пользователя.
type MasterInfo struct {
	ID            int64  `json:"id"`
	Name          string `json:"name"`
	IsTarelkaUser bool   `json:"isTarelkaUser"`
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
	// Sender содержит краткую информацию о пользователе, по чьей инвайт-ссылке произошла регистрация.
	// Может быть nil, если пользователь зарегистрировался без инвайта или связь не зафиксирована.
	Sender *SenderInfo `json:"sender,omitempty"`
	// Master содержит информацию о мастере пользователя, если указан.
	Master *MasterInfo `json:"master,omitempty"`
}

// TeammateItem описывает «сокомандника» пользователя — другого пользователя,
// с которым есть общие публикации (как автора, так и соавтора).
// Логика определения совпадает с расчётом teammatesCount в профиле.
type TeammateItem struct {
	ID             int64   `json:"id"`
	FirstName      string  `json:"firstName"`
	LastName       string  `json:"lastName"`
	TelegramURL    *string `json:"telegramUrl,omitempty"`
	Specialization *string `json:"specialization,omitempty"`
	City           *string `json:"city,omitempty"`
}

// NotifiedUserItem описывает пользователя, которому текущий пользователь отправлял уведомления.
type NotifiedUserItem struct {
	ID             int64       `json:"id"`
	DisplayName    string      `json:"displayName"`
	LastName       string      `json:"lastName"`
	Username       string      `json:"username"`
	Type           AccountType `json:"type"`
	LogoURL        *string     `json:"logoUrl,omitempty"`
	TelegramURL    *string     `json:"telegramUrl,omitempty"`
	Specialization *string     `json:"specialization,omitempty"`
	City           *string     `json:"city,omitempty"`
}
