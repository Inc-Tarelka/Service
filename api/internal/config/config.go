package config

import (
	"os"
	"time"
)

type Config struct {
	Environment          string
	Port                 string
	DatabaseURL          string
	JWTSecret            string
	TelegramBotToken     string
	TelegramGatewayToken string
	TelegramGatewayURL   string
	// TelegramAPIBaseURL переопределяет базовый URL для Telegram Bot API
	// По умолчанию используется https://api.telegram.org, но может быть проксирован
	// через Cloudflare Workers или другой шлюз.
	TelegramAPIBaseURL string
	// TelegramProxySecret добавляется в заголовок X-Secret при обращении к
	// Telegram Bot API и Telegram Gateway (для работы через прокси/воркер).
	TelegramProxySecret string
	InviteSecret        string
	AccessTokenTTL      time.Duration
	RefreshTokenTTL     time.Duration
	// CORS configuration
	// AllowedOrigins: exact origins allowed, e.g. "https://talerla-dev-app.web.app"
	// AllowedOriginSuffixes: domain suffixes allowed, e.g. ".trycloudflare.com" to match any subdomain
	AllowedOrigins        []string
	AllowedOriginSuffixes []string

	// S3/Storage configuration
	S3Endpoint        string
	S3Region          string
	S3Bucket          string
	S3AccessKeyID     string
	S3SecretAccessKey string
	S3UsePathStyle    bool
	CDNBaseURL        string
	// S3PublicDomain optional public domain for bucket (e.g., <bucketUUID>.selstorage.ru)
	S3PublicDomain string
}

func Load() *Config {
	return &Config{
		Environment:          getEnv("ENVIRONMENT", "development"),
		Port:                 getEnv("PORT", "8080"),
		DatabaseURL:          getEnv("DATABASE_URL", "postgres://tarelka:tarelka@localhost:5432/tarelka?sslmode=disable"),
		JWTSecret:            getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		TelegramBotToken:     getEnv("TELEGRAM_BOT_TOKEN", ""),
		TelegramGatewayToken: getEnv("TELEGRAM_GATEWAY_TOKEN", ""),
		TelegramGatewayURL:   getEnv("TELEGRAM_GATEWAY_URL", "https://gatewayapi.telegram.org"),
		TelegramAPIBaseURL:   getEnv("TELEGRAM_API_BASE_URL", "https://api.telegram.org"),
		TelegramProxySecret:  getEnv("TELEGRAM_PROXY_SECRET", ""),
		InviteSecret:         getEnv("TELEGRAM_MINIAPP_SECRET", ""),
		AccessTokenTTL:       parseDuration(getEnv("ACCESS_TOKEN_TTL", "15m")),
		RefreshTokenTTL:      parseDuration(getEnv("REFRESH_TOKEN_TTL", "168h")), // 7 days
		// Defaults suitable for development; can be overridden via env:
		// ALLOWED_ORIGINS and ALLOWED_ORIGIN_SUFFIXES (comma-separated)
		AllowedOrigins:        splitAndTrim(getEnv("ALLOWED_ORIGINS", "https://talerla-dev-app.web.app,https://tarelka-app.pages.dev")),
		AllowedOriginSuffixes: splitAndTrim(getEnv("ALLOWED_ORIGIN_SUFFIXES", ".trycloudflare.com")),

		// S3/Storage
		S3Endpoint:        getEnv("S3_ENDPOINT", ""),
		S3Region:          getEnv("S3_REGION", ""),
		S3Bucket:          getEnv("S3_BUCKET", ""),
		S3AccessKeyID:     getEnv("S3_ACCESS_KEY_ID", ""),
		S3SecretAccessKey: getEnv("S3_SECRET_ACCESS_KEY", ""),
		S3UsePathStyle:    parseBool(getEnv("S3_USE_PATH_STYLE", "true")),
		CDNBaseURL:        getEnv("CDN_BASE_URL", ""),
		S3PublicDomain:    getEnv("S3_PUBLIC_DOMAIN", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func parseDuration(s string) time.Duration {
	d, err := time.ParseDuration(s)
	if err != nil {
		return 15 * time.Minute
	}
	return d
}

// parseBool parses a boolean string; defaults to false on error
func parseBool(s string) bool {
	if s == "" {
		return false
	}
	switch s {
	case "1", "true", "TRUE", "True", "yes", "YES", "Yes", "y":
		return true
	case "0", "false", "FALSE", "False", "no", "NO", "No", "n":
		return false
	default:
		return false
	}
}

// splitAndTrim splits a comma-separated string and trims spaces; empty input yields empty slice
func splitAndTrim(s string) []string {
	if s == "" {
		return []string{}
	}
	// simple splitter; avoids pulling extra deps
	// Note: we avoid importing strings at package level to keep dependencies minimal
	var res []string
	start := 0
	for i := 0; i <= len(s); i++ {
		if i == len(s) || s[i] == ',' {
			part := s[start:i]
			// trim spaces
			// manual trim to avoid adding strings import; handles leading/trailing spaces
			// left trim
			for len(part) > 0 && (part[0] == ' ' || part[0] == '\t' || part[0] == '\n' || part[0] == '\r') {
				part = part[1:]
			}
			// right trim
			for len(part) > 0 && (part[len(part)-1] == ' ' || part[len(part)-1] == '\t' || part[len(part)-1] == '\n' || part[len(part)-1] == '\r') {
				part = part[:len(part)-1]
			}
			if part != "" {
				res = append(res, part)
			}
			start = i + 1
		}
	}
	return res
}
