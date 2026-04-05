package handler

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
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

// TeamInviteRequest описывает тело запроса для приглашения пользователя в команду проекта
type TeamInviteRequest struct {
	PublicationID int64 `json:"publicationId" binding:"required"`
	ReceiverID    int64 `json:"receiverId" binding:"required"`
}

// TeamInviteResponseRequest — тело запроса для ответа на приглашение в команду
type TeamInviteResponseRequest struct {
	NotificationID int64 `json:"notificationId" binding:"required"`
	IsApprove      bool  `json:"isApprove" binding:"required"`
}

// parseNotificationType извлекает тип уведомления из query-параметра
// и валидирует его по списку известных констант.
// Возвращает (*NotificationType, nil) если тип задан и валиден,
// (nil, nil) если тип не передан и ошибку, если тип неизвестен.
func parseNotificationType(c *gin.Context) (*model.NotificationType, error) {
	typeStr := c.Query("type")
	if typeStr == "" {
		return nil, nil
	}

	nt := model.NotificationType(typeStr)
	switch nt {
	case model.NotificationTypeCollaboration,
		model.NotificationTypeResponse,
		model.NotificationTypeNotice,
		model.NotificationTypeTeamInvite:
		return &nt, nil
	default:
		return nil, fmt.Errorf("invalid notification type")
	}
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

// CreateTeamInvite godoc
// @Summary Отправить приглашение в команду проекта
// @Description Создает уведомление типа TeamInvite (сокомандники) и отправляет Telegram-сообщение получателю
// @Tags notifications
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body TeamInviteRequest true "Параметры приглашения в команду"
// @Success 201 {object} model.NotificationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 403 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/team-invite [post]
func (h *NotificationHandler) CreateTeamInvite(c *gin.Context) {
	creatorIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	creatorID := creatorIDVal.(int64)

	var req TeamInviteRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	notif, err := h.svc.SendTeamInviteNotification(
		c.Request.Context(),
		creatorID,
		req.PublicationID,
		req.ReceiverID,
	)
	if err != nil {
		msg := err.Error()
		if msg == "invalid_publication_type" {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_publication_type"})
			return
		}
		if msg == "not_author_of_publication" {
			c.JSON(http.StatusForbidden, model.ErrorResponse{Error: "forbidden"})
			return
		}
		if msg == repository.ErrPublicationNotFound.Error() {
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
		IsApprove:     notif.IsApprove,
	}

	c.JSON(http.StatusCreated, resp)
}

// RespondTeamInvite godoc
// @Summary Ответить на приглашение в команду проекта
// @Description Фиксирует реакцию пользователя на приглашение и при одобрении добавляет его в соавторы проекта
// @Tags notifications
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body TeamInviteResponseRequest true "Ответ на приглашение в команду"
// @Success 200 {object} model.NotificationResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 403 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/team-invite/response [post]
func (h *NotificationHandler) RespondTeamInvite(c *gin.Context) {
	receiverIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	receiverID := receiverIDVal.(int64)

	var req TeamInviteResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	notif, err := h.svc.RespondToTeamInvite(
		c.Request.Context(),
		receiverID,
		req.NotificationID,
		req.IsApprove,
	)
	if err != nil {
		msg := err.Error()
		if msg == "invalid_notification_type" {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "invalid_notification_type"})
			return
		}
		if msg == "forbidden" {
			c.JSON(http.StatusForbidden, model.ErrorResponse{Error: "forbidden"})
			return
		}
		if msg == "already_responded" {
			c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "already_responded"})
			return
		}
		// для простоты считаем, что любая ошибка выборки/обновления без детальной классификации — это 404 или 500
		if msg == "no rows in result set" {
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
		IsApprove:     notif.IsApprove,
	}

	c.JSON(http.StatusOK, resp)
}

