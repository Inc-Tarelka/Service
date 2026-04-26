package handler

import (
	"net/http"
	"strconv"
	"strings"
	"time"

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

// GetPublicationResponse is detailed response for a single publication including team and needs
type GetPublicationResponse struct {
	Publication *model.Publication            `json:"publication"`
	Team        []model.PublicationTeamMember `json:"team"`
	Needs       []model.Need                  `json:"needs"`
}

// GetNeedResponse is detailed response for a single need
type GetNeedResponse struct {
	ID            int64           `json:"id"`
	Name          string          `json:"name"`
	Description   string          `json:"description"`
	Budget        int64           `json:"budget"`
	DeadlineStart *time.Time      `json:"deadlineStart,omitempty"`
	DeadlineEnd   *time.Time      `json:"deadlineEnd,omitempty"`
	Tags          []model.NeedTag `json:"tags,omitempty"`
	PublicationID int64           `json:"publicationId"`
}

// GetPublication godoc
// @Summary Получить публикацию по ID
// @Description Возвращает детали публикации с лайками, комментариями, автором, соавторами и потребностями
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Success 200 {object} handler.GetPublicationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id} [get]
func (h *PublicationHandler) GetPublication(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	pub, team, needs, err := h.svc.GetPublication(c.Request.Context(), id, &userID)
	if err != nil {
		if err.Error() == "publication not found" {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, GetPublicationResponse{
		Publication: pub,
		Team:        team,
		Needs:       needs,
	})
}

// GetNeed godoc
// @Summary Получить потребность по ID
// @Description Возвращает данные о потребности: название, описание, теги, сроки и бюджет
// @Tags needs
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID потребности"
// @Success 200 {object} handler.GetNeedResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /needs/{id} [get]
func (h *PublicationHandler) GetNeed(c *gin.Context) {
	if _, exists := c.Get("user_id"); !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	need, err := h.svc.GetNeed(c.Request.Context(), id)
	if err != nil {
		if err.Error() == "need not found" {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	resp := GetNeedResponse{
		ID:            need.ID,
		Name:          need.Name,
		Description:   need.Description,
		Budget:        need.Budget,
		DeadlineStart: need.DeadlineStart,
		DeadlineEnd:   need.DeadlineEnd,
		Tags:          need.Tags,
		PublicationID: need.PublicationID,
	}

	c.JSON(http.StatusOK, resp)
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

// PatchPublication godoc
// @Summary Частичное обновление публикации
// @Description В текущей реализации требуется передавать все поля так же, как при создании публикации.
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
// @Router /publications/{id} [patch]
func (h *PublicationHandler) PatchPublication(c *gin.Context) {
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

// DeletePublication godoc
// @Summary Удалить публикацию (soft delete)
// @Description Помечает публикацию как удаленную. Удалять может только автор.
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Success 200 {object} model.SuccessResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 403 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id} [delete]
func (h *PublicationHandler) DeletePublication(c *gin.Context) {
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

	if err := h.svc.DeletePublication(c.Request.Context(), pubID, authorID); err != nil {
		switch err.Error() {
		case "publication not found":
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		case "forbidden":
			c.JSON(http.StatusForbidden, model.ErrorResponse{Error: "forbidden"})
			return
		default:
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
			return
		}
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
	comment, err := h.svc.AddComment(c.Request.Context(), pubID, authorID, req.Content, req.ParentCommentID)
	if err != nil {
		if err.Error() == "comment_reply_only_for_service" {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "comment_reply_only_for_service"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, comment)
}

// GetServiceComments godoc
// @Summary Получить комментарии публикации (включая ответы на комментарии)
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID публикации"
// @Param limit query int false "Лимит" default(20)
// @Param offset query int false "Смещение" default(0)
// @Success 200 {object} model.PublicationCommentsResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/{id}/comments [get]
func (h *PublicationHandler) GetServiceComments(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	_ = uid.(int64) // пока user_id не используется, но оставляем проверку авторизации

	idStr := c.Param("id")
	pubID, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_id"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	total, comments, err := h.svc.GetServiceComments(c.Request.Context(), pubID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	c.JSON(http.StatusOK, model.PublicationCommentsResponse{
		Total:    total,
		Comments: comments,
	})
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

	isLiked, err := h.svc.LikePublication(c.Request.Context(), pubID, authorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "isLiked": isLiked})
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
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)

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

	// Optional: name substring
	if n := c.Query("name"); n != "" {
		filters.Name = &n
	}
	// Optional: tagIds as comma-separated list
	if tagStr := c.Query("tagIds"); tagStr != "" {
		parts := strings.Split(tagStr, ",")
		var ids []int64
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if id, err := strconv.ParseInt(p, 10, 64); err == nil {
				ids = append(ids, id)
			} else {
				c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_tag_id"})
				return
			}
		}
		if len(ids) > 0 {
			filters.TagIDs = ids
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	res, err := h.svc.SearchPublications(c.Request.Context(), filters, limit, offset, &userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// SearchServicePublications godoc
// @Summary Поиск сервис-публикаций
// @Description Поиск публикаций типа SERVICE с фильтрами по городу, названию и тегам (множественный выбор)
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Param cityId query int false "ID города"
// @Param name query string false "Поиск по названию публикации (ILIKE)"
// @Param tagIds query string false "Список ID тегов через запятую"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение" default(0)
// @Success 200 {array} model.Publication
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/services/search [get]
func (h *PublicationHandler) SearchServicePublications(c *gin.Context) {
	// require auth
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)

	var filters model.PublicationSearchFilters
	// Force type = SERVICE
	t := model.PublicationTypeService
	filters.Type = &t

	if cid := c.Query("cityId"); cid != "" {
		if id, err := strconv.ParseInt(cid, 10, 64); err == nil {
			filters.CityID = &id
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_city_id"})
			return
		}
	}
	if n := c.Query("name"); n != "" {
		filters.Name = &n
	}
	if tagStr := c.Query("tagIds"); tagStr != "" {
		parts := strings.Split(tagStr, ",")
		var ids []int64
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if id, err := strconv.ParseInt(p, 10, 64); err == nil {
				ids = append(ids, id)
			} else {
				c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_tag_id"})
				return
			}
		}
		if len(ids) > 0 {
			filters.TagIDs = ids
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	res, err := h.svc.SearchPublications(c.Request.Context(), filters, limit, offset, &userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}

// GetMyProjectPublications godoc
// @Summary Список проектов текущего пользователя
// @Description Возвращает список публикаций типа PROJECT, где текущий пользователь является автором.
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Success 200 {array} model.UserPublicationShort
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/my/projects [get]
func (h *PublicationHandler) GetMyProjectPublications(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)

	items, err := h.svc.GetUserProjectPublications(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	// Приводим к требуемому ответу: id, name, description, image (priority 0)
	resp := make([]gin.H, 0, len(items))
	for _, it := range items {
		resp = append(resp, gin.H{
			"id":          it.ID,
			"name":        it.Name,
			"description": it.Description,
			"image":       it.ImageURL,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// GetMyServicePublications godoc
// @Summary Список сервисов текущего пользователя
// @Description Возвращает список публикаций типа SERVICE, где текущий пользователь является автором.
// @Tags publications
// @Produce json
// @Security BearerAuth
// @Success 200 {array} model.UserPublicationShort
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/my/services [get]
func (h *PublicationHandler) GetMyServicePublications(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := uid.(int64)

	items, err := h.svc.GetUserServicePublications(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	// Приводим к требуемому ответу: id, name, description, image (priority 0)
	resp := make([]gin.H, 0, len(items))
	for _, it := range items {
		resp = append(resp, gin.H{
			"id":          it.ID,
			"name":        it.Name,
			"description": it.Description,
			"image":       it.ImageURL,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// SearchNeeds godoc
// @Summary Поиск потребностей
// @Description Поиск потребностей по городу, названию, тегам публикации, тегам потребности, дате и максимальному бюджету
// @Tags needs
// @Produce json
// @Security BearerAuth
// @Param cityId query int false "ID города (need.city_id)"
// @Param name query string false "Подстрочный поиск по имени потребности (ILIKE)"
// @Param publicationTagIds query string false "ID тегов публикации через запятую"
// @Param needTagIds query string false "ID тегов потребности через запятую"
// @Param date query string false "Дата ISO-8601; попадание в интервал [deadline_start, deadline_end]"
// @Param budgetMax query int false "Максимальный бюджет (<=)"
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение" default(0)
// @Success 200 {array} model.NeedSearchItem
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /publications/needs/search [get]
func (h *PublicationHandler) SearchNeeds(c *gin.Context) {
	if _, exists := c.Get("user_id"); !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}

	var filters model.NeedSearchFilters
	if cid := c.Query("cityId"); cid != "" {
		if id, err := strconv.ParseInt(cid, 10, 64); err == nil {
			filters.CityID = &id
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_city_id"})
			return
		}
	}
	if n := c.Query("name"); n != "" {
		filters.Name = &n
	}
	// publicationTagIds parsing
	if t := c.Query("publicationTagIds"); t != "" {
		parts := strings.Split(t, ",")
		var ids []int64
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if id, err := strconv.ParseInt(p, 10, 64); err == nil {
				ids = append(ids, id)
			} else {
				c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_publication_tag_id"})
				return
			}
		}
		if len(ids) > 0 {
			filters.PublicationTagIDs = ids
		}
	}
	// needTagIds parsing
	if t := c.Query("needTagIds"); t != "" {
		parts := strings.Split(t, ",")
		var ids []int64
		for _, p := range parts {
			p = strings.TrimSpace(p)
			if p == "" {
				continue
			}
			if id, err := strconv.ParseInt(p, 10, 64); err == nil {
				ids = append(ids, id)
			} else {
				c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_need_tag_id"})
				return
			}
		}
		if len(ids) > 0 {
			filters.NeedTagIDs = ids
		}
	}
	if d := c.Query("date"); d != "" {
		// Expect RFC3339 date/time
		if ts, err := time.Parse(time.RFC3339, d); err == nil {
			filters.Date = &ts
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_date"})
			return
		}
	}
	if b := c.Query("budgetMax"); b != "" {
		if v, err := strconv.ParseInt(b, 10, 64); err == nil {
			filters.BudgetMax = &v
		} else {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_budget"})
			return
		}
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	res, err := h.svc.SearchNeeds(c.Request.Context(), filters, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}
	c.JSON(http.StatusOK, res)
}
