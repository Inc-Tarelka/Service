package handler

import (
	"net/http"
	"strconv"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

type PublicationHandler struct {
	svc service.PublicationService
}

func NewPublicationHandler(svc service.PublicationService) *PublicationHandler {
	return &PublicationHandler{svc: svc}
}

// CreatePublication godoc
// @Summary Создать публикацию
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param payload body model.CreateOrUpdatePublicationRequest true "Данные публикации"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications [post]
func (h *PublicationHandler) CreatePublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)

	var req model.CreateOrUpdatePublicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request", Message: err.Error()})
		return
	}
	pubID, err := h.svc.CreatePublication(c.Request.Context(), authorID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true, Data: gin.H{"id": pubID}})
}

// UpdatePublication godoc
// @Summary Обновить публикацию
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Param payload body model.CreateOrUpdatePublicationRequest true "Данные публикации"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id} [put]
func (h *PublicationHandler) UpdatePublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)
	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	var req model.CreateOrUpdatePublicationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request", Message: err.Error()})
		return
	}
	if err := h.svc.UpdatePublication(c.Request.Context(), pubID, authorID, req); err != nil {
		if err.Error() == "publication not found" {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}

// AddComment godoc
// @Summary Добавить комментарий к публикации
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Param payload body model.AddCommentRequest true "Комментарий"
// @Success 200 {object} model.Comment
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id}/comments [post]
func (h *PublicationHandler) AddComment(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)
	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	var req model.AddCommentRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Content == "" {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request"})
		return
	}
	comment, err := h.svc.AddComment(c.Request.Context(), pubID, authorID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, comment)
}

// LikePublication godoc
// @Summary Поставить лайк публикации (идемпотентно)
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id}/likes [post]
func (h *PublicationHandler) LikePublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)
	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	if err := h.svc.LikePublication(c.Request.Context(), pubID, authorID); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.SuccessResponse{Success: true})
}

// PresignImagesGeneric godoc
// @Summary Сгенерировать presigned URL'ы для загрузки изображений публикации (без ID публикации)
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param payload body model.PresignPublicationImagesRequest true "Список файлов"
// @Success 200 {object} model.PresignPublicationImagesResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/images/presign [post]
func (h *PublicationHandler) PresignImagesGeneric(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)

	var req model.PresignPublicationImagesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request", Message: err.Error()})
		return
	}
	items, err := h.svc.PresignPublicationImages(c.Request.Context(), authorID, nil, req.Files)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.PresignPublicationImagesResponse{Items: items})
}

// PresignImagesForPublication godoc
// @Summary Сгенерировать presigned URL'ы для загрузки изображений для конкретной публикации
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Param payload body model.PresignPublicationImagesRequest true "Список файлов"
// @Success 200 {object} model.PresignPublicationImagesResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id}/images/presign [post]
func (h *PublicationHandler) PresignImagesForPublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)
	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	var req model.PresignPublicationImagesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request", Message: err.Error()})
		return
	}
	items, err := h.svc.PresignPublicationImages(c.Request.Context(), authorID, &pubID, req.Files)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.PresignPublicationImagesResponse{Items: items})
}

// AttachImagesToPublication godoc
// @Summary Подтвердить загрузку и прикрепить изображения к публикации
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Param payload body model.AttachPublicationImagesRequest true "Список ключей и позиций"
// @Success 200 {object} model.AttachPublicationImagesResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id}/images [post]
func (h *PublicationHandler) AttachImagesToPublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	authorID := uid.(int64)
	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}
	var req model.AttachPublicationImagesRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_request", Message: err.Error()})
		return
	}
	imgs, err := h.svc.AttachPublicationImages(c.Request.Context(), pubID, authorID, req.Items)
	if err != nil {
		if err.Error() == "publication not found" {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, model.AttachPublicationImagesResponse{Images: imgs})
}

// SearchPublications godoc
// @Summary Поиск публикаций
// @Description Поиск публикаций с фильтрами по типу, городу, статусу поиска работы автора и специализации автора
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param type query string false "Тип публикации (PROJECT|SERVICE)"
// @Param cityId query int false "ID города"
// @Param workingStatus query string false "Статус занятости автора (LOOKING|NOT_LOOKING|OPEN_TO_OFFERS)"
// @Param specializationId query int false "ID специализации автора"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение" default(0)
// @Success 200 {array} model.Publication
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/search [get]
func (h *PublicationHandler) SearchPublications(c *gin.Context) {
	// auth required as all publications endpoints are under protected group
	if _, exists := c.Get("user_id"); !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}

	var filters model.PublicationSearchFilters

	if t := c.Query("type"); t != "" {
		v := model.PublicationType(t)
		// normalize
		if t == "project" || t == "PROJECT" || t == "Project" {
			v = model.PublicationTypeProject
		} else if t == "service" || t == "SERVICE" || t == "Service" {
			v = model.PublicationTypeService
		}
		filters.Type = &v
	}
	if cid := c.Query("cityId"); cid != "" {
		if id, err := strconv.ParseInt(cid, 10, 64); err == nil {
			filters.CityID = &id
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_city_id"})
			return
		}
	}
	if ws := c.Query("workingStatus"); ws != "" {
		// Accept both localized strings and enum values
		var v model.FindWork
		switch ws {
		case "LOOKING", "Ищу работу":
			v = model.FindWorkLooking
		case "NOT_LOOKING", "Не ищу работу":
			v = model.FindWorkNotLooking
		case "OPEN_TO_OFFERS", "Рассматриваю предложения по работе":
			v = model.FindWorkOpenToOffer
		default:
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_working_status"})
			return
		}
		filters.WorkingStatus = &v
	}
	if sid := c.Query("specializationId"); sid != "" {
		if id, err := strconv.ParseInt(sid, 10, 64); err == nil {
			filters.SpecializationID = &id
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_specialization_id"})
			return
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	res, err := h.svc.SearchPublications(c.Request.Context(), filters, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}
