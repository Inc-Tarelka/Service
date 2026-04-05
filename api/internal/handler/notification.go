package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

type NotificationHandler struct {
	svc service.NotificationService
}

func NewNotificationHandler(svc service.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

type CollaborationRequest struct {
	ReceiverID    int64   `json:"receiverId" binding:"required"`
	PublicationID int64   `json:"publicationId" binding:"required"`
	Message       *string `json:"message" binding:"omitempty,max=1000"`
}

// NeedResponseRequest описывает тело запроса для отклика на потребность
type NeedResponseRequest struct {
	PublicationID int64   `json:"publicationId" binding:"required"`
	NeedID        int64   `json:"needId" binding:"required"`
	Message       *string `json:"message" binding:"omitempty,max=1000"`
}

// CreateCollaboration godoc
// @Summary Отправить уведомление о сотрудничестве
// @Description Создает уведомление типа Collaboration и отправляет Telegram-сообщение получателю
// @Tags notifications
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CollaborationRequest true "Параметры заявки на сотрудничество"
// @Success 201 {object} model.NotificationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/collaboration [post]
func (h *NotificationHandler) CreateCollaboration(c *gin.Context) {
	creatorIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	creatorID := creatorIDVal.(int64)

	var req CollaborationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	notif, err := h.svc.SendCollaborationNotification(
		c.Request.Context(),
		creatorID,
		req.ReceiverID,
		req.PublicationID,
		req.Message,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := model.NotificationResponse{
		ID:            notif.ID,
		Type:          notif.Type,
		PublicationID: notif.PublicationID,
		CreatedAtISO:  notif.CreatedAt.Format(time.RFC3339),
		CreatorID:     notif.CreatorID,
		ReceiverID:    notif.ReceiverID,
		Message:       notif.Message,
		NeedID:        notif.NeedID,
		IsRead:        notif.IsRead,
	}

	c.JSON(http.StatusCreated, resp)
}

// CreateNeedResponse godoc
// @Summary Отправить отклик на потребность
// @Description Создает уведомление типа Response и отправляет Telegram-сообщение получателю
// @Tags notifications
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body NeedResponseRequest true "Параметры отклика на потребность"
// @Success 201 {object} model.NotificationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/need-response [post]
func (h *NotificationHandler) CreateNeedResponse(c *gin.Context) {
	creatorIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	creatorID := creatorIDVal.(int64)

	var req NeedResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	notif, err := h.svc.SendNeedResponseNotification(
		c.Request.Context(),
		creatorID,
		req.PublicationID,
		req.NeedID,
		req.Message,
	)
	if err != nil {
		// Для несуществующей потребности репозиторий возвращает ошибку с текстом "need not found".
		if err.Error() == "need not found" {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := model.NotificationResponse{
		ID:            notif.ID,
		Type:          notif.Type,
		PublicationID: notif.PublicationID,
		CreatedAtISO:  notif.CreatedAt.Format(time.RFC3339),
		CreatorID:     notif.CreatorID,
		ReceiverID:    notif.ReceiverID,
		Message:       notif.Message,
		NeedID:        notif.NeedID,
		IsRead:        notif.IsRead,
	}

	c.JSON(http.StatusCreated, resp)
}

// ListCollaboration godoc
// @Summary Список уведомлений о сотрудничестве
// @Description Возвращает уведомления типа Collaboration для текущего пользователя
// @Tags notifications
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.NotificationResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/collaboration [get]
func (h *NotificationHandler) ListCollaboration(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(int64)

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	list, err := h.svc.ListCollaborationNotifications(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := make([]model.NotificationResponse, 0, len(list))
	for _, n := range list {
		resp = append(resp, model.NotificationResponse{
			ID:            n.ID,
			Type:          n.Type,
			PublicationID: n.PublicationID,
			CreatedAtISO:  n.CreatedAt.Format(time.RFC3339),
			CreatorID:     n.CreatorID,
			ReceiverID:    n.ReceiverID,
			Message:       n.Message,
			NeedID:        n.NeedID,
			IsRead:        n.IsRead,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// ListNeedResponses godoc
// @Summary Список откликов на потребности
// @Description Возвращает уведомления типа Response для текущего пользователя
// @Tags notifications
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Лимит результатов" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.NotificationResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/need-response [get]
func (h *NotificationHandler) ListNeedResponses(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(int64)

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	list, err := h.svc.ListNeedResponseNotifications(c.Request.Context(), userID, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := make([]model.NotificationResponse, 0, len(list))
	for _, n := range list {
		resp = append(resp, model.NotificationResponse{
			ID:            n.ID,
			Type:          n.Type,
			PublicationID: n.PublicationID,
			CreatedAtISO:  n.CreatedAt.Format(time.RFC3339),
			CreatorID:     n.CreatorID,
			ReceiverID:    n.ReceiverID,
			Message:       n.Message,
			NeedID:        n.NeedID,
			IsRead:        n.IsRead,
		})
	}

	c.JSON(http.StatusOK, resp)
}
