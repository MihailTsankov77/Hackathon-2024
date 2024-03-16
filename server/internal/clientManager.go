package internal

import (
	"fmt"

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
		case conn := <-manager.Unregister:
			delete(players, manager.Clients[conn])
			delete(manager.Clients, conn)
			conn.Close()
			fmt.Println("Unregistering client")
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
