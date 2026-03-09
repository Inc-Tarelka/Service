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

	offset := int64(0)
	client := &http.Client{Timeout: 10 * time.Second}

	for {
		if err := pollOnce(client, botToken, apiBase, &offset); err != nil {
			log.Printf("poll error: %v", err)
		}
		time.Sleep(2 * time.Second)
	}
}

func pollOnce(client *http.Client, botToken, apiBase string, offset *int64) error {
	url := "https://api.telegram.org/bot" + botToken + "/getUpdates?timeout=10"
	if *offset > 0 {
		url += "&offset=" + strconv.FormatInt(*offset, 10)
	}

	resp, err := client.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var body GetUpdatesResponse
	if err := json.NewDecoder(resp.Body).Decode(&body); err != nil {
		return err
	}
	if !body.OK {
		return nil
	}

	for _, upd := range body.Result {
		*offset = upd.UpdateID + 1

		if upd.Message == nil {
			continue
		}
		if upd.Message.Text == "" {
			continue
		}

		if upd.Message.Text == "/start" || len(upd.Message.Text) >= 6 && upd.Message.Text[:6] == "/start" {
			if upd.Message.From == nil || upd.Message.Chat == nil {
				continue
			}

			username := upd.Message.From.Username
			if username == "" {
				username = upd.Message.Chat.Username
			}
			if username == "" {
				continue
			}

			chatID := upd.Message.Chat.ID
			telegramURL := normalizeUsername(username)

			log.Printf("Linking chat_id=%d to telegram_url=%s", chatID, telegramURL)

			payload := map[string]interface{}{
				"telegramUrl": telegramURL,
				"chatId":      chatID,
			}
			data, _ := json.Marshal(payload)

			req, err := http.NewRequestWithContext(context.Background(),
				http.MethodPost,
				apiBase+"/api/v1/internal/telegram/chat-link",
				bytes.NewReader(data),
			)
			if err != nil {
				log.Printf("build request error: %v", err)
				continue
			}
			req.Header.Set("Content-Type", "application/json")

			resp2, err := client.Do(req)
			if err != nil {
				log.Printf("chat-link error: %v", err)
				continue
			}
			resp2.Body.Close()
			if resp2.StatusCode >= 400 {
				log.Printf("chat-link returned status %d", resp2.StatusCode)
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
