package service

import (
	"context"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
)

type ActivityService interface {
	Log(ctx context.Context, userID int64, activityType model.ActivityType) error
}

type activityService struct {
	repo repository.ActivityRepository
}

func NewActivityService(repo repository.ActivityRepository) ActivityService {
	return &activityService{repo: repo}
}

func (s *activityService) Log(ctx context.Context, userID int64, activityType model.ActivityType) error {
	activity := &model.Activity{
		TarelkaUserID: userID,
		Type:          activityType,
		Time:          time.Now().UTC(),
	}
	return s.repo.Create(ctx, activity)
}
