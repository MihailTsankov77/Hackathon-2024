package internal

import (
	"encoding/json"
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

type Battle struct {
	Winners []int `json:"winners"`
	Losers  []int `json:"losers"`
}

var playerIdCounter = 0

var players map[int]Player = make(map[int]Player)

var playerConnections [][]int

func updatePlayers() {
	for _, player := range players {
		if player.Cooldown > 0 {
			player.Cooldown--
		}
		if isPlayerSolo(player) {
			player.Points += 4
			players[player.Id] = player
		} else {
			player.Points += 2
			players[player.Id] = player
		}
	}
}

func isPlayerSolo(player Player) bool {
	for playerConnId := range playerConnections {
		if playerConnections[playerConnId][0] == player.Id ||
			playerConnections[playerConnId][1] == player.Id {
			return false
		}
	}
	return true
}

func isPlayerDead(player Player) bool {
	return player.Points < 0
}

func handleCommands(conn *websocket.Conn, message []byte) {
	cmd := strings.SplitN(string(message), " ", 2)
	if cmd[0] == "join" {
		data := strings.Split(cmd[1], " ")
		pX, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		pY, err := strconv.ParseFloat(data[1], 64)
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

		players[player.Id] = player
		fmt.Println("Number of players:", len(players))
		Manager.Clients[conn] = player.Id
		err = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("id %d", player.Id)))
		if err != nil {
			fmt.Println("Failed to write message:", err)
		}
	} else if cmd[0] == "move" {
		data := strings.Split(cmd[1], " ")

		playerId := Manager.Clients[conn]

		pX, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		pY, err := strconv.ParseFloat(data[1], 64)
		if err != nil {
			fmt.Println("Failed to convert position:", err)
			return
		}

		players[playerId] = Player{
			Id:       players[playerId].Id,
			X:        pX,
			Y:        pY,
			Points:   players[playerId].Points,
			Cooldown: players[playerId].Cooldown,
		}
	} else if cmd[0] == "collision" {
		battle := Battle{}
		err := json.Unmarshal([]byte(cmd[1]), &battle)
		if err != nil {
			fmt.Println("Failed to unmarshal battle:", err)
			return
		}

		loserPoints := 0
		if len(battle.Losers) == 1 {
			loserPoints = players[battle.Losers[0]].Points
			killPlayer(battle.Losers[0])
		} else {
			origLoserPoints := 0
			for _, loserId := range battle.Losers {
				origLoserPoints += players[loserId].Points
			}
			loserPoints = int(float64(origLoserPoints) * (2.0 / 5.0))
			for _, loserId := range battle.Losers {
				players[loserId] = Player{
					Id:     players[loserId].Id,
					X:      players[loserId].X,
					Y:      players[loserId].Y,
					Points: (origLoserPoints - loserPoints) / 2,
				}
				for i, v := range playerConnections {
					if v[0] == loserId || v[1] == loserId {
						playerConnections = append(playerConnections[:i], playerConnections[(i+1):]...)
					}
				}
			}
		}

		if len(battle.Winners) == 1 {
			players[battle.Winners[0]] = Player{
				Id:       players[battle.Winners[0]].Id,
				X:        players[battle.Winners[0]].X,
				Y:        players[battle.Winners[0]].Y,
				Points:   players[battle.Winners[0]].Points + loserPoints,
				Cooldown: 0,
			}
		} else {
			for _, winnerId := range battle.Winners {
				players[winnerId] = Player{
					Id:       players[battle.Winners[0]].Id,
					X:        players[battle.Winners[0]].X,
					Y:        players[battle.Winners[0]].Y,
					Points:   players[battle.Winners[0]].Points + (loserPoints / 2),
					Cooldown: 0,
				}
			}
		}
	} else if cmd[0] == "disconnect" {
		data := strings.Split(cmd[1], " ")
		playerId1, err := strconv.Atoi(data[0])
		if err != nil {
			fmt.Println("Failed to convert player id:", err)
			return
		}

		playerId2, err := strconv.Atoi(data[1])
		if err != nil {
			fmt.Println("Failed to convert player id:", err)
			return
		}

		isMutual, err := strconv.ParseBool(data[2])
		if err != nil {
			fmt.Println("Failed to convert mutual:", err)
			return
		}

		for i, connection := range playerConnections {
			if connection[0] == playerId1 || connection[0] == playerId2 {
				playerConnections = append(playerConnections[:i], playerConnections[(i+1):]...)
			}
		}

		if !isMutual {
			players[playerId1] = Player{
				Id:       players[playerId1].Id,
				X:        players[playerId1].X,
				Y:        players[playerId1].Y,
				Points:   players[playerId1].Points + int(float64(players[playerId1].Points)*(1.0/5.0)),
				Cooldown: 60,
			}

			players[playerId2] = Player{
				Id:       players[playerId2].Id,
				X:        players[playerId2].X,
				Y:        players[playerId2].Y,
				Points:   players[playerId2].Points - int(float64(players[playerId2].Points)*(1.0/5.0)),
				Cooldown: 0,
			}
		}
	}
}

func killPlayer(id int) {
	for client := range Manager.Clients {
		if Manager.Clients[client] == id {
			err := client.WriteMessage(websocket.TextMessage, []byte("die"))
			if err != nil {
				fmt.Println("Failed to write message:", err)
				return
			}
		}
	}
}
