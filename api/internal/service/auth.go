package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrInvalidInitData     = errors.New("invalid initData")
	ErrInitDataExpired     = errors.New("initData expired")
	ErrInvalidCredentials  = errors.New("invalid credentials")
	ErrInvalidToken        = errors.New("invalid token")
	ErrTokenExpired        = errors.New("token expired")
	ErrUserExists          = errors.New("user with this username already exists")
	ErrPhoneExists         = errors.New("user with this phone already exists")
	ErrInvalidReferences   = errors.New("invalid reference IDs")
	ErrInvalidAccountType  = errors.New("invalid account type")
	ErrCodeExpired         = errors.New("code_expired")
	ErrPhoneNotBound       = errors.New("phone_not_bound")
	ErrInvalidVerification = errors.New("invalid_verification")
	ErrPhoneMismatch       = errors.New("phone_mismatch")
)

const (
	initDataMaxAge = 240 * time.Hour // Максимальный возраст initData
)

type AuthService interface {
	// RegisterViaTelegram завершает регистрацию через Telegram Mini App (stage 1/2)
	RegisterViaTelegram(ctx context.Context, req *model.RegisterRequest) (*model.RegisterResponse, error)
	// PreRegister создаёт базового пользователя (stage 0) по initData и учётным данным
	PreRegister(ctx context.Context, req *model.PreRegisterRequest) (*model.PreRegisterResponse, error)
	// GenerateInviteSenderID генерирует senderId для текущего пользователя для формирования инвайт-ссылки.
	GenerateInviteSenderID(ctx context.Context, userID int64) (string, error)
	Login(ctx context.Context, req *model.LoginRequest) (*model.LoginResponse, error)
	RefreshTokens(ctx context.Context, refreshToken string) (*model.RefreshResponse, error)
	ValidateAccessToken(token string) (*model.JWTClaims, error)
	Logout(ctx context.Context, refreshToken string) error
	// SendPhoneVerification отправляет SMS/Telegram-код на номер телефона через Telegram Gateway
	// и возвращает идентификатор запроса
	SendPhoneVerification(ctx context.Context, phone string) (*model.SendPhoneVerificationResponse, error)
	// VerifyPhoneCode выполняет раннюю проверку кода верификации через Telegram Gateway
	VerifyPhoneCode(ctx context.Context, requestID, code string) (*model.VerifyCodeResponse, error)
	// ValidateInviteAndIncrement проверяет senderID и увеличивает счётчик приглашений.
	ValidateInviteAndIncrement(ctx context.Context, senderID string) error
	// BeginPasswordReset отправляет код на телефон, привязанный к пользователю (по username)
	BeginPasswordReset(ctx context.Context, username string) (*model.SendPhoneVerificationResponse, error)
	// ResetPasswordWithCode проверяет код через Gateway, сверяет телефон и меняет пароль
	ResetPasswordWithCode(ctx context.Context, username, requestID, code, newPassword string) error
}

type authService struct {
	tgUserRepo      repository.TgUserRepository
	tarelkaUserRepo repository.TarelkaUserRepository
	referenceRepo   repository.ReferenceRepository
	tokenRepo       repository.TokenRepository
	regLogRepo      repository.RegistrationLogRepository

	jwtSecret       string
	accessTokenTTL  time.Duration
	refreshTokenTTL time.Duration
	botToken        string
	gatewayToken    string
	gatewayURL      string
	// inviteSecret используется для подписи/проверки senderID.
	inviteSecret string
	// proxySecret добавляется в заголовок X-Secret при обращении к Telegram Gateway
	// (например, при проксировании через Cloudflare Workers).
	proxySecret string
}

