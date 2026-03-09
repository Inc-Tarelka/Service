package model

import "time"

type NotificationType string

const (
	NotificationTypeCollaboration NotificationType = "Collaboration"
	NotificationTypeResponse      NotificationType = "Response"
	NotificationTypeNotice        NotificationType = "Notice"
)

type Notification struct {
	ID            int64            `json:"id"`
	Type          NotificationType `json:"type"`
	PublicationID *int64           `json:"publicationId,omitempty"`
	CreatedAt     time.Time        `json:"-"`
	CreatorID     int64            `json:"creatorId"`
	ReceiverID    int64            `json:"receiverId"`
	Message       *string          `json:"message,omitempty"`
	NeedID        *int64           `json:"needId,omitempty"`
	IsRead        bool             `json:"isRead"`
}

type NotificationResponse struct {
	ID            int64            `json:"id"`
	Type          NotificationType `json:"type"`
	PublicationID *int64           `json:"publicationId,omitempty"`
	CreatedAtISO  string           `json:"createdAt"`
	CreatorID     int64            `json:"creatorId"`
	ReceiverID    int64            `json:"receiverId"`
	Message       *string          `json:"message,omitempty"`
	NeedID        *int64           `json:"needId,omitempty"`
	IsRead        bool             `json:"isRead"`
}
