package internal

import (
	"fmt"

	"github.com/gorilla/websocket"
)

type ClientManager struct {
	Clients    map[*websocket.Conn]bool
	Broadcast  chan []byte
	Register   chan *websocket.Conn
	Unregister chan *websocket.Conn
}

func (manager *ClientManager) Start() {
	for {
		select {
		case conn := <-manager.Register:
			manager.Clients[conn] = true
		case conn := <-manager.Unregister:
			if _, ok := manager.Clients[conn]; ok {
				delete(manager.Clients, conn)
				conn.Close()
			}
		case message := <-manager.Broadcast:
			for conn := range manager.Clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					fmt.Printf("Websocket error: %s\n", err)
					conn.Close()
					delete(manager.Clients, conn)
				}
			}
		}
	}
}
