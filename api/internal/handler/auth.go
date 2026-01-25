package handler

import (
	"errors"
	"net/http"
	"strings"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

// RegisterViaTelegram godoc
// @Summary Регистрация через Telegram
// @Description Регистрация нового пользователя Tarelka через Telegram Mini App
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RegisterRequest true "Данные регистрации"
// @Success 201 {object} model.RegisterResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 409 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/telegram/register [post]
func (h *AuthHandler) RegisterViaTelegram(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.RegisterViaTelegram(c.Request.Context(), &req)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidInitData):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_init_data"})
		case errors.Is(err, service.ErrInitDataExpired):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "init_data_expired"})
		case errors.Is(err, service.ErrUserExists):
			c.JSON(http.StatusConflict, model.ErrorResponse{Error: "user_exists"})
		case errors.Is(err, service.ErrPhoneExists):
			c.JSON(http.StatusConflict, model.ErrorResponse{Error: "phone_exists"})
		case errors.Is(err, service.ErrInvalidReferences):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_references"})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		}
		return
	}

	c.JSON(http.StatusCreated, resp)
}

// Login godoc
// @Summary Авторизация
// @Description Авторизация по username и паролю
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.LoginRequest true "Данные авторизации"
// @Success 200 {object} model.LoginResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.Login(c.Request.Context(), &req)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "invalid_credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Refresh godoc
// @Summary Обновление токенов
// @Description Обновление access token с помощью refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RefreshRequest true "Refresh token"
// @Success 200 {object} model.RefreshResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req model.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.RefreshTokens(c.Request.Context(), req.RefreshToken)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidToken):
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "invalid_token"})
		case errors.Is(err, service.ErrTokenExpired):
			c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "token_expired"})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		}
		return
	}

	c.JSON(http.StatusOK, resp)
}

// Logout godoc
// @Summary Выход
// @Description Отзыв refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.RefreshRequest true "Refresh token"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	var req model.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	if err := h.authService.Logout(c.Request.Context(), req.RefreshToken); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}

// SendPhoneVerification godoc
// @Summary Отправка кода верификации телефона
// @Description Принимает номер телефона и отправляет запрос на Telegram Gateway, возвращает requestId
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.SendPhoneVerificationRequest true "Данные для отправки кода"
// @Success 200 {object} model.SendPhoneVerificationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/phone/send [post]
func (h *AuthHandler) SendPhoneVerification(c *gin.Context) {
	var req model.SendPhoneVerificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.SendPhoneVerification(c.Request.Context(), req.PhoneNumber)
	if err != nil {
		// Некорректный номер — 400, остальное — 500
		if strings.Contains(err.Error(), "invalid phone") {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_phone"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// VerifyPhoneCode godoc
// @Summary Проверка кода телефона (ранний шаг)
// @Description Передаём requestId и code, получаем статус проверки
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.VerifyCodeRequest true "Данные проверки"
// @Success 200 {object} model.VerifyCodeResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/phone/verify [post]
func (h *AuthHandler) VerifyPhoneCode(c *gin.Context) {
	var req model.VerifyCodeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.VerifyPhoneCode(c.Request.Context(), req.VerificationRequestID, req.VerificationCode)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}
	c.JSON(http.StatusOK, resp)
}

// PasswordForgot godoc
// @Summary Запрос на восстановление пароля (отправка кода)
// @Description По username отправляет код на привязанный номер телефона, возвращает requestId
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.PasswordForgotRequest true "Данные для отправки кода"
// @Success 200 {object} model.PasswordForgotResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/password/forgot [post]
func (h *AuthHandler) PasswordForgot(c *gin.Context) {
	var req model.PasswordForgotRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	resp, err := h.authService.BeginPasswordReset(c.Request.Context(), req.Username)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrPhoneNotBound):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "phone_not_bound"})
		case errors.Is(err, repository.ErrUserNotFound):
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "user_not_found"})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		}
		return
	}

	c.JSON(http.StatusOK, model.PasswordForgotResponse{RequestID: resp.RequestID})
}

// PasswordReset godoc
// @Summary Смена пароля по коду
// @Description Принимает username, requestId, code и новый пароль; если проверка проходит — меняет пароль
// @Tags auth
// @Accept json
// @Produce json
// @Param request body model.PasswordResetRequest true "Данные для смены пароля"
// @Success 200 {object} model.PasswordResetResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /auth/password/reset [post]
func (h *AuthHandler) PasswordReset(c *gin.Context) {
	var req model.PasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	err := h.authService.ResetPasswordWithCode(c.Request.Context(), req.Username, req.VerificationRequestID, req.VerificationCode, req.NewPassword)
	if err != nil {
		switch {
		case errors.Is(err, service.ErrInvalidVerification):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_verification"})
		case errors.Is(err, service.ErrCodeExpired):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "code_expired"})
		case errors.Is(err, service.ErrPhoneNotBound):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "phone_not_bound"})
		case errors.Is(err, service.ErrPhoneMismatch):
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "phone_mismatch"})
		case errors.Is(err, repository.ErrUserNotFound):
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "user_not_found"})
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		}
		return
	}

	c.JSON(http.StatusOK, model.PasswordResetResponse{Success: true})
}

// ExtractToken извлекает токен из заголовка Authorization
func ExtractToken(c *gin.Context) string {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || parts[0] != "Bearer" {
		return ""
	}

	return parts[1]
}
