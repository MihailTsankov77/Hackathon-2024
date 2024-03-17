package internal

import (
	"encoding/json"
	"fmt"
	"log/slog"
	"sort"
	"strconv"
	"strings"
	"sync"

	"github.com/gorilla/websocket"
	"golang.org/x/exp/maps"
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

type SafePlayers struct {
	Values map[int]Player
	mutex  sync.Mutex
}

var playerIdCounter = 0

var players = SafePlayers{
	Values: make(map[int]Player),
}

var playerConnections [][]int

func connectPlayer(player1, player2 Player) {
	points := player1.Points + player2.Points

	player1.Points = points / 2
	player2.Points = points / 2

	player1.Cooldown = 10

	player2.Cooldown = 10

	players.Values[player1.Id] = player1

	players.Values[player2.Id] = player2

	playerConnections = append(playerConnections, []int{player1.Id, player2.Id})
}

func updatePlayers() {
	for _, player := range players.Values {
		if player.Cooldown > 0 {
			player.Cooldown--
		}
		if isPlayerSolo(player) {
			player.Points += 4
			players.Values[player.Id] = player
		} else {
			player.Points += 2
			players.Values[player.Id] = player
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

type ByPoints []Player

func (a ByPoints) Len() int {
	return len(a)
}

func (a ByPoints) Less(i, j int) bool {
	return a[i].Points < a[j].Points
}

func (a ByPoints) Swap(i, j int) {
	a[i], a[j] = a[j], a[i]
}

func leaderboardUpdate(players []Player) []Player {
	sorted := make([]Player, len(players))
	copy(sorted, players)
	sort.Sort(ByPoints(sorted))
	return sorted
}

func handleCommands(conn *websocket.Conn, message []byte) {
	cmd := strings.SplitN(string(message), " ", 2)
	slog.Info(
		fmt.Sprintf(
			"Received command %s from: %d - %v",
			cmd[0],
			Manager.Clients[conn],
			conn.RemoteAddr(),
		),
	)
	if cmd[0] == "join" {
		data := strings.Split(cmd[1], " ")
		pX, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to convert position: %v", err))
			return
		}

		pY, err := strconv.ParseFloat(data[1], 64)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to convert position: %v", err))
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

		players.mutex.Lock()

		players.Values[player.Id] = player
		slog.Info(fmt.Sprintf("Number of players: %d", len(players.Values)))
		Manager.Clients[conn] = player.Id
		err = conn.WriteMessage(websocket.TextMessage, []byte(fmt.Sprintf("id %d", player.Id)))
		slog.Debug(
			fmt.Sprintf(
				"Sending id %d to: %d - %v",
				player.Id,
				Manager.Clients[conn],
				conn.RemoteAddr(),
			),
		)

		players.mutex.Unlock()

		if err != nil {
			slog.Error(fmt.Sprintf("Failed to write message: %v", err))
		}
	} else if cmd[0] == "move" {
		data := strings.Split(cmd[1], " ")

		playerId := Manager.Clients[conn]

		pX, err := strconv.ParseFloat(data[0], 64)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to convert position: %v", err))
			return
		}

		pY, err := strconv.ParseFloat(data[1], 64)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to convert position: %v", err))
			return
		}

		players.mutex.Lock()
		if !(players.Values[playerId].X == pX && players.Values[playerId].Y == pY) {

			player := players.Values[playerId]
			player.X = pX
			player.Y = pY

			players.Values[playerId] = player
		}
		players.mutex.Unlock()

	} else if cmd[0] == "collision" {
		battle := Battle{}
		err := json.Unmarshal([]byte(cmd[1]), &battle)
		if err != nil {
			slog.Error(fmt.Sprintf("Failed to unmarshal battle: %v", err))
			return
		}

		loserPoints := 0
		if len(battle.Losers) == 1 {
			loserPoints = players.Values[battle.Losers[0]].Points
			killPlayer(battle.Losers[0])
		} else {
			origLoserPoints := 0
			for _, loserId := range battle.Losers {
				origLoserPoints += players.Values[loserId].Points
			}
			loserPoints = int(float64(origLoserPoints) * (2.0 / 5.0))
			for _, loserId := range battle.Losers {
				players.Values[loserId] = Player{
					Id:     players.Values[loserId].Id,
					X:      players.Values[loserId].X,
					Y:      players.Values[loserId].Y,
					Points: (origLoserPoints - loserPoints) / 2,
				}
				for i, v := range playerConnections {
					if v[0] == loserId || v[1] == loserId {
						playerConnections = append(playerConnections[:i], playerConnections[(i+1):]...)
					}
				}
			}
		}

		for i, winnerId := range battle.Winners {
			players.Values[winnerId] = Player{
				Id:       players.Values[battle.Winners[i]].Id,
				X:        players.Values[battle.Winners[i]].X,
				Y:        players.Values[battle.Winners[i]].Y,
				Points:   players.Values[battle.Winners[i]].Points + (loserPoints / len(battle.Winners)),
				Cooldown: players.Values[battle.Winners[i]].Cooldown,
			}
		}

	} else if cmd[0] == "connect" {
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
		connectPlayer(players.Values[playerId1], players.Values[playerId2])

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
				playerConnections = append(playerConnections[:i], playerConnections[i+1:]...)
			}
		}

		if !isMutual {
			players.Values[playerId1] = Player{
				Id:       players.Values[playerId1].Id,
				X:        players.Values[playerId1].X,
				Y:        players.Values[playerId1].Y,
				Points:   players.Values[playerId1].Points + int(float64(players.Values[playerId1].Points)*(1.0/5.0)),
				Cooldown: 60,
			}

			players.Values[playerId2] = Player{
				Id:       players.Values[playerId2].Id,
				X:        players.Values[playerId2].X,
				Y:        players.Values[playerId2].Y,
				Points:   players.Values[playerId2].Points - int(float64(players.Values[playerId2].Points)*(1.0/5.0)),
				Cooldown: 0,
			}
		}
	} else if cmd[0] == "leaderboard" {
		sortedLeaderboard := maps.Values(players.Values)
		sortedLeaderboard = leaderboardUpdate(sortedLeaderboard)

		jsonRes, err := json.Marshal(sortedLeaderboard)
		if err != nil {
			fmt.Println("Failed to marshal leaderboard:", err)
			return
		}
		conn.WriteMessage(1, []byte(fmt.Sprintf("leaderboard %s", jsonRes)))
	}
}

func killPlayer(id int) {
	for client := range Manager.Clients {
		if Manager.Clients[client] == id {
			err := client.WriteMessage(websocket.TextMessage, []byte("die"))
			for i, connection := range playerConnections {
				if connection[0] == id || connection[1] == id {
					playerConnections = append(playerConnections[:i], playerConnections[i+1:]...)
				}
			}
			if err != nil {
				fmt.Println("Failed to write message:", err)
				return
			}
		}
	}
}
