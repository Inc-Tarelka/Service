package handler

import (
	"net/http"
	"strconv"
	"strings"

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

// SearchUsersByName godoc
// @Summary Поиск пользователей по имени
// @Description Ищет профили по имени/фамилии (PERSON) или названию компании (COMPANY)
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param q query string true "Строка поиска"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.TarelkaUserFull
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/search/name [get]
func (h *UserHandler) SearchUsersByName(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	res, err := h.userService.SearchUsersByName(c.Request.Context(), q, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// SearchUsersByTelegram godoc
// @Summary Поиск пользователей по Telegram
// @Description Ищет профили по ссылке/нику Telegram (поле telegram_url)
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param q query string true "Строка поиска (@ник или часть ссылки)"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.TarelkaUserFull
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/search/telegram [get]
func (h *UserHandler) SearchUsersByTelegram(c *gin.Context) {
	q := strings.TrimSpace(c.Query("q"))
	if q == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_query"})
		return
	}
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	res, err := h.userService.SearchUsersByTelegram(c.Request.Context(), q, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// SearchUsersByFilters godoc
// @Summary Поиск пользователей по фильтрам
// @Description Фильтрация по имени/компании или Telegram (передается в поле name), специализациям, типу аккаунта, статусу (find_work), городам
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param name query string false "Имя/фамилия или название компании"
// @Param specializationIds query []int false "ID специализаций (можно несколько)"
// @Param type query string false "Тип аккаунта (PERSON | COMPANY)"
// @Param status query string false "Статус поиска работы (LOOKING | NOT_LOOKING | OPEN_TO_OFFERS)"
// @Param cityIds query []int false "ID городов (можно несколько)"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.TarelkaUserFull
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/search/filters [get]
func (h *UserHandler) SearchUsersByFilters(c *gin.Context) {
	name := strings.TrimSpace(c.Query("name"))

	// Parse specializationIds (comma-separated or repeated param)
	specIDs := []int64{}
	if raw := c.Query("specializationIds"); raw != "" {
		parts := strings.Split(raw, ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if v, err := strconv.ParseInt(p, 10, 64); err == nil {
				specIDs = append(specIDs, v)
			}
		}
	}
	// Allow repeated params: specializationIds=1&specializationIds=2
	for _, p := range c.QueryArray("specializationIds") {
		if v, err := strconv.ParseInt(strings.TrimSpace(p), 10, 64); err == nil {
			specIDs = append(specIDs, v)
		}
	}

	// Parse cityIds similarly
	cityIDs := []int64{}
	if raw := c.Query("cityIds"); raw != "" {
		parts := strings.Split(raw, ",")
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if v, err := strconv.ParseInt(p, 10, 64); err == nil {
				cityIDs = append(cityIDs, v)
			}
		}
	}
	for _, p := range c.QueryArray("cityIds") {
		if v, err := strconv.ParseInt(strings.TrimSpace(p), 10, 64); err == nil {
			cityIDs = append(cityIDs, v)
		}
	}

	// Parse type
	var accountType *model.AccountType
	if t := strings.TrimSpace(c.Query("type")); t != "" {
		switch strings.ToUpper(t) {
		case "PERSON":
			v := model.AccountTypePerson
			accountType = &v
		case "COMPANY":
			v := model.AccountTypeCompany
			accountType = &v
		default:
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_type"})
			return
		}
	}

	// Parse status (find_work)
	var status *model.FindWork
	if s := strings.TrimSpace(c.Query("status")); s != "" {
		switch strings.ToUpper(s) {
		case "LOOKING":
			v := model.FindWorkLooking
			status = &v
		case "NOT_LOOKING":
			v := model.FindWorkNotLooking
			status = &v
		case "OPEN_TO_OFFERS":
			v := model.FindWorkOpenToOffer
			status = &v
		default:
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_status"})
			return
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	res, err := h.userService.SearchUsersByFilters(c.Request.Context(), name, specIDs, accountType, status, cityIDs, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
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

// PresignWallpaperUpload godoc
// @Summary Presigned URL для загрузки обложки
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.PresignUploadRequest true "Данные запроса"
// @Success 200 {object} model.PresignUploadResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/wallpaper/presign [post]
func (h *UserHandler) PresignWallpaperUpload(c *gin.Context) {
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
	key, url, headers, err := h.userService.PresignWallpaperUpload(c.Request.Context(), id, req.ContentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.PresignUploadResponse{Key: key, UploadURL: url, Headers: headers})
}

// ConfirmWallpaperUpload godoc
// @Summary Подтвердить загрузку обложки
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.ConfirmLogoUploadRequest true "Данные подтверждения"
// @Success 200 {object} model.ConfirmWallpaperUploadResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/wallpaper/confirm [post]
func (h *UserHandler) ConfirmWallpaperUpload(c *gin.Context) {
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
	wallpaperURL, err := h.userService.ConfirmWallpaperUpload(c.Request.Context(), id, req.Key, req.MimeType, req.Size)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.ConfirmWallpaperUploadResponse{WallpaperURL: wallpaperURL})
}

// SetWallpaperURL godoc
// @Summary Установить внешнюю ссылку обложки
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.SetWallpaperURLRequest true "Ссылка на обложку"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id}/wallpaper/url [post]
func (h *UserHandler) SetWallpaperURL(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}
	var req model.SetWallpaperURLRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.WallpaperURL == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}
	if err := h.userService.SetWallpaperURLFromExternal(c.Request.Context(), id, req.WallpaperURL); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}

// PatchUser godoc
// @Summary Частичное обновление профиля пользователя
// @Tags users
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID пользователя"
// @Param payload body model.UpdateUserRequest true "Поля для обновления"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/{id} [patch]
func (h *UserHandler) PatchUser(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}
	var req model.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}
	var findWork *model.FindWork
	if req.FindWork != nil {
		// allow both localized and ASCII codes; map to ASCII stored values
		switch *req.FindWork {
		case "Ищу работу", string(model.FindWorkLooking):
			v := model.FindWorkLooking
			findWork = &v
		case "Не ищу работу", string(model.FindWorkNotLooking):
			v := model.FindWorkNotLooking
			findWork = &v
		case "Рассматриваю предложения по работе", string(model.FindWorkOpenToOffer):
			v := model.FindWorkOpenToOffer
			findWork = &v
		default:
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_find_work"})
			return
		}
	}
	if err := h.userService.UpdateUserProfile(c.Request.Context(), id, req.Bio, findWork, req.Education); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}

// DeleteCurrentUser godoc
// @Summary Удалить аккаунт текущего пользователя
// @Tags users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.SuccessResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /users/me [delete]
func (h *UserHandler) DeleteCurrentUser(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)
	if err := h.userService.DeleteUser(c.Request.Context(), userID); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}
