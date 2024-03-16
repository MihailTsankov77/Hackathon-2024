package internal

import (
	"fmt"
	"strconv"
	"strings"

	"github.com/gorilla/websocket"
)

type Player struct {
	Id       int     `json:"id"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Points   int     `json:"points"`
	Cooldown int     `json:"cooldown"`
}

var playerIdCounter = 0

var players []Player

var playerConnections [][]int

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
		Manager.Clients[conn] = player.Id
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
