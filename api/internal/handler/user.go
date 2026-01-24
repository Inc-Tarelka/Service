package handler

import (
	"net/http"
	"strconv"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetCurrentUser godoc
// @Summary Текущий пользователь
// @Description Получение информации о текущем авторизованном пользователе
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.TarelkaUserFull
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/me [get]
func (h *UserHandler) GetCurrentUser(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}

	user, err := h.userService.GetUser(c.Request.Context(), userID.(int64))
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "user_not_found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// GetUser godoc
// @Summary Получить пользователя
// @Description Получение информации о пользователе по ID
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Success 200 {object} model.TarelkaUserFull
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id} [get]
func (h *UserHandler) GetUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	user, err := h.userService.GetUser(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "user_not_found"})
		return
	}

	c.JSON(http.StatusOK, user)
}

// PresignLogoUpload godoc
// @Summary Presigned URL для загрузки лого
// @Description Генерация presigned URL для загрузки логотипа пользователя в хранилище
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.PresignUploadRequest true "Данные запроса"
// @Success 200 {object} model.PresignUploadResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/logo/presign [post]
func (h *UserHandler) PresignLogoUpload(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	var req model.PresignUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.ContentType == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}

	key, url, headers, err := h.userService.PresignLogoUpload(c.Request.Context(), id, req.ContentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.PresignUploadResponse{Key: key, UploadURL: url, Headers: headers})
}

// ConfirmLogoUpload godoc
// @Summary Подтвердить загрузку лого
// @Description Подтверждение загрузки файла и сохранение конечной ссылки
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.ConfirmLogoUploadRequest true "Данные подтверждения"
// @Success 200 {object} model.ConfirmLogoUploadResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/logo/confirm [post]
func (h *UserHandler) ConfirmLogoUpload(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}
	var req model.ConfirmLogoUploadRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Key == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}
	logoURL, err := h.userService.ConfirmLogoUpload(c.Request.Context(), id, req.Key, req.MimeType, req.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.ConfirmLogoUploadResponse{LogoURL: logoURL})
}

// SetLogoURL godoc
// @Summary Установить внешнюю ссылку лого
// @Description Сохранить в профиле внешнюю ссылку на логотип (например, из Telegram)
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.SetLogoURLRequest true "Ссылка на лого"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/logo/url [post]
func (h *UserHandler) SetLogoURL(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}
	var req model.SetLogoURLRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.LogoURL == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}
	if err := h.userService.SetLogoURLFromExternal(c.Request.Context(), id, req.LogoURL); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}
