package main

import (
	"bytes"
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"
)

type Update struct {
	UpdateID int64    `json:"update_id"`
	Message  *Message `json:"message,omitempty"`
}

type Message struct {
	MessageID int64  `json:"message_id"`
	Text      string `json:"text"`
	From      *User  `json:"from"`
	Chat      *Chat  `json:"chat"`
}

type User struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
}

type Chat struct {
	ID       int64  `json:"id"`
	Username string `json:"username"`
	Type     string `json:"type"`
}

type GetUpdatesResponse struct {
	OK     bool     `json:"ok"`
	Result []Update `json:"result"`
}

func main() {
	botToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	apiBase := os.Getenv("API_BASE_URL")

	if botToken == "" || apiBase == "" {
		log.Fatal("TELEGRAM_BOT_TOKEN and API_BASE_URL must be set")
	}

	maskedToken := "****"
	if len(botToken) > 8 {
		maskedToken = botToken[:4] + "****" + botToken[len(botToken)-4:]
	}

	log.Printf("[binder] starting telegram-binder")
	log.Printf("[binder] TELEGRAM_BOT_TOKEN=%s", maskedToken)
	log.Printf("[binder] API_BASE_URL=%s", apiBase)

	offset := int64(0)
	client := &http.Client{Timeout: 15 * time.Second}

	for {
		log.Printf("[binder] polling Telegram with offset=%d", offset)
		if err := pollOnce(client, botToken, apiBase, &offset); err != nil {
			log.Printf("[binder] poll error: %v", err)
		}
		time.Sleep(2 * time.Second)
	}
}

func pollOnce(client *http.Client, botToken, apiBase string, offset *int64) error {
	url := "https://api.telegram.org/bot" + botToken + "/getUpdates?timeout=10"
	if *offset > 0 {
		url += "&offset=" + strconv.FormatInt(*offset, 10)
	}

	log.Printf("[binder] GET %s", url)

	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	log.Printf("[binder] Telegram getUpdates status=%d", resp.StatusCode)

	if resp.StatusCode != http.StatusOK {
		// Попробуем прочитать тело для диагностики
		var raw any
		if err := json.NewDecoder(resp.Body).Decode(&raw); err != nil {
			log.Printf("[binder] failed to decode error body from Telegram: %v", err)
		} else {
			b, _ := json.Marshal(raw)
			log.Printf("[binder] Telegram error body: %s", string(b))
		}
		return nil
	}

	var body GetUpdatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return err
	}
	if !body.OK {
		log.Printf("[binder] Telegram response ok=false")
		return nil
	}

	log.Printf("[binder] received %d updates", len(body.Result))

	for _, upd := range body.Result {
		log.Printf("[binder] update_id=%d", upd.UpdateID)
		*offset = upd.UpdateID + 1

		if upd.Message == nil {
			log.Printf("[binder] update_id=%d has no message", upd.UpdateID)
			continue
		}
		log.Printf(
			"[binder] message_id=%d text=%q from_username=%q chat_id=%d chat_username=%q chat_type=%q",
			upd.Message.MessageID,
			upd.Message.Text,
			usernameOrEmpty(upd.Message.From),
			chatIDOrZero(upd.Message.Chat),
			chatUsernameOrEmpty(upd.Message.Chat),
			chatTypeOrEmpty(upd.Message.Chat),
		)

		if upd.Message.Text == "" {
			continue
		}

		if upd.Message.Text == "/start" || (len(upd.Message.Text) >= 6 && upd.Message.Text[:6] == "/start") {
			log.Printf("[binder] /start detected")

			if upd.Message.From == nil || upd.Message.Chat == nil {
				log.Printf("[binder] /start has no from or chat, skipping")
				continue
			}

			username := upd.Message.From.Username
			if username == "" {
				username = upd.Message.Chat.Username
			}
			if username == "" {
				log.Printf("[binder] /start without username, cannot link chat, skipping")
				continue
			}

			chatID := upd.Message.Chat.ID
			telegramURL := normalizeUsername(username)

			log.Printf("[binder] Linking chat_id=%d to telegram_url=%s", chatID, telegramURL)

			payload := map[string]interface{}{
				"telegramUrl": telegramURL,
				"chatId":      chatID,
			}
			data, _ := json.Marshal(payload)

			req, err := http.NewRequestWithContext(
				context.Background(),
				http.MethodPost,
				apiBase+"/api/v1/internal/telegram/chat-link",
				bytes.NewReader(data),
			)
			if err != nil {
				log.Printf("[binder] build request error: %v", err)
				continue
			}
			req.Header.Set("Content-Type", "application/json")

			resp2, err := client.Do(req)
			if err != nil {
				log.Printf("[binder] chat-link error: %v", err)
				continue
			}
			defer resp2.Body.Close()

			log.Printf("[binder] chat-link status=%d", resp2.StatusCode)
			if resp2.StatusCode >= 400 {
				var raw any
				if err := json.NewDecoder(resp2.Body).Decode(&raw); err != nil {
					log.Printf("[binder] failed to decode chat-link error body: %v", err)
				} else {
					b, _ := json.Marshal(raw)
					log.Printf("[binder] chat-link error body: %s", string(b))
				}
			}
		}
	}

	return nil
}

func normalizeUsername(u string) string {
	if len(u) > 0 && u[0] == '@' {
		u = u[1:]
	}
	return u
}

func usernameOrEmpty(u *User) string {
	if u == nil {
		return ""
	}
	return u.Username
}

func chatIDOrZero(c *Chat) int64 {
	if c == nil {
		return 0
	}
	return c.ID
}

func chatUsernameOrEmpty(c *Chat) string {
	if c == nil {
		return ""
	}
	return c.Username
}

func chatTypeOrEmpty(c *Chat) string {
	if c == nil {
		return ""
	}
	return c.Type
}