func NewAuthService(
	tgUserRepo repository.TgUserRepository,
	tarelkaUserRepo repository.TarelkaUserRepository,
	referenceRepo repository.ReferenceRepository,
	tokenRepo repository.TokenRepository,
	regLogRepo repository.RegistrationLogRepository,
	jwtSecret string,
	accessTokenTTL time.Duration,
	refreshTokenTTL time.Duration,
	botToken string,
	gatewayToken string,
	gatewayURL string,
	inviteSecret string,
	proxySecret string,
) AuthService {
	return &authService{
		tgUserRepo:      tgUserRepo,
		tarelkaUserRepo: tarelkaUserRepo,
		referenceRepo:   referenceRepo,
		tokenRepo:       tokenRepo,
		regLogRepo:      regLogRepo,
		jwtSecret:       jwtSecret,
		accessTokenTTL:  accessTokenTTL,
		refreshTokenTTL: refreshTokenTTL,
		botToken:        botToken,
		gatewayToken:    gatewayToken,
		gatewayURL:      gatewayURL,
		inviteSecret:    inviteSecret,
		proxySecret:     proxySecret,
	}
}

// validateInviteAndIncrement внутренний помощник, который повторяет логику ValidateInviteAndIncrement,
// но дополнительно возвращает ID пользователя-пригласителя. Используется при pre-register,
// чтобы сохранить связь sender -> invited user.
func (s *authService) validateInviteAndIncrement(ctx context.Context, senderID string) (int64, error) {
	if strings.TrimSpace(senderID) == "" {
		return 0, fmt.Errorf("invite_required")
	}
	if s.inviteSecret == "" {
		return 0, fmt.Errorf("invite_not_configured")
	}

	tgID, err := decodeSenderID(senderID, s.inviteSecret)
	if err != nil {
		return 0, fmt.Errorf("invalid_sender_id")
	}

	inviter, err := s.tarelkaUserRepo.FindByTgUserID(ctx, tgID)
	if err != nil {
		return 0, err
	}

	_, _, err = s.tarelkaUserRepo.IncreaseInviteCountWithLimit(ctx, inviter.ID)
	if err != nil {
		// если лимит исчерпан или пользователя нет — считаем, что инвайт недействителен
		return 0, fmt.Errorf("invite_limit_reached")
	}

	return inviter.ID, nil
}

// ValidateInviteAndIncrement проверяет senderID и увеличивает счётчик приглашённых у инвайтера.
// Правила:
//   - если senderID пустой или inviteSecret не задан — возвращаем ошибку
//   - декодируем senderID в telegramID
//   - находим пользователя по tg_user_id
//   - атомарно инкрементим invite_referral_count с учётом лимита.
func (s *authService) ValidateInviteAndIncrement(ctx context.Context, senderID string) error {
	_, err := s.validateInviteAndIncrement(ctx, senderID)
	return err
}

// encodeSenderID кодирует telegramID в безопасную строку senderID.
// Формат: base64url("<tgID>:<hex(hmac_sha256(secret, tgID))>")
func encodeSenderID(tgID int64, secret string) string {
	data := fmt.Sprintf("%d", tgID)
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	sig := hex.EncodeToString(h.Sum(nil))
	plain := fmt.Sprintf("%s:%s", data, sig)
	return base64.RawURLEncoding.EncodeToString([]byte(plain))
}

// decodeSenderID декодирует senderID обратно в telegramID и проверяет подпись.
func decodeSenderID(senderID, secret string) (int64, error) {
	buf, err := base64.RawURLEncoding.DecodeString(senderID)
	if err != nil {
		return 0, err
	}
	parts := strings.SplitN(string(buf), ":", 2)
	if len(parts) != 2 {
		return 0, fmt.Errorf("invalid format")
	}
	data, sigHex := parts[0], parts[1]
	h := hmac.New(sha256.New, []byte(secret))
	h.Write([]byte(data))
	expectedSig := hex.EncodeToString(h.Sum(nil))
	if !hmac.Equal([]byte(expectedSig), []byte(sigHex)) {
		return 0, fmt.Errorf("invalid signature")
	}
	return strconv.ParseInt(data, 10, 64)
}

