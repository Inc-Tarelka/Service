package model

import "time"

type RegistrationEvent string

const (
	RegistrationEventPreRegisterCreated      RegistrationEvent = "pre_register_created"
	RegistrationEventPhoneCodeSent           RegistrationEvent = "phone_verification_code_sent"
	RegistrationEventPhoneCodeVerified       RegistrationEvent = "phone_verification_code_verified"
	RegistrationEventPhoneCodeInvalid        RegistrationEvent = "phone_verification_code_invalid"
	RegistrationEventPhoneCodeExpired        RegistrationEvent = "phone_verification_code_expired"
	RegistrationEventRegisterStage1Completed RegistrationEvent = "register_stage_1_completed"
	RegistrationEventRegisterStage2Completed RegistrationEvent = "register_stage_2_completed"
)

type RegistrationActionFlag string

const (
	RegistrationActionAttempt RegistrationActionFlag = "ATTEMPT"
	RegistrationActionSuccess RegistrationActionFlag = "SUCCESS"
	RegistrationActionFailure RegistrationActionFlag = "FAILURE"
)

type RegistrationLog struct {
	ID                int64                  `db:"id"`
	TarelkaUserID     *int64                 `db:"tarelka_user_id"`
	Phone             *string                `db:"phone"`
	Event             RegistrationEvent      `db:"event"`
	ActionFlag        RegistrationActionFlag `db:"action_flag"`
	ConversationStage *int                   `db:"conversation_stage"`
	Metadata          []byte                 `db:"metadata"`
	CreatedAt         time.Time              `db:"created_at"`
}
