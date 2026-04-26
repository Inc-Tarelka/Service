package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	docs "github.com/Inc-Tarelka/api/docs"
	"github.com/Inc-Tarelka/api/internal/config"
	"github.com/Inc-Tarelka/api/internal/handler"
	"github.com/Inc-Tarelka/api/internal/repository"
	"github.com/Inc-Tarelka/api/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title Tarelka API
// @version 1.0
// @description Backend API для Telegram Mini App Tarelka
// @host localhost:8080
// @BasePath /api/v1
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
func main() {
	// Load config
	cfg := config.Load()

	// Database connection
	ctx := context.Background()
	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Unable to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Unable to ping database: %v", err)
	}
	log.Println("Connected to database")

	// Initialize repositories
	repos := repository.NewRepositories(pool)

	// Initialize services
	// Initialize storage (optional: only if configured)
	var storage service.StorageService
	if cfg.S3Endpoint != "" && cfg.S3Bucket != "" && cfg.S3AccessKeyID != "" && cfg.S3SecretAccessKey != "" && cfg.S3Region != "" {
		st, err := service.NewS3Storage(cfg)
		if err != nil {
			log.Printf("failed to init storage: %v", err)
		} else {
			storage = st
			log.Println("Storage initialized")
		}
	} else {
		log.Println("Storage is not configured; logo uploads via S3 will be disabled")
	}

	services := service.NewServices(service.Deps{
		Repos:                repos,
		TokenSecret:          cfg.JWTSecret,
		AccessTokenTTL:       cfg.AccessTokenTTL,
		RefreshTokenTTL:      cfg.RefreshTokenTTL,
		TelegramBotToken:     cfg.TelegramBotToken,
		TelegramGatewayToken: cfg.TelegramGatewayToken,
		TelegramGatewayURL:   cfg.TelegramGatewayURL,
		InviteSecret:         cfg.InviteSecret,
		TelegramAPIBaseURL:   cfg.TelegramAPIBaseURL,
		TelegramProxySecret:  cfg.TelegramProxySecret,
		Storage:              storage,
	})

	// Initialize handlers
	handlers := handler.NewHandler(services)

	// Setup router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.Default()

	// CORS middleware: allow specific dev origins and Cloudflare tunnels
	// Defaults come from config and can be overridden via env:
	// ALLOWED_ORIGINS, ALLOWED_ORIGIN_SUFFIXES (comma-separated)
	if len(cfg.AllowedOrigins) > 0 || len(cfg.AllowedOriginSuffixes) > 0 {
		router.Use(func(c *gin.Context) {
			origin := c.Request.Header.Get("Origin")

			allowed := false
			if origin != "" {
				// exact matches
				for _, o := range cfg.AllowedOrigins {
					if origin == o {
						allowed = true
						break
					}
				}
				// suffix matches (*.domain)
				if !allowed {
					for _, suf := range cfg.AllowedOriginSuffixes {
						if suf != "" && strings.HasSuffix(origin, suf) {
							allowed = true
							break
						}
					}
				}
			}

			if allowed {
				// Vary is recommended for proper caching behavior when Origin changes
				c.Writer.Header().Add("Vary", "Origin")
				c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
				c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept, Origin, X-Requested-With")
				// No cookies used; do not set Allow-Credentials to true
				// c.Writer.Header().Set("Access-Control-Allow-Credentials", "false") // usually omitted

				// Handle preflight
				if c.Request.Method == http.MethodOptions {
					c.AbortWithStatus(http.StatusNoContent)
					return
				}
			}

			c.Next()
		})
	}

	// Configure Swagger to use correct host/scheme in production
	// This avoids Swagger trying to call localhost:8080 over HTTP when served via HTTPS
	// and prevents CORS/mixed content errors.
	docs.SwaggerInfo.BasePath = "/api/v1"
	if cfg.Environment == "production" {
		// Keep host empty in production to use the current request host
		// (avoids hardcoded domain mismatches between environments).
		docs.SwaggerInfo.Host = ""
		docs.SwaggerInfo.Schemes = []string{"https"}
	} else {
		// For local/dev use HTTP and localhost
		docs.SwaggerInfo.Host = "localhost:" + cfg.Port
		docs.SwaggerInfo.Schemes = []string{"http"}
	}

	// Backward compatibility for Swagger UI instances trying to load
	// /swagger/v1/swagger.json instead of /swagger/doc.json.
	router.GET("/swagger/v1/swagger.json", func(c *gin.Context) {
		c.Data(http.StatusOK, "application/json; charset=utf-8", []byte(docs.SwaggerInfo.ReadDoc()))
	})

	// Swagger
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.URL("/swagger/doc.json")))

	// Register routes
	handlers.RegisterRoutes(router)

	// Server
	srv := &http.Server{
		Addr:         ":" + cfg.Port,
		Handler:      router,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// Graceful shutdown
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()
	log.Printf("Server started on port %s", cfg.Port)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}
	log.Println("Server exited")
}
