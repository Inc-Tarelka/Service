package repository

import (
	"github.com/jackc/pgx/v5/pgxpool"
)

// Repositories содержит все репозитории
type Repositories struct {
	TgUser       TgUserRepository
	TarelkaUser  TarelkaUserRepository
	Reference    ReferenceRepository
	Token        TokenRepository
	Publication  PublicationRepository
	Activity     ActivityRepository
	Notification NotificationRepository
}

// NewRepositories создаёт все репозитории
func NewRepositories(pool *pgxpool.Pool) *Repositories {
	return &Repositories{
		TgUser:       NewTgUserRepository(pool),
		TarelkaUser:  NewTarelkaUserRepository(pool),
		Reference:    NewReferenceRepository(pool),
		Token:        NewTokenRepository(pool),
		Publication:  NewPublicationRepository(pool),
		Activity:     NewActivityRepository(pool),
		Notification: NewNotificationRepository(pool),
	}
}