// GenerateInviteSenderID генерирует senderId для формирования инвайт-ссылки для указанного пользователя.
// Для DEFAULT-пользователя дополнительно проверяется, что лимит приглашённых ещё не исчерпан
// (invite_referral_count < 5). Для CLUB_PARTICIPANT ограничений нет.
func (s *authService) GenerateInviteSenderID(ctx context.Context, userID int64) (string, error) {
	if s.inviteSecret == "" {
		return "", fmt.Errorf("invite_not_configured")
	}

	user, err := s.tarelkaUserRepo.FindByID(ctx, userID)
	if err != nil {
		return "", err
	}

	if user.InviteAccountType == model.InviteAccountTypeDefault && user.InviteReferralCount >= 5 {
		return "", fmt.Errorf("invite_limit_reached")
	}

	return encodeSenderID(user.TgUserID, s.inviteSecret), nil
}

// PreRegister создаёт базового пользователя (stage 0) до подтверждения телефона.
// На этом шаге:
//   - валидируем initData и получаем telegramID
//   - проверяем и списываем инвайт по senderId (если включён закрытый режим)
//   - проверяем уникальность username
//   - создаём или находим tg_user
//   - хэшируем пароль
//   - создаём tarelka_user с conversation = 0 без подтипа и связей
//
// Токены здесь НЕ выдаются.
func (s *authService) PreRegister(ctx context.Context, req *model.PreRegisterRequest) (*model.PreRegisterResponse, error) {
	// 0. Проверка и применение инвайта (senderID) + получение ID пригласителя
	inviterID, err := s.validateInviteAndIncrement(ctx, req.SenderID)
	if err != nil {
		return nil, err
	}

	// 1. Валидация initData и извлечение telegramID
	telegramID, err := s.validateInitData(req.InitData)
	if err != nil {
		return nil, err
	}

	// 2. Проверка уникальности username
	exists, err := s.tarelkaUserRepo.ExistsByUsername(ctx, req.Account.Username)
	if err != nil {
		return nil, fmt.Errorf("check username: %w", err)
	}
	if exists {
		return nil, ErrUserExists
	}

	// 3. Базовая валидация и нормализация телефона (без проверки кода)
	var phonePtr *string
	if req.Account.Phone != "" {
		if !isValidPhone(req.Account.Phone) {
			return nil, fmt.Errorf("invalid phone format")
		}
		norm := normalizePhone(req.Account.Phone)
		phonePtr = &norm
	}

	// 4. Найти или создать tg_user
	tgUser, err := s.tgUserRepo.FindOrCreate(ctx, telegramID)
	if err != nil {
		return nil, fmt.Errorf("find or create tg user: %w", err)
	}

	// 5. Хэширование пароля
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(req.Account.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("hash password: %w", err)
	}

	// 6. Создание tarelka_user с conversation = 0
	user := &model.TarelkaUser{
		TgUserID:        tgUser.TelegramID,
		Type:            req.Account.Type,
		Username:        req.Account.Username,
		Phone:           phonePtr,
		PasswordHash:    string(passwordHash),
		Conversation:    0,
		InvitedByUserID: &inviterID,
	}

	user, err = s.tarelkaUserRepo.Create(ctx, user)
	if err != nil {
		return nil, fmt.Errorf("create tarelka user (pre-register): %w", err)
	}

	// Log registration stage 0 (pre-register created)
	if s.regLogRepo != nil {
		stage := 0
		_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
			TarelkaUserID:     &user.ID,
			Phone:             user.Phone,
			Event:             model.RegistrationEventPreRegisterCreated,
			ActionFlag:        model.RegistrationActionSuccess,
			ConversationStage: &stage,
			Metadata: map[string]any{
				"username": user.Username,
				"source":   "pre_register",
			},
		})
	}

	return &model.PreRegisterResponse{UserID: user.ID}, nil
}

// RegisterViaTelegram регистрация через Telegram Mini App

