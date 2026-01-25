package service

import (
	"context"
	"errors"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
)

type PublicationService interface {
	CreatePublication(ctx context.Context, authorID int64, req model.CreateOrUpdatePublicationRequest) (int64, error)
	UpdatePublication(ctx context.Context, pubID int64, authorID int64, req model.CreateOrUpdatePublicationRequest) error
	AddComment(ctx context.Context, pubID int64, authorID int64, content string) (*model.Comment, error)
	LikePublication(ctx context.Context, pubID int64, authorID int64) error
}

type publicationService struct {
	repo repository.PublicationRepository
}

func NewPublicationService(repo repository.PublicationRepository) PublicationService {
	return &publicationService{repo: repo}
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
