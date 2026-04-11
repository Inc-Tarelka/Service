package service

import (
	"time"

	"github.com/Inc-Tarelka/api/internal/repository"
)

// Services содержит все сервисы
type Services struct {
	Auth         AuthService
	User         UserService
	Reference    ReferenceService
	Storage      StorageService
	Publication  PublicationService
	Activity     ActivityService
	Notification NotificationService
	Repos        *repository.Repositories
}

// Deps зависимости для создания сервисов
type Deps struct {
	Repos                *repository.Repositories
	TokenSecret          string
	AccessTokenTTL       time.Duration
	RefreshTokenTTL      time.Duration
	TelegramBotToken     string
	TelegramGatewayToken string
	TelegramGatewayURL   string
	InviteSecret         string
	VerificationTokenTTL time.Duration
	Storage              StorageService
	// TelegramAPIBaseURL и TelegramProxySecret используются для проксирования
	// запросов к Telegram Bot API и Telegram Gateway через внешний воркер.
	TelegramAPIBaseURL  string
	TelegramProxySecret string
}

// NewServices создаёт все сервисы
func NewServices(deps Deps) *Services {
	activitySvc := NewActivityService(deps.Repos.Activity)
	return &Services{
		Auth: NewAuthService(
			deps.Repos.TgUser,
			deps.Repos.TarelkaUser,
			deps.Repos.Reference,
			deps.Repos.Token,
			deps.Repos.RegLog,
			deps.TokenSecret,
			deps.AccessTokenTTL,
			deps.RefreshTokenTTL,
			deps.TelegramBotToken,
			deps.TelegramGatewayToken,
			deps.TelegramGatewayURL,
			deps.InviteSecret,
			deps.TelegramProxySecret,
		),
		User:        NewUserService(deps.Repos.TarelkaUser, deps.Repos.Publication, deps.Repos.Notification, deps.Storage),
		Reference:   NewReferenceService(deps.Repos.Reference),
		Storage:     deps.Storage,
		Publication: NewPublicationService(deps.Repos.Publication, deps.Storage, activitySvc),
		Activity:    activitySvc,
		Notification: NewNotificationService(
			deps.Repos.Notification,
			deps.Repos.TarelkaUser,
			deps.Repos.Publication,
			deps.TelegramBotToken,
			deps.TelegramAPIBaseURL,
			deps.TelegramProxySecret,
		),
		Repos: deps.Repos,
	}
}
