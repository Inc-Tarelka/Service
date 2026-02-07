package model

import "time"

// PublicationType — тип публикации
type PublicationType string

const (
	PublicationTypeProject PublicationType = "PROJECT"
	PublicationTypeService PublicationType = "SERVICE"
)

// Publication — сущность поста/публикации
type Publication struct {
	ID            int64              `json:"id" db:"id"`
	AuthorID      int64              `json:"authorId" db:"author_id"`
	Name          string             `json:"name" db:"name"`
	Description   string             `json:"description" db:"description"`
	Type          PublicationType    `json:"type" db:"type"`
	CityID        *int64             `json:"cityId,omitempty" db:"city_id"`
	Images        []PublicationImage `json:"images,omitempty"`
	Tags          []PublicationTag   `json:"tags,omitempty"`
	CoAuthors     []TarelkaUser      `json:"coAuthors,omitempty"`
	Needs         []Need             `json:"needs,omitempty"`
	LikesCount    int64              `json:"likesCount,omitempty"`
	CommentsCount int64              `json:"commentsCount,omitempty"`
	// TopImageURL — URL изображения с приоритетом 1, если задано
	TopImageURL *string `json:"topImageUrl,omitempty"`
	// AuthorTelegramURL — ссылка на Telegram автора, если задано
	AuthorTelegramURL *string   `json:"authorTelegramUrl,omitempty" db:"telegram_url"`
	CreatedAt         time.Time `json:"createdAt" db:"created_at"`
}

// PublicationSearchFilters — параметры фильтрации для поиска публикаций
type PublicationSearchFilters struct {
	// Type — тип публикации (PROJECT | SERVICE)
	Type *PublicationType `json:"type,omitempty"`
	// CityID — город публикации
	CityID *int64 `json:"cityId,omitempty"`
	// Name — поиск по названию публикации (ILIKE)
	Name *string `json:"name,omitempty"`
	// WorkingStatus — статус поиска работы автора публикации (LOOKING | NOT_LOOKING | OPEN_TO_OFFERS)
	WorkingStatus *FindWork `json:"workingStatus,omitempty"`
	// SpecializationID — специализация автора публикации
	SpecializationID *int64 `json:"specializationId,omitempty"`
	// TagIDs — фильтрация по тегам публикации (любой из выбранных)
	TagIDs []int64 `json:"tagIds,omitempty"`
}

type PublicationImage struct {
	ID       int64  `json:"id" db:"id"`
	URL      string `json:"url" db:"url"`
	Position *int   `json:"position,omitempty" db:"position"`
}

type PublicationTag struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

type Need struct {
	ID            int64      `json:"id" db:"id"`
	PublicationID int64      `json:"publicationId" db:"publication_id"`
	Name          string     `json:"name" db:"name"`
	Description   string     `json:"description" db:"description"`
	Budget        int64      `json:"budget" db:"budget"`
	DeadlineStart *time.Time `json:"deadlineStart,omitempty" db:"deadline_start"`
	DeadlineEnd   *time.Time `json:"deadlineEnd,omitempty" db:"deadline_end"`
	CityID        *int64     `json:"cityId,omitempty" db:"city_id"`
	Tags          []NeedTag  `json:"tags,omitempty"`
}

type NeedTag struct {
	ID   int64  `json:"id" db:"id"`
	Name string `json:"name" db:"name"`
}

// NeedSearchFilters — параметры поиска потребностей
type NeedSearchFilters struct {
	CityID            *int64     `json:"cityId,omitempty"`
	Name              *string    `json:"name,omitempty"`
	PublicationTagIDs []int64    `json:"publicationTagIds,omitempty"`
	NeedTagIDs        []int64    `json:"needTagIds,omitempty"`
	Date              *time.Time `json:"date,omitempty"` // попадание даты в [deadline_start, deadline_end]
	BudgetMax         *int64     `json:"budgetMax,omitempty"`
}

// NeedSearchItem — результат поиска потребностей
type NeedSearchItem struct {
	ID                     int64   `json:"id"`
	Name                   string  `json:"name"`
	Description            string  `json:"description"`
	PublicationName        string  `json:"publicationName"`
	PublicationDescription string  `json:"publicationDescription"`
	CityName               *string `json:"cityName,omitempty"`
}

type Like struct {
	ID        int64     `json:"id" db:"id"`
	AuthorID  int64     `json:"authorId" db:"author_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

type Comment struct {
	ID        int64     `json:"id" db:"id"`
	Content   string    `json:"content" db:"content"`
	AuthorID  int64     `json:"authorId" db:"author_id"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
}

// DTOs for requests
type CreateOrUpdatePublicationRequest struct {
	Name        string           `json:"name" binding:"required"`
	Description string           `json:"description"`
	Type        PublicationType  `json:"type" binding:"required,oneof=PROJECT SERVICE"`
	CityID      *int64           `json:"cityId"`
	ImageURLs   []string         `json:"imageUrls"`
	TagIDs      []int64          `json:"tagIds"`
	CoAuthorIDs []int64          `json:"coAuthorIds"`
	Needs       []NeedUpsertItem `json:"needs"`
}

type NeedUpsertItem struct {
	ID            *int64  `json:"id,omitempty"` // if provided, update; otherwise create
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	Budget        int64   `json:"budget"`
	DeadlineStart *string `json:"deadlineStart"` // ISO-8601
	DeadlineEnd   *string `json:"deadlineEnd"`
	CityID        *int64  `json:"cityId"`
	TagIDs        []int64 `json:"tagIds"`
}

type AddCommentRequest struct {
	Content string `json:"content" binding:"required"`
}

// Publication images upload DTOs
type FileUploadSpec struct {
	ContentType string `json:"contentType" binding:"required"`
}

type PresignPublicationImagesRequest struct {
	Files []FileUploadSpec `json:"files" binding:"required,dive"`
}

type PresignUploadItem struct {
	Key       string            `json:"key"`
	UploadURL string            `json:"uploadUrl"`
	Headers   map[string]string `json:"headers"`
	PublicURL string            `json:"publicUrl"`
}

type PresignPublicationImagesResponse struct {
	Items []PresignUploadItem `json:"items"`
}

type AttachPublicationImageItem struct {
	Key      string `json:"key" binding:"required"`
	Position *int   `json:"position,omitempty"`
}

type AttachPublicationImagesRequest struct {
	Items []AttachPublicationImageItem `json:"items" binding:"required,dive"`
}

type AttachPublicationImagesResponse struct {
	Images []PublicationImage `json:"images"`
}
