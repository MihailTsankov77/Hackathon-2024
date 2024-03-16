package internal

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow connections from any origin
	},
}

var Manager = ClientManager{
	Clients:    make(map[*websocket.Conn]bool),
	Broadcast:  make(chan []byte),
	Register:   make(chan *websocket.Conn),
	Unregister: make(chan *websocket.Conn),
}

var playerIdCounter = 0

var players []Player

var playerConnections [][]int

var heartBeates = 0

var HeartbeatTicker = time.NewTicker(20 * time.Millisecond)

func Heartbeat() {
	if len(players) != 0 {
		heartBeates++
		if heartBeates == 50 {
			heartBeates = 0
			updatePlayers()
		}

		playersJson, err := json.Marshal(players)
		if err != nil {
			fmt.Println("Failed to marshal players:", err)
			return
		}

		Manager.Broadcast <- []byte(fmt.Sprintf("heartbeat %s", playersJson))

	}
}

func updatePlayers() {
	for i := range players {
		if players[i].Cooldown > 0 {
			players[i].Cooldown--
		}
		if len(playerConnections) == 0 {
			players[i].Points += 4
		} else {
			for playerConnId := range playerConnections {
				if playerConnections[playerConnId][0] == players[i].Id ||
					playerConnections[playerConnId][1] == players[i].Id {
					players[i].Points += 2
				} else {
					players[i].Points += 4
				}
			}
		}
	}
}

func WsHandler(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println("Failed to upgrade:", err)
		return
	}
	Manager.Register <- conn

	go func() {
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				fmt.Println("Failed to read message:", err)
				Manager.Unregister <- conn
				break
			}
			handleCommands(conn, message)
		}
	}()
}

func handleCommands(conn *websocket.Conn, message []byte) {
	cmd := strings.Split(string(message), " ")
	if cmd[0] == "connect" {
		pX, err := strconv.ParseFloat(cmd[1], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		pY, err := strconv.ParseFloat(cmd[2], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		player := Player{
			Id:       playerIdCounter,
			X:        pX,
			Y:        pY,
			Points:   0,
			Cooldown: 0,
		}
		playerIdCounter++

		players = append(players, player)
		fmt.Println("Number of players:", len(players))
		err = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("%d", player.Id)))
		if err != nil {
			fmt.Println("Failed to write message:", err)
		}
	} else if cmd[0] == "move" {
		playerId, err := strconv.Atoi(cmd[1])
		if err != nil {
			fmt.Println("Failed to convert player id:", err)
			return
		}

		pX, err := strconv.ParseFloat(cmd[2], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		pY, err := strconv.ParseFloat(cmd[3], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		for i := range players {
			if players[i].Id == playerId {
				players[i].X = pX
				players[i].Y = pY
			}
		}
	}
}
