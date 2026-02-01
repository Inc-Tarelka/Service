package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
	"github.com/google/uuid"
)

type PublicationService interface {
	CreatePublication(ctx context.Context, authorID int64, req model.CreateOrUpdatePublicationRequest) (int64, error)
	UpdatePublication(ctx context.Context, pubID int64, authorID int64, req model.CreateOrUpdatePublicationRequest) error
	AddComment(ctx context.Context, pubID int64, authorID int64, content string) (*model.Comment, error)
	LikePublication(ctx context.Context, pubID int64, authorID int64) error
	// PresignPublicationImages generates presigned PUT URLs for uploading images (optionally into a specific publication folder)
	PresignPublicationImages(ctx context.Context, authorID int64, pubID *int64, files []model.FileUploadSpec) ([]model.PresignUploadItem, error)
	// AttachPublicationImages confirms uploads and attaches them to a publication
	AttachPublicationImages(ctx context.Context, pubID int64, authorID int64, items []model.AttachPublicationImageItem) ([]model.PublicationImage, error)
	// SearchPublications returns publications filtered by optional params
	SearchPublications(ctx context.Context, f model.PublicationSearchFilters, limit, offset int) ([]model.Publication, error)
}

type publicationService struct {
	repo    repository.PublicationRepository
	storage StorageService
}

func NewPublicationService(repo repository.PublicationRepository, storage StorageService) PublicationService {
	return &publicationService{repo: repo, storage: storage}
}

func (s *publicationService) CreatePublication(ctx context.Context, authorID int64, req model.CreateOrUpdatePublicationRequest) (int64, error) {
	if req.Name == "" {
		return 0, errors.New("name_required")
	}
	if req.Type != model.PublicationTypeProject && req.Type != model.PublicationTypeService {
		return 0, errors.New("invalid_type")
	}
	// Validate needs deadlines (basic)
	for _, n := range req.Needs {
		if n.DeadlineStart != nil && n.DeadlineEnd != nil {
			ds, err1 := time.Parse(time.RFC3339, *n.DeadlineStart)
			de, err2 := time.Parse(time.RFC3339, *n.DeadlineEnd)
			if err1 == nil && err2 == nil && de.Before(ds) {
				return 0, errors.New("deadline_end_before_start")
			}
		}
		if n.Budget < 0 {
			return 0, errors.New("budget_negative")
		}
	}
	return s.repo.Create(ctx, authorID, req)
}

func (s *publicationService) UpdatePublication(ctx context.Context, pubID int64, authorID int64, req model.CreateOrUpdatePublicationRequest) error {
	if req.Name == "" {
		return errors.New("name_required")
	}
	if req.Type != model.PublicationTypeProject && req.Type != model.PublicationTypeService {
		return errors.New("invalid_type")
	}
	for _, n := range req.Needs {
		if n.DeadlineStart != nil && n.DeadlineEnd != nil {
			ds, err1 := time.Parse(time.RFC3339, *n.DeadlineStart)
			de, err2 := time.Parse(time.RFC3339, *n.DeadlineEnd)
			if err1 == nil && err2 == nil && de.Before(ds) {
				return errors.New("deadline_end_before_start")
			}
		}
		if n.Budget < 0 {
			return errors.New("budget_negative")
		}
	}
	return s.repo.Update(ctx, pubID, authorID, req)
}

func (s *publicationService) AddComment(ctx context.Context, pubID int64, authorID int64, content string) (*model.Comment, error) {
	if content == "" {
		return nil, errors.New("content_required")
	}
	return s.repo.AddComment(ctx, pubID, authorID, content)
}

func (s *publicationService) LikePublication(ctx context.Context, pubID int64, authorID int64) error {
	return s.repo.AddLike(ctx, pubID, authorID)
}

// PresignPublicationImages generates presigned URLs for uploading multiple images.
// If pubID is provided, keys will be placed under publication/{pubID}/; otherwise under publication/tmp/{authorID}/.
func (s *publicationService) PresignPublicationImages(ctx context.Context, authorID int64, pubID *int64, files []model.FileUploadSpec) ([]model.PresignUploadItem, error) {
	if s.storage == nil {
		return nil, errors.New("storage not configured")
	}
	if len(files) == 0 {
		return []model.PresignUploadItem{}, nil
	}
	items := make([]model.PresignUploadItem, 0, len(files))
	for _, f := range files {
		ct := canonicalizeContentType(f.ContentType)
		ext := mimeExtFromContentType(ct)
		if ext == "" {
			ext = "bin"
		}
		uid := uuid.New().String()
		var key string
		if pubID != nil {
			key = fmt.Sprintf("publication/%d/%s.%s", *pubID, uid, ext)
		} else {
			key = fmt.Sprintf("publication/tmp/%d/%s.%s", authorID, uid, ext)
		}
		url, headers, err := s.storage.PresignPut(ctx, key, ct, 15*time.Minute)
		if err != nil {
			return nil, err
		}
		items = append(items, model.PresignUploadItem{
			Key:       key,
			UploadURL: url,
			Headers:   headers,
			PublicURL: s.storage.PublicURL(key),
		})
	}
	return items, nil
}

// AttachPublicationImages confirms uploaded keys and attaches them to the publication.
// Position will be taken from request item if provided; otherwise from array order.
func (s *publicationService) AttachPublicationImages(ctx context.Context, pubID int64, authorID int64, items []model.AttachPublicationImageItem) ([]model.PublicationImage, error) {
	if s.storage == nil {
		return nil, errors.New("storage not configured")
	}
	if len(items) == 0 {
		return []model.PublicationImage{}, nil
	}
	imgs := make([]model.PublicationImage, 0, len(items))
	for i, it := range items {
		// Try to read actual content type to validate; ignore errors for robustness
		if ct, err := s.storage.HeadContentType(ctx, it.Key); err == nil && ct != "" {
			_ = canonicalizeContentType(ct)
		}
		url := s.storage.PublicURL(it.Key)
		pos := it.Position
		if pos == nil {
			p := i
			pos = &p
		}
		imgs = append(imgs, model.PublicationImage{URL: url, Position: pos})
	}
	return s.repo.AddImages(ctx, pubID, authorID, imgs)
}

// SearchPublications delegates to repository with minimal validation
func (s *publicationService) SearchPublications(ctx context.Context, f model.PublicationSearchFilters, limit, offset int) ([]model.Publication, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	if f.Type != nil && *f.Type != model.PublicationTypeProject && *f.Type != model.PublicationTypeService {
		return nil, errors.New("invalid_type")
	}
	return s.repo.Search(ctx, f, limit, offset)
}
