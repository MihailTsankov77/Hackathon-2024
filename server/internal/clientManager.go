package internal

import (
	"fmt"
	"log/slog"

	"github.com/gorilla/websocket"
)

type ClientManager struct {
	Clients    map[*websocket.Conn]int
	Broadcast  chan []byte
	Register   chan *websocket.Conn
	Unregister chan *websocket.Conn
}

func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-manager.Register:
			manager.Clients[conn] = -1
			slog.Info(fmt.Sprintf("Registered client: %v\n", conn.RemoteAddr()))
		case conn := <-manager.Unregister:
			delete(players.Values, manager.Clients[conn])
			delete(manager.Clients, conn)
			conn.Close()
			slog.Info(fmt.Sprintf("Unregitered client: %v\n", conn.RemoteAddr()))
		case message := <-manager.Broadcast:
			slog.Debug(fmt.Sprintf("Broadcasting message: %s", string(message)))
			for conn := range manager.Clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					slog.Error(fmt.Sprintf("Failed to write message: %v", err))
					conn.Close()
					delete(manager.Clients, conn)
				}
			}
		}
	}
}
