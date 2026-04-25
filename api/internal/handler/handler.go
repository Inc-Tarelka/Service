package handler

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

// Handler содержит все обработчики
type Handler struct {
	auth         *AuthHandler
	user         *UserHandler
	reference    *ReferenceHandler
	publication  *PublicationHandler
	notification *NotificationHandler
	authService  service.AuthService
	services     *service.Services
}

// NewHandler создаёт Handler
func NewHandler(services *service.Services) *Handler {
	return &Handler{
		auth:         NewAuthHandler(services.Auth),
		user:         NewUserHandler(services.User),
		reference:    NewReferenceHandler(services.Reference),
		publication:  NewPublicationHandler(services.Publication),
		notification: NewNotificationHandler(services.Notification),
		authService:  services.Auth,
		services:     services,
	}
}

// GlobalSearch godoc
// @Summary Глобальный поиск сущностей
// @Description Возвращает услуги, потребности и пользователей без фильтров, отсортированных от новых к старым в каждой категории.
// @Tags search
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Лимит результатов на категорию" default(20)
// @Param offset query int false "Смещение" default(0)
// @Success 200 {object} model.GlobalSearchResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /search/all [get]
func (h *Handler) GlobalSearch(c *gin.Context) {
	// protected group already checks auth token; here we just assume user is authenticated
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	offset, _ := strconv.Atoi(c.DefaultQuery("offset", "0"))
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}

	ctx := c.Request.Context()

	// services: publications of type SERVICE
	t := model.PublicationTypeService
	pubFilters := model.PublicationSearchFilters{Type: &t}
	services, err := h.services.Publication.SearchPublications(ctx, pubFilters, limit, offset, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	// needs: no filters
	needs, err := h.services.Publication.SearchNeeds(ctx, model.NeedSearchFilters{}, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	// users: no filters
	users, err := h.services.User.SearchUsersByFilters(ctx, "", nil, nil, nil, nil, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error", Message: err.Error()})
		return
	}

	resp := model.GlobalSearchResponse{
		Services: services,
		Needs:    needs,
		Users:    users,
	}

	c.JSON(http.StatusOK, resp)
}

// RegisterRoutes регистрирует все маршруты
func (h *Handler) RegisterRoutes(router *gin.Engine) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	api := router.Group("/api/v1")
	{
		// Auth routes (public)
		auth := api.Group("/auth")
		{
			auth.POST("/pre-register", h.auth.PreRegister)
			auth.POST("/telegram/register", h.auth.RegisterViaTelegram)
			auth.POST("/login", h.auth.Login)
			auth.POST("/refresh", h.auth.Refresh)
			auth.POST("/logout", h.auth.Logout)
			auth.POST("/phone/send", h.auth.SendPhoneVerification)
			auth.POST("/phone/verify", h.auth.VerifyPhoneCode)
			auth.POST("/password/forgot", h.auth.PasswordForgot)
			auth.POST("/password/reset", h.auth.PasswordReset)
		}

		// Reference routes (public)
		references := api.Group("/references")
		{
			references.GET("/specializations", h.reference.GetSpecializations)
			references.GET("/directions", h.reference.GetDirections)
			references.GET("/cities", h.reference.GetCities)
			references.GET("/publication-tags", h.reference.GetPublicationTags)
			references.GET("/need-tags", h.reference.GetNeedTags)
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(h.authMiddleware())
		{
			// Global search across services, needs and users
			protected.GET("/search/all", h.GlobalSearch)

			// Invite links
			protected.GET("/createInviteLink", h.CreateInviteLink)

			// Users
			users := protected.Group("/users")
			{
				users.GET("/me", h.user.GetCurrentUser)
				users.GET("/me/profile", h.user.GetMyProfile)
				users.GET("/me/teammates", h.user.GetMyTeammates)
				users.GET("/:id/teammates", h.user.GetUserTeammates)
				users.GET(":id", h.user.GetUser)
				users.GET(":id/profile", h.user.GetUserProfile)
				users.POST("/:id/logo/presign", h.user.PresignLogoUpload)
				users.POST("/:id/logo/confirm", h.user.ConfirmLogoUpload)
				users.POST("/:id/logo/url", h.user.SetLogoURL)
				// Wallpaper endpoints
				users.POST(":id/wallpaper/presign", h.user.PresignWallpaperUpload)
				users.POST(":id/wallpaper/confirm", h.user.ConfirmWallpaperUpload)
				users.POST(":id/wallpaper/url", h.user.SetWallpaperURL)
				// Search endpoints
				users.GET("/search/name", h.user.SearchUsersByName)
				users.GET("/search/telegram", h.user.SearchUsersByTelegram)
				users.GET("/search/filters", h.user.SearchUsersByFilters)
				// Partial update and delete
				users.PATCH("/me/profile", h.user.PatchMyProfile)
				users.DELETE("/me", h.user.DeleteCurrentUser)
			}

			// Publications
			pubs := protected.Group("/publications")
			{
				pubs.POST("", h.publication.CreatePublication)
				pubs.GET(":id", h.publication.GetPublication)
				pubs.PUT(":id", h.publication.UpdatePublication)
				pubs.PATCH(":id", h.publication.PatchPublication)
				pubs.POST(":id/comments", h.publication.AddComment)
				pubs.GET(":id/comments", h.publication.GetServiceComments)
				pubs.POST(":id/likes", h.publication.LikePublication)
				pubs.GET("/search", h.publication.SearchPublications)
				pubs.GET("/services/search", h.publication.SearchServicePublications)
				pubs.GET("/needs/search", h.publication.SearchNeeds)
				pubs.GET("/my/projects", h.publication.GetMyProjectPublications)
				pubs.GET("/my/services", h.publication.GetMyServicePublications)
				// Images upload for publications
				pubs.POST("/images/presign", h.publication.PresignImagesGeneric)
				pubs.POST(":id/images/presign", h.publication.PresignImagesForPublication)
				pubs.POST(":id/images", h.publication.AttachImagesToPublication)
			}

			// Needs
			needs := protected.Group("/needs")
			{
				needs.GET(":id", h.publication.GetNeed)
			}

			// Notifications
			notifs := protected.Group("/notifications")
			{
				notifs.POST("/collaboration", h.notification.CreateCollaboration)
				notifs.GET("/collaboration", h.notification.ListCollaboration)
				notifs.POST("/need-response", h.notification.CreateNeedResponse)
				notifs.GET("/need-response", h.notification.ListNeedResponses)
				notifs.POST("/team-invite", h.notification.CreateTeamInvite)
				notifs.GET("/team-invite/response", h.notification.ListTeamInviteResponses)
				notifs.POST("/team-invite/response", h.notification.RespondTeamInvite)
				notifs.GET("/incoming", h.notification.ListIncomingNotifications)
				notifs.GET("/outgoing", h.notification.ListOutgoingNotifications)
				notifs.GET(":id", h.notification.GetNotification)
			}
		}
	}
}

// CreateInviteLink godoc
// @Summary Создать пригласительную ссылку
// @Description Генерирует senderId для текущего пользователя для формирования Telegram Mini App ссылки (?startapp=senderId)
// @Tags auth
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.InviteLinkResponse
// @Failure 401 {object} model.ErrorResponse
// @Failure 403 {object} model.ErrorResponse
// @Failure 500 {object} model.ErrorResponse
// @Router /createInviteLink [get]
func (h *Handler) CreateInviteLink(c *gin.Context) {
	uid, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}
	userID, ok := uid.(int64)
	if !ok {
		c.JSON(http.StatusUnauthorized, model.ErrorResponse{Error: "unauthorized"})
		return
	}

	senderID, err := h.authService.GenerateInviteSenderID(c.Request.Context(), userID)
	if err != nil {
		msg := err.Error()
		if strings.Contains(msg, "invite_not_configured") {
			c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "invite_not_configured"})
			return
		}
		if strings.Contains(msg, "invite_limit_reached") {
			// Количество доступных приглашений закончилось
			c.JSON(http.StatusForbidden, model.ErrorResponse{Error: "invite_limit_reached"})
			return
		}
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.JSON(http.StatusOK, model.InviteLinkResponse{SenderID: senderID})
}

// authMiddleware middleware для проверки авторизации
func (h *Handler) authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := ExtractToken(c)
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, model.ErrorResponse{Error: "missing_token"})
			return
		}

		claims, err := h.authService.ValidateAccessToken(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, model.ErrorResponse{Error: "invalid_token"})
			return
		}

		c.Set("user_id", claims.UserID)
		c.Set("user_type", claims.UserType)
		c.Next()
	}
}
