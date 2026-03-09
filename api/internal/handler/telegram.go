package handler

import (
	"net/http"

	"github.com/Inc-Tarelka/api/internal/model"
	"github.com/Inc-Tarelka/api/internal/repository"
	"github.com/gin-gonic/gin"
)

type TelegramHandler struct {
	tarelkaRepo repository.TarelkaUserRepository
}

func NewTelegramHandler(repo repository.TarelkaUserRepository) *TelegramHandler {
	return &TelegramHandler{tarelkaRepo: repo}
}

type ChatLinkRequest struct {
	TelegramUrl string `json:"telegramUrl" binding:"required"`
	ChatID      int64  `json:"chatId" binding:"required"`
}

// LinkChatID привязывает telegram_chat_id к пользователю по его telegram_url
func (h *TelegramHandler) LinkChatID(c *gin.Context) {
	var req ChatLinkRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, model.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
		})
		return
	}

	// Формат telegramUrl должен совпадать с тем, что хранится в БД (без https://t.me/ и без @)
	if err := h.tarelkaRepo.UpdateTelegramChatIDByTelegramURL(c.Request.Context(), req.TelegramUrl, req.ChatID); err != nil {
		c.JSON(http.StatusInternalServerError, model.ErrorResponse{Error: "internal_error"})
		return
	}

	c.Status(http.StatusNoContent)
}