func (s *authService) RegisterViaTelegram(ctx context.Context, req *model.RegisterRequest) (*model.RegisterResponse, error) {
	// 0. Инвайт уже был проверен и применён на этапе pre-register, здесь ничего не делаем.

	// 1. Валидация initData
	telegramID, err := s.validateInitData(req.InitData)
	if err != nil {
		return nil, err
	}

	// 2. Проверка существования справочников
	var exists bool
	if len(req.SpecializationIDs) > 0 {
		exists, err = s.referenceRepo.SpecializationsExist(ctx, req.SpecializationIDs)
		if err != nil || !exists {
			return nil, ErrInvalidReferences
		}
	}

	if len(req.DirectionIDs) > 0 {
		exists, err = s.referenceRepo.DirectionsExist(ctx, req.DirectionIDs)
		if err != nil || !exists {
			return nil, ErrInvalidReferences
		}
	}

	if len(req.CityIDs) > 0 {
		exists, err = s.referenceRepo.CitiesExist(ctx, req.CityIDs)
		if err != nil || !exists {
			return nil, ErrInvalidReferences
		}
	}

	// 4. Найти существующего пользователя после pre-register
	tarelkaUser, err := s.tarelkaUserRepo.FindByUsername(ctx, req.Account.Username)
	if err != nil {
		return nil, fmt.Errorf("find preregistered user: %w", err)
	}

	// Дополнительная защита: убеждаемся, что пользователь привязан к тому же Telegram ID
	if tarelkaUser.TgUserID != telegramID {
		return nil, fmt.Errorf("invalid_initData_for_username")
	}

	// Обновляем телефон (он к этому моменту уже прошёл проверку через шлюз)
	if req.Account.Phone != "" {
		normalized := normalizePhone(req.Account.Phone)
		tarelkaUser.Phone = &normalized
	}

	// 5. Определяем целевой stage по профилю
	stage := 1
	if strings.TrimSpace(req.Account.Name) != "" && strings.TrimSpace(req.Account.Surname) != "" {
		stage = 2
	}

	// 6. Создание subtype на основе уже существующего tarelka_user
	switch req.Account.Type {
	case model.AccountTypePerson:
		person := &model.TarelkaPerson{
			TarelkaUserID: tarelkaUser.ID,
			Name:          req.Account.Name,
			Surname:       req.Account.Surname,
		}
		if err := s.tarelkaUserRepo.CreatePerson(ctx, person); err != nil {
			return nil, fmt.Errorf("create person: %w", err)
		}
	case model.AccountTypeCompany:
		company := &model.TarelkaCompany{
			TarelkaUserID: tarelkaUser.ID,
			CompanyName:   req.Account.CompanyName,
		}
		if err := s.tarelkaUserRepo.CreateCompany(ctx, company); err != nil {
			return nil, fmt.Errorf("create company: %w", err)
		}
	default:
		return nil, ErrInvalidAccountType
	}

	// 7. Создание связей
	if err := s.tarelkaUserRepo.AddSpecializations(ctx, tarelkaUser.ID, req.SpecializationIDs); err != nil {
		return nil, fmt.Errorf("add specializations: %w", err)
	}
	if err := s.tarelkaUserRepo.AddDirections(ctx, tarelkaUser.ID, req.DirectionIDs); err != nil {
		return nil, fmt.Errorf("add directions: %w", err)
	}
	if err := s.tarelkaUserRepo.AddCities(ctx, tarelkaUser.ID, req.CityIDs); err != nil {
		return nil, fmt.Errorf("add cities: %w", err)
	}

	// 8. Обновляем стадию conversation: 1 или 2 в зависимости от профиля
	if err := s.tarelkaUserRepo.UpdateConversation(ctx, tarelkaUser.ID, stage); err != nil {
		return nil, fmt.Errorf("update conversation: %w", err)
	}

	// Log registration completion for stage 1 or 2
	if s.regLogRepo != nil {
		convStage := stage
		event := model.RegistrationEventRegisterStage1Completed
		if stage >= 2 {
			event = model.RegistrationEventRegisterStage2Completed
		}
		_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
			TarelkaUserID:     &tarelkaUser.ID,
			Phone:             tarelkaUser.Phone,
			Event:             event,
			ActionFlag:        model.RegistrationActionSuccess,
			ConversationStage: &convStage,
			Metadata: map[string]any{
				"account_type": tarelkaUser.Type,
			},
		})
	}

	// 9. Генерация токенов
	tokens, err := s.generateTokenPair(ctx, tarelkaUser.ID, tarelkaUser.Type)
	if err != nil {
		return nil, fmt.Errorf("generate tokens: %w", err)
	}

	return &model.RegisterResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		UserID:       tarelkaUser.ID,
	}, nil
}

