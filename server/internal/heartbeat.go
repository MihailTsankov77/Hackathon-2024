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
	if len(players.Values) == 0 {
		return
	}

	heartBeates++
	if heartBeates == 50 {
		heartBeates = 0
		updatePlayers()
	}

	players.mutex.Lock()
	defer players.mutex.Unlock()
	response := HeartbeatResponse{
		Players:     players.Values,
		Connections: playerConnections,
	}

	for _, player := range response.Players {
		if isPlayerSolo(player) {
			response.Connections = append(response.Connections, []int{player.Id})
		}
	}
	resCopy := response
	responseJson, err := json.Marshal(resCopy)
	if err != nil {
		fmt.Println("Failed to marshal players:", err)
		return
	}
	fmt.Printf("Broadcasting heartbeat: %s\n", responseJson)
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
