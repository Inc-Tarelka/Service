package service

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
)

type NotificationService interface {
	SendCollaborationNotification(ctx context.Context, creatorID, receiverID, publicationID int64, message *string) (*model.Notification, error)
	ListCollaborationNotifications(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error)
}

type notificationService struct {
	notifRepo       repository.NotificationRepository
	tarelkaUserRepo repository.TarelkaUserRepository
	botToken        string
	httpClient      *http.Client
}

func NewNotificationService(
	notifRepo repository.NotificationRepository,
	tarelkaUserRepo repository.TarelkaUserRepository,
	botToken string,
) NotificationService {
	return &notificationService{
		notifRepo:       notifRepo,
		tarelkaUserRepo: tarelkaUserRepo,
		botToken:        botToken,
		httpClient:      &http.Client{Timeout: 5 * time.Second},
	}
}

func (s *notificationService) SendCollaborationNotification(
	ctx context.Context,
	creatorID, receiverID, publicationID int64,
	message *string,
) (*model.Notification, error) {
	notif := &model.Notification{
		Type:          model.NotificationTypeCollaboration,
		PublicationID: &publicationID,
		CreatorID:     creatorID,
		ReceiverID:    receiverID,
		Message:       message,
		IsRead:        false,
	}

	created, err := s.notifRepo.Create(ctx, notif)
	if err != nil {
		return nil, err
	}

	receiver, err := s.tarelkaUserRepo.FindByID(ctx, receiverID)
	if err != nil {
		return created, nil
	}

	// Используем только tg_user_id для отправки сообщения в бота.
	// Поле tg_user_id не может быть пустым, поэтому дополнительных fallbacks не делаем.
	chatID := fmt.Sprintf("%d", receiver.TgUserID)

	text := buildCollaborationMessage(created, message)
	_ = s.sendTelegramMessage(ctx, chatID, text)

	return created, nil
}

func (s *notificationService) ListCollaborationNotifications(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error) {
	return s.notifRepo.ListByReceiverAndType(ctx, userID, model.NotificationTypeCollaboration, limit, offset)
}

func normalizeTelegramURL(url string) string {
	u := strings.TrimSpace(url)
	u = strings.TrimPrefix(u, "https://t.me/")
	if !strings.HasPrefix(u, "@") {
		u = "@" + u
	}
	return u
}

func buildCollaborationMessage(n *model.Notification, msg *string) string {
	base := "У вас новая заявка на сотрудничество в Tarelka"
	if msg != nil && *msg != "" {
		return base + ":\n\n" + *msg
	}
	return base
}

func (s *notificationService) sendTelegramMessage(ctx context.Context, chatID, text string) error {
	if s.botToken == "" {
		return nil
	}

	body := map[string]string{
		"chat_id": chatID,
		"text":    text,
	}
	data, err := json.Marshal(body)
	if err != nil {
		return err
	}

	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", s.botToken)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("telegram sendMessage failed with status %d", resp.StatusCode)
	}

	return nil
}
