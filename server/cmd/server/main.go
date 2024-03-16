package main

import (
	"fmt"
	"net/http"

	"github.com/MihailTsankov77/Hackathon-2024/server/internal"
)

func main() {
	go internal.Manager.Start()
	http.HandleFunc("/ws", internal.WsHandler)

	go internal.HandleHeartbeat()

	fmt.Println("Starting WebSocket server on :8080")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Printf("Failed to start server: %v\n", err)
	}
}
