package internal

type Player struct {
	Id       int     `json:"id"`
	X        float64 `json:"x"`
	Y        float64 `json:"y"`
	Points   int     `json:"points"`
	Cooldown int     `json:"cooldown"`
}