// Login авторизация по username/паролю
func (s *authService) Login(ctx context.Context, req *model.LoginRequest) (*model.LoginResponse, error) {
	// Авторизация по уникальному username
	user, err := s.tarelkaUserRepo.FindByUsername(ctx, req.Username)
	if err != nil {
		return nil, ErrInvalidCredentials
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return nil, ErrInvalidCredentials
	}

	tokens, err := s.generateTokenPair(ctx, user.ID, user.Type)
	if err != nil {
		return nil, fmt.Errorf("generate tokens: %w", err)
	}

	return &model.LoginResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		UserID:       user.ID,
	}, nil
}

// RefreshTokens обновление токенов
func (s *authService) RefreshTokens(ctx context.Context, refreshToken string) (*model.RefreshResponse, error) {
	// Найти токен в БД
	rt, err := s.tokenRepo.FindRefreshToken(ctx, refreshToken)
	if err != nil {
		return nil, ErrInvalidToken
	}

	// Проверить не отозван ли
	if rt.Revoked {
		return nil, ErrInvalidToken
	}

	// Проверить срок жизни
	if time.Now().After(rt.ExpiresAt) {
		return nil, ErrTokenExpired
	}

	// Получить пользователя
	user, err := s.tarelkaUserRepo.FindByID(ctx, rt.TarelkaUserID)
	if err != nil {
		return nil, fmt.Errorf("find user: %w", err)
	}

	// Отозвать старый токен
	if err := s.tokenRepo.RevokeRefreshToken(ctx, refreshToken); err != nil {
		return nil, fmt.Errorf("revoke token: %w", err)
	}

	// Сгенерировать новые токены
	tokens, err := s.generateTokenPair(ctx, user.ID, user.Type)
	if err != nil {
		return nil, fmt.Errorf("generate tokens: %w", err)
	}

	return &model.RefreshResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	}, nil
}

// ValidateAccessToken проверка access token
func (s *authService) ValidateAccessToken(tokenString string) (*model.JWTClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, ErrInvalidToken
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, ok := claims["user_id"].(float64)
		if !ok {
			return nil, ErrInvalidToken
		}

		userType, ok := claims["user_type"].(string)
		if !ok {
			return nil, ErrInvalidToken
		}

		return &model.JWTClaims{
			UserID:   int64(userID),
			UserType: model.AccountType(userType),
		}, nil
	}

	return nil, ErrInvalidToken
}

// Logout выход (отзыв refresh token)
func (s *authService) Logout(ctx context.Context, refreshToken string) error {
	return s.tokenRepo.RevokeRefreshToken(ctx, refreshToken)
}

