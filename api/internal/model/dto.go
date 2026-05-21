package model

// RegisterRequest - запрос на регистрацию через Telegram
type RegisterRequest struct {
	InitData          string            `json:"initData" binding:"required"`
	Account           AccountData       `json:"account" binding:"required"`
	SpecializationIDs []int64           `json:"specializationIds"`
	DirectionIDs      []int64           `json:"directionIds"`
	CityIDs           []int64           `json:"cityIds"`
	PhoneVerification PhoneVerification `json:"phoneVerification,omitempty"`
	// senderID — зашифрованный идентификатор пригласителя из Telegram Mini App.
	// Сейчас не используется (регистрация открыта), оставлено для совместимости.
	SenderID string `json:"senderId,omitempty"`
}

// AccountData - данные аккаунта при регистрации
type AccountData struct {
	Type     AccountType `json:"type" binding:"required,oneof=PERSON COMPANY"`
	Username string      `json:"username" binding:"required"`
	Phone    string      `json:"phone" binding:"required"`
	Password string      `json:"password" binding:"required,min=6"`

	// Для PERSON
	Name    string `json:"name,omitempty"`
	Surname string `json:"surname,omitempty"`

	// Для COMPANY
	CompanyName string `json:"companyName,omitempty"`
}

// PhoneVerification - данные подтверждения телефона для поля phone
type PhoneVerification struct {
	RequestID string `json:"verificationRequestId,omitempty"`
	Code      string `json:"verificationCode,omitempty"`
}

// RegisterResponse - ответ на регистрацию
type RegisterResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	UserID       int64  `json:"userId"`
}

// PreRegisterRequest - предварительный шаг регистрации (stage 0)
// Создаёт базовую учётку с username/phone/password и initData без проверки кода телефона и без выдачи токенов.
type PreRegisterRequest struct {
	InitData string      `json:"initData" binding:"required"`
	Account  AccountData `json:"account" binding:"required"`
	// senderID — зашифрованный идентификатор пригласителя из Telegram Mini App.
	// Сейчас не используется (регистрация открыта), оставлено для совместимости.
	SenderID string `json:"senderId,omitempty"`
}

// InviteLinkResponse - ответ с данными для формирования пригласительной ссылки
// Сейчас endpoint отключён, структура сохранена для обратной совместимости.
type InviteLinkResponse struct {
	// SenderID — зашифрованный идентификатор пригласителя, который нужно передавать в startapp
	SenderID string `json:"senderId"`
}

// PreRegisterResponse - ответ на предварительную регистрацию
// Возвращает ID созданного пользователя, чтобы фронт мог ссылаться на него при следующих шагах.
type PreRegisterResponse struct {
	UserID int64 `json:"userId"`
}

// RefreshRequest - запрос на обновление токена
type RefreshRequest struct {
	RefreshToken string `json:"refreshToken" binding:"required"`
}

// RefreshResponse - ответ на обновление токена
type RefreshResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// LoginRequest - запрос на логин
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginResponse - ответ на логин
type LoginResponse struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
	UserID       int64  `json:"userId"`
}

// ErrorResponse - стандартный ответ ошибки
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

// SuccessResponse - стандартный успешный ответ
type SuccessResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
}

// VerifyCodeRequest - простой запрос на проверку кода телефона
type VerifyCodeRequest struct {
	VerificationRequestID string `json:"verificationRequestId" binding:"required"`
	VerificationCode      string `json:"verificationCode" binding:"required"`
}

// VerifyCodeResponse - результат проверки кода
// Возможные значения Status: ok | invalid | expired | error
type VerifyCodeResponse struct {
	Status string `json:"status"`
	Phone  string `json:"phone,omitempty"`
}

// SendPhoneVerificationRequest - запрос на отправку кода верификации телефона
type SendPhoneVerificationRequest struct {
	PhoneNumber string `json:"phoneNumber" binding:"required"`
}

// SendPhoneVerificationResponse - ответ с идентификатором запроса на верификацию
type SendPhoneVerificationResponse struct {
	RequestID string `json:"requestId"`
}

// PasswordForgotRequest - запрос на отправку кода для восстановления пароля по username
type PasswordForgotRequest struct {
	Username string `json:"username" binding:"required"`
}

