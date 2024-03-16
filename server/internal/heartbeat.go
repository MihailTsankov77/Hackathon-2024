package internal

import (
	"encoding/json"
	"fmt"
	"time"
)

var heartBeates = 0

var HeartbeatTicker = time.NewTicker(20 * time.Millisecond)

type HeartbeatResponse struct {
	Players     map[int]Player `json:"players"`
	Connections [][]int        `json:"connections"`
}

func heartbeat() {
	if len(players) == 0 {
		return
	}

	heartBeates++
	if heartBeates == 50 {
		heartBeates = 0
		updatePlayers()
	}

	response := HeartbeatResponse{
		Players:     players,
		Connections: playerConnections,
	}

	for _, player := range response.Players {
		if isPlayerSolo(player) {
			response.Connections = append(response.Connections, []int{player.Id})
		}
	}

	responseJson, err := json.Marshal(response)
	if err != nil {
		fmt.Println("Failed to marshal players:", err)
		return
	}

	Manager.Broadcast <- []byte(fmt.Sprintf("heartbeat %s", responseJson))
}

func HandleHeartbeat() {
	for {
		select {
		case <-HeartbeatTicker.C:
			heartbeat()
		}
	}
}
