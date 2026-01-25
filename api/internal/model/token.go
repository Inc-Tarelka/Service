package model

import (
	"time"
)

// RefreshToken - токен обновления
type RefreshToken struct {
	ID            int64     `json:"id" db:"id"`
	TarelkaUserID int64     `json:"tarelka_user_id" db:"tarelka_user_id"`
	Token         string    `json:"token" db:"token"`
	ExpiresAt     time.Time `json:"expires_at" db:"expires_at"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	Revoked       bool      `json:"revoked" db:"revoked"`
}

// TokenPair - пара access/refresh токенов
type TokenPair struct {
	AccessToken  string `json:"accessToken"`
	RefreshToken string `json:"refreshToken"`
}

// JWTClaims - claims для JWT токена
type JWTClaims struct {
	UserID   int64       `json:"user_id"`
	UserType AccountType `json:"user_type"`
}
