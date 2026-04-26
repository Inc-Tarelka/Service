package model

import "time"

type ActivityType string

const (
	ActivityTypeSearch            ActivityType = "Search"
	ActivityTypeCreatePublication ActivityType = "CreatePublication"
	ActivityTypeLike              ActivityType = "Like"
	ActivityTypeComment           ActivityType = "Comment"
)

type Activity struct {
	ID            int64        `db:"id"`
	Type          ActivityType `db:"type"`
	Time          time.Time    `db:"time"`
	TarelkaUserID int64        `db:"tarelka_user_id"`
}