// SendPhoneVerification отправляет запрос на отправку кода через Telegram Gateway
func (s *authService) SendPhoneVerification(ctx context.Context, phone string) (*model.SendPhoneVerificationResponse, error) {
	// базовая валидация и нормализация телефона
	if phone == "" || !isValidPhone(phone) {
		return nil, fmt.Errorf("invalid phone format")
	}

	normalized := normalizePhone(phone)

	// Подготовка HTTP-запроса к Telegram Gateway
	endpoint := strings.TrimRight(s.gatewayURL, "/") + "/sendVerificationMessage"

	// По требованию используем длину кода 4
	type gatewayReq struct {
		PhoneNumber string `json:"phone_number"`
		CodeLength  int    `json:"code_length"`
	}
	type gatewayResp struct {
		OK     bool `json:"ok"`
		Result struct {
			RequestID string `json:"request_id"`
		} `json:"result"`
		Error string `json:"error,omitempty"`
	}

	reqBody, err := json.Marshal(gatewayReq{PhoneNumber: normalized, CodeLength: 4})
	if err != nil {
		return nil, err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(string(reqBody)))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	if s.gatewayToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.gatewayToken)
	}
	if s.proxySecret != "" {
		req.Header.Set("X-Secret", s.proxySecret)
	}

	httpClient := &http.Client{Timeout: 5 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		return nil, fmt.Errorf("gateway_unavailable")
	}

	var gr gatewayResp
	dec := json.NewDecoder(resp.Body)
	if err := dec.Decode(&gr); err != nil {
		return nil, err
	}

	if !gr.OK {
		if gr.Error != "" {
			return nil, fmt.Errorf(gr.Error)
		}
		return nil, fmt.Errorf("gateway_error")
	}

	// Log successful sending of verification code
	if s.regLogRepo != nil {
		normalizedCopy := normalized
		_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
			Phone:      &normalizedCopy,
			Event:      model.RegistrationEventPhoneCodeSent,
			ActionFlag: model.RegistrationActionSuccess,
			Metadata: map[string]any{
				"request_id": gr.Result.RequestID,
			},
		})
	}

	return &model.SendPhoneVerificationResponse{RequestID: gr.Result.RequestID}, nil
}

// VerifyPhoneCode ранняя проверка кода через Telegram Gateway
func (s *authService) VerifyPhoneCode(ctx context.Context, requestID, code string) (*model.VerifyCodeResponse, error) {
	ok, phone, err := s.verifyPhoneWithGateway(ctx, requestID, code)
	if err != nil {
		if errors.Is(err, ErrCodeExpired) {
			if s.regLogRepo != nil {
				_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
					Event:      model.RegistrationEventPhoneCodeExpired,
					ActionFlag: model.RegistrationActionFailure,
					Metadata: map[string]any{
						"request_id": requestID,
					},
				})
			}
			return &model.VerifyCodeResponse{Status: "expired"}, nil
		}
		if s.regLogRepo != nil {
			_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
				Event:      model.RegistrationEventPhoneCodeInvalid,
				ActionFlag: model.RegistrationActionFailure,
				Metadata: map[string]any{
					"request_id": requestID,
					"error":      err.Error(),
				},
			})
		}
		return &model.VerifyCodeResponse{Status: "error"}, nil
	}
	if ok {
		norm := normalizePhone(phone)
		if s.regLogRepo != nil {
			_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
				Phone:      &norm,
				Event:      model.RegistrationEventPhoneCodeVerified,
				ActionFlag: model.RegistrationActionSuccess,
				Metadata: map[string]any{
					"request_id": requestID,
				},
			})
		}
		return &model.VerifyCodeResponse{Status: "ok", Phone: norm}, nil
	}
	if s.regLogRepo != nil {
		_ = s.regLogRepo.LogEvent(ctx, &repository.RegistrationLogEntry{
			Event:      model.RegistrationEventPhoneCodeInvalid,
			ActionFlag: model.RegistrationActionFailure,
			Metadata: map[string]any{
				"request_id": requestID,
			},
		})
	}
	return &model.VerifyCodeResponse{Status: "invalid"}, nil
}

// BeginPasswordReset отправляет код на привязанный телефон пользователя по username
func (s *authService) BeginPasswordReset(ctx context.Context, username string) (*model.SendPhoneVerificationResponse, error) {
	// Найти пользователя по username
	user, err := s.tarelkaUserRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, err
	}
	if user.Phone == nil || *user.Phone == "" {
		return nil, ErrPhoneNotBound
	}

	// Отправить код на телефон пользователя
	return s.SendPhoneVerification(ctx, *user.Phone)
}

