package service

import (
	"time"

	"github.com/Inc-Tarelka/api/internal/repository"
)

// Services содержит все сервисы
type Services struct {
	Auth        AuthService
	User        UserService
	Reference   ReferenceService
	Storage     StorageService
	Publication PublicationService
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
	VerificationTokenTTL time.Duration
	Storage              StorageService
}

// NewServices создаёт все сервисы
func NewServices(deps Deps) *Services {
	return &Services{
		Auth: NewAuthService(
			deps.Repos.TgUser,
			deps.Repos.TarelkaUser,
			deps.Repos.Reference,
			deps.Repos.Token,
			deps.TokenSecret,
			deps.AccessTokenTTL,
			deps.RefreshTokenTTL,
			deps.TelegramBotToken,
			deps.TelegramGatewayToken,
			deps.TelegramGatewayURL,
		),
		User:        NewUserService(deps.Repos.TarelkaUser, deps.Storage),
		Reference:   NewReferenceService(deps.Repos.Reference),
		Storage:     deps.Storage,
		Publication: NewPublicationService(deps.Repos.Publication),
	}
}
