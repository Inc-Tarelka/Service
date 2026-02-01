package handler

import (
	"net/http"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
)

// Handler содержит все обработчики
type Handler struct {
	auth        *AuthHandler
	user        *UserHandler
	reference   *ReferenceHandler
	publication *PublicationHandler

	authService service.AuthService
}

// NewHandler создаёт Handler
func NewHandler(services *service.Services) *Handler {
	return &Handler{
		auth:        NewAuthHandler(services.Auth),
		user:        NewUserHandler(services.User),
		reference:   NewReferenceHandler(services.Reference),
		publication: NewPublicationHandler(services.Publication),
		authService: services.Auth,
	}
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
		}

		// Protected routes
		protected := api.Group("")
		protected.Use(h.authMiddleware())
		{
			// Users
			users := protected.Group("/users")
			{
				users.GET("/me", h.user.GetCurrentUser)
				users.GET("/:id", h.user.GetUser)
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
				// Partial update and delete
				users.PATCH(":id", h.user.PatchUser)
				users.DELETE("/me", h.user.DeleteCurrentUser)
			}

			// Publications
			pubs := protected.Group("/publications")
			{
				pubs.POST("", h.publication.CreatePublication)
				pubs.PUT(":id", h.publication.UpdatePublication)
				pubs.POST(":id/comments", h.publication.AddComment)
				pubs.POST(":id/likes", h.publication.LikePublication)
				pubs.GET("/search", h.publication.SearchPublications)
				// Images upload for publications
				pubs.POST("/images/presign", h.publication.PresignImagesGeneric)
				pubs.POST(":id/images/presign", h.publication.PresignImagesForPublication)
				pubs.POST(":id/images", h.publication.AttachImagesToPublication)
			}
		}
	}
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
