import { Unit } from "../units/Unit";

export class Player {
  SPEED = 200;

  unit: Unit;
  game: Phaser.Scene;
  pointer: Phaser.Input.Pointer;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.unit = new Unit(x, y, game, {
      name: "player",
      scale: 1,
    });

    this.game.cameras.main.startFollow(this.unit.sprite);
    this.pointer = this.game.input.activePointer;
  }

  update() {
    // TODO: bug when the mouse is not moved for long time
    this.unit.goto(this.pointer.worldX, this.pointer.worldY);
  }
}