// PasswordForgotResponse - ответ с идентификатором запроса на верификацию
type PasswordForgotResponse struct {
	RequestID string `json:"requestId"`
}

// PasswordResetRequest - прямой запрос на смену пароля с проверкой кода
type PasswordResetRequest struct {
	Username              string `json:"username" binding:"required"`
	VerificationRequestID string `json:"verificationRequestId" binding:"required"`
	VerificationCode      string `json:"verificationCode" binding:"required"`
	NewPassword           string `json:"newPassword" binding:"required,min=6"`
}

// PasswordResetResponse - стандартный ответ на успешную смену пароля
type PasswordResetResponse struct {
	Success bool `json:"success"`
}

// PresignUploadRequest - запрос на генерацию presigned URL для загрузки
type PresignUploadRequest struct {
	ContentType string `json:"contentType" binding:"required"`
}

// PresignUploadResponse - ответ с данными для загрузки
type PresignUploadResponse struct {
	Key       string            `json:"key"`
	UploadURL string            `json:"uploadUrl"`
	Headers   map[string]string `json:"headers"`
}

// ConfirmLogoUploadRequest - подтверждение загрузки лого
type ConfirmLogoUploadRequest struct {
	Key      string `json:"key" binding:"required"`
	MimeType string `json:"mimeType"`
	Size     int64  `json:"size"`
}

// ConfirmLogoUploadResponse - результат подтверждения загрузки лого
type ConfirmLogoUploadResponse struct {
	LogoURL string `json:"logoUrl"`
}

// SetLogoURLRequest - запрос на установку внешней ссылки лого
type SetLogoURLRequest struct {
	LogoURL string `json:"logoUrl" binding:"required"`
}

// Wallpaper/cover reuse same confirm request; response contains wallpaper url
type ConfirmWallpaperUploadResponse struct {
	WallpaperURL string `json:"wallpaperUrl"`
}

type SetWallpaperURLRequest struct {
	WallpaperURL string `json:"wallpaperUrl" binding:"required"`
}

// UpdateUserRequest - partial update (PATCH) for user profile.
// Все поля опциональны: передаём только то, что хотим изменить.
type UpdateUserRequest struct {
	// Общие поля
	Username string  `json:"username,omitempty"`
	CityID   *int64  `json:"cityId,omitempty"`
	Bio      *string `json:"bio,omitempty"`
	// Use the same enum values as model.FindWork (string values)
	FindWork  *string `json:"find_work,omitempty"`
	Education *string `json:"education,omitempty"`

	// Список специализаций. nil — не менять, пустой массив — очистить.
	SpecializationIDs *[]int64 `json:"specializationIds,omitempty"`

	// Для PERSON: имя и фамилия
	Name    *string `json:"name,omitempty"`
	Surname *string `json:"surname,omitempty"`

	// Для COMPANY: название
	CompanyName *string `json:"companyName,omitempty"`

	// Master: опционально можно указать мастера пользователя.
	// Если IsMasterFromTable = true и передано MasterName, будет создана запись в таблице masters
	// и пользователь будет привязан к ней. Если IsMasterFromTable = true и передан MasterID,
	// пользователь будет привязан к существующей записи masters.
	// Если IsMasterFromTable = false и передан MasterID, он трактуется как id другого tarelka пользователя.
	IsMasterFromTable *bool   `json:"isMasterFromTable,omitempty"`
	MasterID          *int64  `json:"masterId,omitempty"`
	MasterName        *string `json:"masterName,omitempty"`
}

// UserSearchItem - упрощённый ответ для поиска пользователей
// Используется в /users/search/name
type UserSearchItem struct {
	ID             int64   `json:"id"`
	Name           string  `json:"name"`
	Surname        string  `json:"surname"`
	TelegramURL    *string `json:"telegram_url,omitempty"`
	City           *City   `json:"city,omitempty"`
	Specialization *string `json:"specialisation,omitempty"`
	LogoURL        *string `json:"logo_url,omitempty"`
}

// GlobalSearchResponse — ответ глобального поиска по услугам, потребностям и пользователям.
// Каждая категория отсортирована от новых к старым по дате создания в своей таблице.
type GlobalSearchResponse struct {
	Services []Publication      `json:"services"`
	Needs    []NeedSearchItem   `json:"needs"`
	Users    []*TarelkaUserFull `json:"users"`
}
