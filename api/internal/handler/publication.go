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
