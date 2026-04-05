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

	// Отклик на потребность
	SendNeedResponseNotification(ctx context.Context, creatorID, publicationID, needID int64, message *string) (*model.Notification, error)
	ListNeedResponseNotifications(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error)

	// Приглашение в команду (соавторы проекта)
	SendTeamInviteNotification(ctx context.Context, creatorID, publicationID, receiverID int64) (*model.Notification, error)
	RespondToTeamInvite(ctx context.Context, receiverID, notificationID int64, isApprove bool) (*model.Notification, error)

	// Общие ручки для уведомлений
	// Входящие уведомления для пользователя (где он receiver).
	ListIncomingNotifications(ctx context.Context, userID int64, nType *model.NotificationType, limit, offset int) ([]*model.NotificationWithCreator, error)
	// Исходящие уведомления для пользователя (где он creator).
	ListOutgoingNotifications(ctx context.Context, userID int64, nType *model.NotificationType, limit, offset int) ([]*model.NotificationWithCreator, error)
	// Получить одно уведомление по id для конкретного получателя с пометкой как прочитанное.
	GetNotificationForReceiver(ctx context.Context, id, receiverID int64) (*model.NotificationWithCreator, error)
}

type notificationService struct {
	notifRepo       repository.NotificationRepository
	tarelkaUserRepo repository.TarelkaUserRepository
	publicationRepo repository.PublicationRepository
	botToken        string
	httpClient      *http.Client
}

func NewNotificationService(
	notifRepo repository.NotificationRepository,
	tarelkaUserRepo repository.TarelkaUserRepository,
	publicationRepo repository.PublicationRepository,
	botToken string,
) NotificationService {
	return &notificationService{
		notifRepo:       notifRepo,
		tarelkaUserRepo: tarelkaUserRepo,
		publicationRepo: publicationRepo,
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

// SendNeedResponseNotification создаёт уведомление типа Response для отклика на потребность
// и отправляет Telegram-сообщение получателю.
func (s *notificationService) SendNeedResponseNotification(
	ctx context.Context,
	creatorID, publicationID, needID int64,
	message *string,
) (*model.Notification, error) {
	// 1. Проверяем, что потребность существует
	need, err := s.publicationRepo.GetNeedByID(ctx, needID)
	if err != nil {
		// Репозиторий возвращает ошибку с текстом "need not found" для несуществующей потребности.
		// Не заворачиваем её, чтобы хендлер мог различать 404 по строке.
		return nil, err
	}

	// 2. Получаем публикацию, к которой привязана потребность, чтобы узнать автора (получателя уведомления)
	pub, _, _, err := s.publicationRepo.GetByID(ctx, need.PublicationID, nil)
	if err != nil {
		return nil, err
	}
	receiverID := pub.AuthorID

	// 3. Создаём запись в notifications с type = Response и заполненным need_id
	notif := &model.Notification{
		Type:          model.NotificationTypeResponse,
		PublicationID: &publicationID,
		CreatorID:     creatorID,
		ReceiverID:    receiverID,
		Message:       message,
		NeedID:        &needID,
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

	chatID := fmt.Sprintf("%d", receiver.TgUserID)

	text := buildNeedResponseMessage(created, message)
	_ = s.sendTelegramMessage(ctx, chatID, text)

	return created, nil
}

func (s *notificationService) ListNeedResponseNotifications(ctx context.Context, userID int64, limit, offset int) ([]*model.Notification, error) {
	return s.notifRepo.ListByReceiverAndType(ctx, userID, model.NotificationTypeResponse, limit, offset)
}

func buildNeedResponseMessage(n *model.Notification, msg *string) string {
	base := "У вас новый отклик на потребность в Tarelka"
	if msg != nil && *msg != "" {
		return base + ":\n\n" + *msg
	}
	return base
}

// SendTeamInviteNotification создаёт уведомление-приглашение стать соавтором проекта
// и отправляет Telegram-сообщение получателю.
func (s *notificationService) SendTeamInviteNotification(
	ctx context.Context,
	creatorID, publicationID, receiverID int64,
) (*model.Notification, error) {
	// Проверяем, что публикация существует и является PROJECT, а creatorID — её автор
	pub, _, _, err := s.publicationRepo.GetByID(ctx, publicationID, nil)
	if err != nil {
		return nil, err
	}
	if pub.Type != model.PublicationTypeProject {
		return nil, fmt.Errorf("invalid_publication_type")
	}
	if pub.AuthorID != creatorID {
		return nil, fmt.Errorf("not_author_of_publication")
	}

	notif := &model.Notification{
		Type:          model.NotificationTypeTeamInvite,
		PublicationID: &publicationID,
		CreatorID:     creatorID,
		ReceiverID:    receiverID,
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

	chatID := fmt.Sprintf("%d", receiver.TgUserID)
	text := buildTeamInviteMessage(pub)
	_ = s.sendTelegramMessage(ctx, chatID, text)

	return created, nil
}

// RespondToTeamInvite фиксирует реакцию получателя на приглашение в команду
// и, в случае положительного ответа, добавляет пользователя в соавторы проекта.
func (s *notificationService) RespondToTeamInvite(
	ctx context.Context,
	receiverID, notificationID int64,
	isApprove bool,
) (*model.Notification, error) {
	// Загружаем уведомление, чтобы убедиться в типе и получателе
	n, err := s.notifRepo.GetByID(ctx, notificationID)
	if err != nil {
		return nil, err
	}
	if n.Type != model.NotificationTypeTeamInvite {
		return nil, fmt.Errorf("invalid_notification_type")
	}
	if n.ReceiverID != receiverID {
		return nil, fmt.Errorf("forbidden")
	}
	if n.IsApprove != nil {
		return nil, fmt.Errorf("already_responded")
	}

	// Обновляем флаг is_approve и помечаем уведомление прочитанным
	updated, err := s.notifRepo.SetApproval(ctx, notificationID, receiverID, isApprove)
	if err != nil {
		return nil, err
	}

	// При положительном ответе добавляем пользователя в соавторы проекта
	if isApprove {
		if updated.PublicationID == nil {
			return updated, nil
		}
		_ = s.publicationRepo.AddCoAuthor(ctx, *updated.PublicationID, receiverID)
	}

	return updated, nil
}

// ListIncomingNotifications возвращает входящие уведомления для пользователя.
func (s *notificationService) ListIncomingNotifications(
	ctx context.Context,
	userID int64,
	nType *model.NotificationType,
	limit, offset int,
) ([]*model.NotificationWithCreator, error) {
	return s.notifRepo.ListIncoming(ctx, userID, nType, limit, offset)
}

// ListOutgoingNotifications возвращает исходящие уведомления для пользователя.
func (s *notificationService) ListOutgoingNotifications(
	ctx context.Context,
	userID int64,
	nType *model.NotificationType,
	limit, offset int,
) ([]*model.NotificationWithCreator, error) {
	return s.notifRepo.ListOutgoing(ctx, userID, nType, limit, offset)
}

// GetNotificationForReceiver возвращает одно уведомление по id для конкретного получателя
// и помечает его прочитанным.
func (s *notificationService) GetNotificationForReceiver(
	ctx context.Context,
	id, receiverID int64,
) (*model.NotificationWithCreator, error) {
	return s.notifRepo.GetByIDForReceiverAndMarkRead(ctx, id, receiverID)
}

func buildTeamInviteMessage(pub *model.Publication) string {
	return fmt.Sprintf("Вас пригласили стать участником проекта \"%s\" в Tarelka", pub.Name)
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
