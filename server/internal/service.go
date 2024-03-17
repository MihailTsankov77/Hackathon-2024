package internal

import (
	"fmt"
	"log/slog"
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin
	},
}

var Manager = ClientManager{
	Clients:    make(map[*websocket.Conn]int),
	Broadcast:  make(chan []byte),
	Register:   make(chan *websocket.Conn),
	Unregister: make(chan *websocket.Conn),
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		slog.Error(fmt.Sprintf("Failed to upgrade connection: %v", err))
		return
	}
	Manager.Register <- conn

	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				slog.Error(fmt.Sprintf("Failed to read message: %v", err))
				Manager.Unregister <- conn
				return
			}
			handleCommands(conn, message)
		}
	}()
}
