package service

import (
	"context"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
)

type ReferenceService interface {
	GetSpecializations(ctx context.Context) ([]model.Specialization, error)
	GetDirections(ctx context.Context) ([]model.Direction, error)
	GetCities(ctx context.Context) ([]model.City, error)
}

type referenceService struct {
	referenceRepo repository.ReferenceRepository
}

func NewReferenceService(referenceRepo repository.ReferenceRepository) ReferenceService {
	return &referenceService{
		referenceRepo: referenceRepo,
	}
}

func (s *referenceService) GetSpecializations(ctx context.Context) ([]model.Specialization, error) {
	return s.referenceRepo.GetAllSpecializations(ctx)
}

func (s *referenceService) GetDirections(ctx context.Context) ([]model.Direction, error) {
	return s.referenceRepo.GetAllDirections(ctx)
}

func (s *referenceService) GetCities(ctx context.Context) ([]model.City, error) {
	return s.referenceRepo.GetAllCities(ctx)
}
