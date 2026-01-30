package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
)

type UserService interface {
	GetUser(ctx context.Context, id int64) (*model.TarelkaUserFull, error)
	GetUsersByTelegramID(ctx context.Context, telegramID int64) ([]*model.TarelkaUserFull, error)
	// Search users by name (person name/surname or company name)
	SearchUsersByName(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error)
	// Search users by Telegram handle/url
	SearchUsersByTelegram(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error)
	// Presign URL for uploading a user's logo image
	PresignLogoUpload(ctx context.Context, userID int64, contentType string) (key string, uploadURL string, headers map[string]string, err error)
	// Confirm upload and set final logo URL
	ConfirmLogoUpload(ctx context.Context, userID int64, key string, mimeType string, size int64) (logoURL string, err error)
	// Set logo from an external URL (e.g., Telegram avatar)
	SetLogoURLFromExternal(ctx context.Context, userID int64, url string) error
	// Wallpaper (cover) flows
	PresignWallpaperUpload(ctx context.Context, userID int64, contentType string) (key string, uploadURL string, headers map[string]string, err error)
	ConfirmWallpaperUpload(ctx context.Context, userID int64, key string, mimeType string, size int64) (wallpaperURL string, err error)
	SetWallpaperURLFromExternal(ctx context.Context, userID int64, url string) error

	// Update profile fields selectively
	UpdateUserProfile(ctx context.Context, userID int64, bio *string, findWork *model.FindWork, education *string) error

	// Delete user account
	DeleteUser(ctx context.Context, userID int64) error
}

type userService struct {
	tarelkaUserRepo repository.TarelkaUserRepository
	storage         StorageService
}

func NewUserService(tarelkaUserRepo repository.TarelkaUserRepository, storage StorageService) UserService {
	return &userService{
		tarelkaUserRepo: tarelkaUserRepo,
		storage:         storage,
	}
}

// GetUser получение полной информации о пользователе
func (s *userService) GetUser(ctx context.Context, id int64) (*model.TarelkaUserFull, error) {
	return s.tarelkaUserRepo.GetFullUser(ctx, id)
}

// GetUsersByTelegramID получение всех tarelka аккаунтов для telegram пользователя
func (s *userService) GetUsersByTelegramID(ctx context.Context, telegramID int64) ([]*model.TarelkaUserFull, error) {
	// TODO: Реализовать запрос всех аккаунтов по telegram_id
	return nil, nil
}

// SearchUsersByName delegates to repository
func (s *userService) SearchUsersByName(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.tarelkaUserRepo.SearchByName(ctx, q, limit, offset)
}

// SearchUsersByTelegram delegates to repository
func (s *userService) SearchUsersByTelegram(ctx context.Context, q string, limit, offset int) ([]*model.TarelkaUserFull, error) {
	if limit <= 0 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.tarelkaUserRepo.SearchByTelegram(ctx, q, limit, offset)
}

// PresignLogoUpload generates a presigned URL to upload user's logo to storage
func (s *userService) PresignLogoUpload(ctx context.Context, userID int64, contentType string) (string, string, map[string]string, error) {
	if s.storage == nil {
		return "", "", nil, fmt.Errorf("storage not configured")
	}
	// Canonicalize content type (aliases like image/jpg -> image/jpeg)
	contentType = canonicalizeContentType(contentType)
	// Generate key: user/{id}/logo.ext
	ext := mimeExtFromContentType(contentType)
	if ext == "" {
		ext = "bin"
	}
	key := fmt.Sprintf("user/%d/logo.%s", userID, ext)
	url, headers, err := s.storage.PresignPut(ctx, key, contentType, 15*time.Minute)
	if err != nil {
		return "", "", nil, err
	}
	return key, url, headers, nil
}

// PresignWallpaperUpload generates a presigned URL to upload user's wallpaper to storage
func (s *userService) PresignWallpaperUpload(ctx context.Context, userID int64, contentType string) (string, string, map[string]string, error) {
	if s.storage == nil {
		return "", "", nil, fmt.Errorf("storage not configured")
	}
	contentType = canonicalizeContentType(contentType)
	ext := mimeExtFromContentType(contentType)
	if ext == "" {
		ext = "bin"
	}
	key := fmt.Sprintf("user/%d/wallpaper.%s", userID, ext)
	url, headers, err := s.storage.PresignPut(ctx, key, contentType, 15*time.Minute)
	if err != nil {
		return "", "", nil, err
	}
	return key, url, headers, nil
}

