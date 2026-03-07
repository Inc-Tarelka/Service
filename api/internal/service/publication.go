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
	AddComment(ctx context.Context, pubID int64, authorID int64, content string, parentCommentID *int64) (*model.Comment, error)
	GetServiceComments(ctx context.Context, pubID int64, limit, offset int) (int64, []model.PublicationCommentItem, error)
	// LikePublication теперь реализует toggle-логику и возвращает итоговое значение isLiked
	LikePublication(ctx context.Context, pubID int64, authorID int64) (bool, error)
	// PresignPublicationImages generates presigned PUT URLs for uploading images (optionally into a specific publication folder)
	PresignPublicationImages(ctx context.Context, authorID int64, pubID *int64, files []model.FileUploadSpec) ([]model.PresignUploadItem, error)
	// AttachPublicationImages confirms uploads and attaches them to a publication
	AttachPublicationImages(ctx context.Context, pubID int64, authorID int64, items []model.AttachPublicationImageItem) ([]model.PublicationImage, error)
	// SearchPublications returns publications filtered by optional params; userID нужен для поля IsLiked
	SearchPublications(ctx context.Context, f model.PublicationSearchFilters, limit, offset int, userID *int64) ([]model.Publication, error)
	// SearchNeeds returns needs filtered by optional params
	SearchNeeds(ctx context.Context, f model.NeedSearchFilters, limit, offset int) ([]model.NeedSearchItem, error)
	// GetNeed returns single need by id with its tags
	GetNeed(ctx context.Context, id int64) (*model.Need, error)
	// GetPublication returns single publication by id; userID нужен для поля IsLiked
	GetPublication(ctx context.Context, id int64, userID *int64) (*model.Publication, []model.PublicationTeamMember, []model.Need, error)
}

type publicationService struct {
	repo            repository.PublicationRepository
	storage         StorageService
	activityService ActivityService
}

func NewPublicationService(repo repository.PublicationRepository, storage StorageService, activitySvc ActivityService) PublicationService {
	return &publicationService{repo: repo, storage: storage, activityService: activitySvc}
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
	pubID, err := s.repo.Create(ctx, authorID, req)
	if err != nil {
		return 0, err
	}
	// Log activity, but don't fail the main flow if analytics logging fails
	if s.activityService != nil {
		_ = s.activityService.Log(ctx, authorID, model.ActivityTypeCreatePublication)
	}
	return pubID, nil
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

func (s *publicationService) AddComment(ctx context.Context, pubID int64, authorID int64, content string, parentCommentID *int64) (*model.Comment, error) {
	if content == "" {
		return nil, errors.New("content_required")
	}
	// если это ответ на комментарий, нужно убедиться, что публикация является услугой
	// ранее здесь была проверка на тип публикации (SERVICE) для ответов на комментарии,
	// теперь разрешаем ответы для любого типа публикации
	comment, err := s.repo.AddComment(ctx, pubID, authorID, content, parentCommentID)
	if err != nil {
		return nil, err
	}
	if s.activityService != nil {
		_ = s.activityService.Log(ctx, authorID, model.ActivityTypeComment)
	}
	return comment, nil
}

func (s *publicationService) GetServiceComments(ctx context.Context, pubID int64, limit, offset int) (int64, []model.PublicationCommentItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	return s.repo.GetServiceComments(ctx, pubID, limit, offset)
}

func (s *publicationService) LikePublication(ctx context.Context, pubID int64, authorID int64) (bool, error) {
	isLiked, err := s.repo.ToggleLike(ctx, pubID, authorID)
	if err != nil {
		return false, err
	}
	if s.activityService != nil {
		_ = s.activityService.Log(ctx, authorID, model.ActivityTypeLike)
	}
	return isLiked, nil
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

// GetPublication fetches single publication by id via repository.
// userID используется для заполнения поля IsLiked.
func (s *publicationService) GetPublication(ctx context.Context, id int64, userID *int64) (*model.Publication, []model.PublicationTeamMember, []model.Need, error) {
	pub, team, needs, err := s.repo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, nil, nil, err
	}
	return pub, team, needs, nil
}

// GetNeed fetches single need by id via repository.
func (s *publicationService) GetNeed(ctx context.Context, id int64) (*model.Need, error) {
	return s.repo.GetNeedByID(ctx, id)
}

// SearchPublications delegates to repository with minimal validation
// userID используется для заполнения поля IsLiked.
func (s *publicationService) SearchPublications(ctx context.Context, f model.PublicationSearchFilters, limit, offset int, userID *int64) ([]model.Publication, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	if f.Type != nil && *f.Type != model.PublicationTypeProject && *f.Type != model.PublicationTypeService {
		return nil, errors.New("invalid_type")
	}
	return s.repo.Search(ctx, f, limit, offset, userID)
}

// SearchNeeds delegates to repository with minimal validation
func (s *publicationService) SearchNeeds(ctx context.Context, f model.NeedSearchFilters, limit, offset int) ([]model.NeedSearchItem, error) {
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	if offset < 0 {
		offset = 0
	}
	if f.BudgetMax != nil && *f.BudgetMax < 0 {
		return nil, errors.New("budget_negative")
	}
	return s.repo.SearchNeeds(ctx, f, limit, offset)
}
