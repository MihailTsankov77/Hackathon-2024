import Phaser from "phaser";

export function preloadImages(game: Phaser.Scene) {
  game.load.image("player", "player.png");
  game.load.image("slavi", "slavi.png");
  game.load.image("background", "grid.png");
  game.load.image("hand", "hands.png");
  game.load.image("score","kur.png"); 
}
