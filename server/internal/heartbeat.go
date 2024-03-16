package internal

import (
	"encoding/json"
	"fmt"
	"time"

	"golang.org/x/exp/maps"
)

var heartBeates = 0

var HeartbeatTicker = time.NewTicker(20 * time.Millisecond)

func heartbeat() {
	if len(players) != 0 {
		heartBeates++
		if heartBeates == 50 {
			heartBeates = 0
			updatePlayers()
		}

		playersJson, err := json.Marshal(maps.Values(players))
		if err != nil {
			fmt.Println("Failed to marshal players:", err)
			return
		}

		Manager.Broadcast <- []byte(fmt.Sprintf("heartbeat %s", playersJson))

	}
}

func HandleHeartbeat() {
	for {
		select {
		case <-HeartbeatTicker.C:
			heartbeat()
		}
	}
}