// ResetPasswordWithCode проверяет код через Gateway, сверяет телефон и меняет пароль
func (s *authService) ResetPasswordWithCode(ctx context.Context, username, requestID, code, newPassword string) error {
	// Найти пользователя
	user, err := s.tarelkaUserRepo.FindByUsername(ctx, username)
	if err != nil {
		return err
	}
	if user.Phone == nil || *user.Phone == "" {
		return ErrPhoneNotBound
	}

	// Проверить код через Telegram Gateway
	ok, phoneFromGateway, err := s.verifyPhoneWithGateway(ctx, requestID, code)
	if err != nil {
		if errors.Is(err, ErrCodeExpired) {
			return ErrCodeExpired
		}
		return err
	}
	if !ok {
		return ErrInvalidVerification
	}

	// Сверить номер телефона из Gateway с номером в БД
	if normalizePhone(phoneFromGateway) != normalizePhone(*user.Phone) {
		return ErrPhoneMismatch
	}

	// Хэшировать новый пароль и обновить в БД
	passwordHash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}
	if err := s.tarelkaUserRepo.UpdatePasswordHash(ctx, user.ID, string(passwordHash)); err != nil {
		return fmt.Errorf("update password: %w", err)
	}

	// Отозвать все refresh токены пользователя
	if err := s.tokenRepo.RevokeAllUserTokens(ctx, user.ID); err != nil {
		return fmt.Errorf("revoke tokens: %w", err)
	}

	return nil
}

// validateInitData валидация initData от Telegram
func (s *authService) validateInitData(initData string) (int64, error) {
	// Парсинг initData
	values, err := url.ParseQuery(initData)
	if err != nil {
		return 0, ErrInvalidInitData
	}

	// Извлечение hash
	hash := values.Get("hash")
	if hash == "" {
		return 0, ErrInvalidInitData
	}
	values.Del("hash")

	// Проверка auth_date
	authDateStr := values.Get("auth_date")
	if authDateStr == "" {
		return 0, ErrInvalidInitData
	}
	authDate, err := strconv.ParseInt(authDateStr, 10, 64)
	if err != nil {
		return 0, ErrInvalidInitData
	}

	// Проверка возраста initData
	if time.Since(time.Unix(authDate, 0)) > initDataMaxAge {
		return 0, ErrInitDataExpired
	}

	// Формирование data-check-string
	var keys []string
	for key := range values {
		keys = append(keys, key)
	}
	sort.Strings(keys)

	var dataCheckString strings.Builder
	for i, key := range keys {
		if i > 0 {
			dataCheckString.WriteString("\n")
		}
		dataCheckString.WriteString(key)
		dataCheckString.WriteString("=")
		dataCheckString.WriteString(values.Get(key))
	}

	// Вычисление secret key
	secretKey := hmac.New(sha256.New, []byte("WebAppData"))
	secretKey.Write([]byte(s.botToken))

	// Вычисление hash
	h := hmac.New(sha256.New, secretKey.Sum(nil))
	h.Write([]byte(dataCheckString.String()))
	calculatedHash := hex.EncodeToString(h.Sum(nil))

	// Сравнение
	if calculatedHash != hash {
		return 0, ErrInvalidInitData
	}

	// Извлечение telegram_id из user
	userStr := values.Get("user")
	if userStr == "" {
		return 0, ErrInvalidInitData
	}

	// Простой парсинг user JSON для извлечения id
	// В продакшене используйте json.Unmarshal
	telegramID, err := extractTelegramID(userStr)
	if err != nil {
		return 0, ErrInvalidInitData
	}

	return telegramID, nil
}

// generateTokenPair генерация пары токенов
func (s *authService) generateTokenPair(ctx context.Context, userID int64, userType model.AccountType) (*model.TokenPair, error) {
	// Access token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id":   userID,
		"user_type": string(userType),
		"exp":       time.Now().Add(s.accessTokenTTL).Unix(),
		"iat":       time.Now().Unix(),
	})

	accessTokenString, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return nil, err
	}

	// Refresh token
	refreshTokenString := uuid.New().String()

	refreshToken := &model.RefreshToken{
		TarelkaUserID: userID,
		Token:         refreshTokenString,
		ExpiresAt:     time.Now().Add(s.refreshTokenTTL),
	}

	if err := s.tokenRepo.CreateRefreshToken(ctx, refreshToken); err != nil {
		return nil, err
	}

	return &model.TokenPair{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
	}, nil
}

