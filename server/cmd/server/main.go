package main

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin
	},
}

// Client manager
type ClientManager struct {
	clients    map[*websocket.Conn]bool
	broadcast  chan []byte
	register   chan *websocket.Conn
	unregister chan *websocket.Conn
}

var manager = ClientManager{
	broadcast:  make(chan []byte),
	register:   make(chan *websocket.Conn),
	unregister: make(chan *websocket.Conn),
	clients:    make(map[*websocket.Conn]bool),
}

func (manager *ClientManager) start() {
	for {
		select {
		case conn := <-manager.register:
			manager.clients[conn] = true
		case conn := <-manager.unregister:
			if _, ok := manager.clients[conn]; ok {
				delete(manager.clients, conn)
				conn.Close()
			}
		case message := <-manager.broadcast:
			for conn := range manager.clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					fmt.Printf("Websocket error: %s\n", err)
					conn.Close()
					delete(manager.clients, conn)
				}
			}
		}
	}
}

func avgFloat64(arr []float64) float64 {
	var sum float64
	for _, val := range arr {
		sum += val
	}
	return sum / float64(len(arr))
}

func wsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Failed to upgrade:", err)
		return
	}
	manager.register <- conn

	var positions []float64

	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				manager.unregister <- conn
				break
			}
			if cmd := strings.Split(string(message), " "); cmd[0] == "pos" {
				convPos, err := strconv.ParseFloat(cmd[1], 64)
				if err != nil {
					fmt.Println("Failed to convert position:", err)
					continue
				}
				positions = append(positions, convPos)
				if len(positions) == 50 {
					fmt.Println("position avg:", avgFloat64(positions))
					positions = nil
				}
			}
		}
	}()
}

func main() {
	go manager.start()
	http.HandleFunc("/ws", wsHandler)

	fmt.Println("Starting WebSocket server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}
}
