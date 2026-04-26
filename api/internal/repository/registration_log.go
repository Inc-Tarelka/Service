package repository

import (
	"context"
	"encoding/json"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/jackc/pgx/v5/pgxpool"
)

type RegistrationLogRepository interface {
	LogEvent(ctx context.Context, entry *RegistrationLogEntry) error
}

type RegistrationLogEntry struct {
	TarelkaUserID     *int64
	Phone             *string
	Event             model.RegistrationEvent
	ActionFlag        model.RegistrationActionFlag
	ConversationStage *int
	Metadata          map[string]any
}

type registrationLogRepository struct {
	pool *pgxpool.Pool
}

func NewRegistrationLogRepository(pool *pgxpool.Pool) RegistrationLogRepository {
	return &registrationLogRepository{pool: pool}
}

func (r *registrationLogRepository) LogEvent(ctx context.Context, e *RegistrationLogEntry) error {
	var metaJSON []byte
	if e.Metadata != nil {
		var err error
		metaJSON, err = json.Marshal(e.Metadata)
		if err != nil {
			return err
		}
	}

	query := `
		INSERT INTO registration_logs (tarelka_user_id, phone, event, action_flag, conversation_stage, metadata)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := r.pool.Exec(ctx, query,
		e.TarelkaUserID,
		e.Phone,
		e.Event,
		e.ActionFlag,
		e.ConversationStage,
		metaJSON,
	)
	return err
}