// ListIncomingNotifications godoc
// @Summary Список входящих уведомлений
// @Description Возвращает входящие уведомления для текущего пользователя (где он receiver)
// @Tags notifications
// @Produce json
// @Security BearerAuth
// @Param type query string false "Тип уведомлений (Collaboration/Response/Notice/TeamInvite)"
// @Param size query int false "Размер страницы" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.NotificationWithCreatorResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/incoming [get]
func (h *NotificationHandler) ListIncomingNotifications(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(int64)

	nType, err := parseNotificationType(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	list, err := h.svc.ListIncomingNotifications(c.Request.Context(), userID, nType, size, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := make([]model.NotificationWithCreatorResponse, 0, len(list))
	for _, n := range list {
		resp = append(resp, model.NotificationWithCreatorResponse{
			ID:            n.ID,
			Type:          n.Type,
			PublicationID: n.PublicationID,
			CreatedAtISO:  n.CreatedAt.Format(time.RFC3339),
			CreatorName:   n.CreatorName,
			ReceiverID:    n.ReceiverID,
			Message:       n.Message,
			NeedID:        n.NeedID,
			IsRead:        n.IsRead,
			IsApprove:     n.IsApprove,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// ListOutgoingNotifications godoc
// @Summary Список исходящих уведомлений
// @Description Возвращает исходящие уведомления для текущего пользователя (где он creator)
// @Tags notifications
// @Produce json
// @Security BearerAuth
// @Param type query string false "Тип уведомлений (Collaboration/Response/Notice/TeamInvite)"
// @Param size query int false "Размер страницы" default(20)
// @Param offset query int false "Смещение"
// @Success 200 {array} model.NotificationWithCreatorResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/outgoing [get]
func (h *NotificationHandler) ListOutgoingNotifications(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID := userIDVal.(int64)

	nType, err := parseNotificationType(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "validation_error", Message: err.Error()})
		return
	}

	size, _ := strconv.Atoi(c.DefaultQuery("size", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))

	list, err := h.svc.ListOutgoingNotifications(c.Request.Context(), userID, nType, size, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := make([]model.NotificationWithCreatorResponse, 0, len(list))
	for _, n := range list {
		resp = append(resp, model.NotificationWithCreatorResponse{
			ID:            n.ID,
			Type:          n.Type,
			PublicationID: n.PublicationID,
			CreatedAtISO:  n.CreatedAt.Format(time.RFC3339),
			CreatorName:   n.CreatorName,
			ReceiverID:    n.ReceiverID,
			Message:       n.Message,
			NeedID:        n.NeedID,
			IsRead:        n.IsRead,
			IsApprove:     n.IsApprove,
		})
	}

	c.JSON(http.StatusOK, resp)
}

// GetNotification godoc
// @Summary Получить уведомление по id
// @Description Возвращает уведомление по id для текущего пользователя (как receiver) и помечает его прочитанным
// @Tags notifications
// @Produce json
// @Security BearerAuth
// @Param id path int true "ID уведомления"
// @Success 200 {object} model.NotificationWithCreatorResponse
// @Failure 400 {object} model.ErrorResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 404 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /notifications/{id} [get]
func (h *NotificationHandler) GetNotification(c *gin.Context) {
	userIDVal, ok := c.Get("user_id")
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	receiverID := userIDVal.(int64)

	idStr := c.Param("id")
	id, err := strconv.ParseInt(idStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{Error: "validation_error", Message: "invalid id"})
		return
	}

	n, err := h.svc.GetNotificationForReceiver(c.Request.Context(), id, receiverID)
	if err != nil {
		if err == repository.ErrNotificationNotFound {
			c.JSON(http.StatusNotFound, model.ErrorResponse{Error: "not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	resp := model.NotificationWithCreatorResponse{
		ID:            n.ID,
		Type:          n.Type,
		PublicationID: n.PublicationID,
		CreatedAtISO:  n.CreatedAt.Format(time.RFC3339),
		CreatorName:   n.CreatorName,
		ReceiverID:    n.ReceiverID,
		Message:       n.Message,
		NeedID:        n.NeedID,
		IsRead:        n.IsRead,
		IsApprove:     n.IsApprove,
	}

	c.JSON(http.StatusOK, resp)
}
