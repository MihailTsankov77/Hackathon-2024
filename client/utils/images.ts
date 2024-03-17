import Phaser from "phaser";

export function preloadImages(game: Phaser.Scene) {
  game.load.image("player", "player.png");
  game.load.image("slavi", "player_1.png");
  game.load.image("background", "grid.png");
  game.load.image("hand", "hands_2.png");
  game.load.image("score", "kur.png");
  game.load.image("game-over", "game-over.png");
}