// ConfirmWallpaperUpload persists final wallpaper URL after successful upload
func (s *userService) ConfirmWallpaperUpload(ctx context.Context, userID int64, key string, mimeType string, size int64) (string, error) {
	if s.storage == nil {
		return "", fmt.Errorf("storage not configured")
	}
	if ct, err := s.storage.HeadContentType(ctx, key); err == nil && ct != "" {
		mimeType = ct
	}
	mimeType = canonicalizeContentType(mimeType)
	wallpaperURL := s.storage.PublicURL(key)
	if err := s.tarelkaUserRepo.UpdateWallpaperURL(ctx, userID, wallpaperURL); err != nil {
		return "", err
	}
	return wallpaperURL, nil
}

// SetWallpaperURLFromExternal validates and sets wallpaper_url from an external link
func (s *userService) SetWallpaperURLFromExternal(ctx context.Context, userID int64, url string) error {
	if url == "" || len(url) > 2000 {
		return fmt.Errorf("invalid url")
	}
	if !strings.HasPrefix(url, "https://") {
		return fmt.Errorf("url must be https")
	}
	return s.tarelkaUserRepo.UpdateWallpaperURL(ctx, userID, url)
}

// UpdateUserProfile updates bio/find_work/education
func (s *userService) UpdateUserProfile(ctx context.Context, userID int64, bio *string, findWork *model.FindWork, education *string) error {
	return s.tarelkaUserRepo.UpdateProfile(ctx, userID, bio, findWork, education)
}

// DeleteUser deletes user account and related data
func (s *userService) DeleteUser(ctx context.Context, userID int64) error {
	// Optionally: delete user files from storage (logos, wallpapers) — omitted for now
	return s.tarelkaUserRepo.Delete(ctx, userID)
}

// ConfirmLogoUpload persists final logo URL after successful upload
func (s *userService) ConfirmLogoUpload(ctx context.Context, userID int64, key string, mimeType string, size int64) (string, error) {
	if s.storage == nil {
		return "", fmt.Errorf("storage not configured")
	}
	// Try to read actual Content-Type via HEAD; fall back to provided mimeType
	if ct, err := s.storage.HeadContentType(ctx, key); err == nil && ct != "" {
		mimeType = ct
	}
	// Canonicalize
	mimeType = canonicalizeContentType(mimeType)
	// Derive public URL (or presigned GET if using private strategy)
	logoURL := s.storage.PublicURL(key)
	// Update repository
	if err := s.tarelkaUserRepo.UpdateLogoURL(ctx, userID, logoURL); err != nil {
		return "", err
	}
	return logoURL, nil
}

// SetLogoURLFromExternal validates and sets logo_url from an external link
func (s *userService) SetLogoURLFromExternal(ctx context.Context, userID int64, url string) error {
	// Basic validation: require https and a reasonable length
	if url == "" || len(url) > 2000 {
		return fmt.Errorf("invalid url")
	}
	if !strings.HasPrefix(url, "https://") {
		return fmt.Errorf("url must be https")
	}
	// Optional: domain allowlist (e.g., t.me, telegram.org)
	// For now, accept any https; can be tightened later.
	return s.tarelkaUserRepo.UpdateLogoURL(ctx, userID, url)
}

// mimeExtFromContentType provides a conservative file extension from MIME type
func mimeExtFromContentType(ct string) string {
	switch ct {
	case "image/jpeg":
		return "jpg"
	case "image/png":
		return "png"
	case "image/webp":
		return "webp"
	case "image/svg+xml":
		return "svg"
	default:
		return ""
	}
}

// canonicalizeContentType normalizes common alias MIME types to canonical ones
func canonicalizeContentType(ct string) string {
	if ct == "" {
		return ct
	}
	ct = strings.TrimSpace(strings.ToLower(ct))
	switch ct {
	case "image/jpg":
		return "image/jpeg"
	case "image/x-png":
		return "image/png"
	case "image/pjpeg":
		return "image/jpeg"
	case "image/x-webp":
		return "image/webp"
	case "image/svg":
		return "image/svg+xml"
	default:
		return ct
	}
}