// extractTelegramID извлекает telegram_id из JSON строки user
func extractTelegramID(userJSON string) (int64, error) {
	// Простой парсинг для поиска "id": number
	// В продакшене лучше использовать json.Unmarshal
	startIdx := strings.Index(userJSON, `"id":`)
	if startIdx == -1 {
		return 0, errors.New("id not found in user json")
	}

	startIdx += 5 // len(`"id":`)

	// Пропуск пробелов
	for startIdx < len(userJSON) && userJSON[startIdx] == ' ' {
		startIdx++
	}

	endIdx := startIdx
	for endIdx < len(userJSON) && userJSON[endIdx] >= '0' && userJSON[endIdx] <= '9' {
		endIdx++
	}

	if endIdx == startIdx {
		return 0, errors.New("invalid id format")
	}

	return strconv.ParseInt(userJSON[startIdx:endIdx], 10, 64)
}

// isPhone определяет, что строка похожа на номер телефона
func isPhone(s string) bool {
	// Простая эвристика: нет '@' и только +цифры
	if strings.Contains(s, "@") {
		return false
	}
	for _, r := range s {
		if !(r == '+' || (r >= '0' && r <= '9')) {
			return false
		}
	}
	// Минимальная длина
	return len(s) >= 10
}

// isValidPhone валидация телефона (упрощённая, можно заменить на полноценную E.164)
func isValidPhone(s string) bool {
	return isPhone(s)
}

// normalizePhone очищает формат телефона для сравнения
func normalizePhone(s string) string {
	return strings.TrimSpace(strings.TrimPrefix(s, "+"))
}

// verifyPhoneWithGateway вызывает Telegram Gateway checkVerificationStatus
func (s *authService) verifyPhoneWithGateway(ctx context.Context, requestID, code string) (bool, string, error) {
	if requestID == "" || code == "" {
		return false, "", fmt.Errorf("missing verification data")
	}

	// Подготовка HTTP-запроса к Telegram Gateway
	endpoint := strings.TrimRight(s.gatewayURL, "/") + "/checkVerificationStatus"

	type gatewayReq struct {
		RequestID string `json:"request_id"`
		Code      string `json:"code"`
	}
	// Expecting: { "ok": true, "result": { "request_id": "...", "phone_number": "...", "verification_status": { "status": "code_valid" | "code_invalid" | "code_expired" } } }
	type gatewayResp struct {
		OK     bool `json:"ok"`
		Result struct {
			RequestID          string `json:"request_id"`
			PhoneNumber        string `json:"phone_number"`
			VerificationStatus struct {
				Status string `json:"status"`
			} `json:"verification_status"`
		} `json:"result"`
		Error string `json:"error,omitempty"`
	}

	// Marshal body
	bodyBytes, err := json.Marshal(gatewayReq{RequestID: requestID, Code: code})
	if err != nil {
		return false, "", err
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, endpoint, strings.NewReader(string(bodyBytes)))
	if err != nil {
		return false, "", err
	}
	req.Header.Set("Content-Type", "application/json")
	if s.gatewayToken != "" {
		req.Header.Set("Authorization", "Bearer "+s.gatewayToken)
	}
	if s.proxySecret != "" {
		req.Header.Set("X-Secret", s.proxySecret)
	}

	httpClient := &http.Client{Timeout: 5 * time.Second}
	resp, err := httpClient.Do(req)
	if err != nil {
		return false, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 500 {
		return false, "", fmt.Errorf("gateway_unavailable")
	}

	// Read and decode
	var gr gatewayResp
	dec := json.NewDecoder(resp.Body)
	if err := dec.Decode(&gr); err != nil {
		return false, "", err
	}

	if !gr.OK {
		if gr.Error != "" {
			return false, "", fmt.Errorf(gr.Error)
		}
		return false, "", nil
	}

	switch gr.Result.VerificationStatus.Status {
	case "code_valid":
		return true, gr.Result.PhoneNumber, nil
	case "code_invalid":
		return false, "", nil
	case "code_expired":
		return false, "", ErrCodeExpired
	default:
		return false, "", nil
	}
}
