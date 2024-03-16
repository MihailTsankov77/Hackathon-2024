import { Unit } from "../units/Unit";

export class Player {
  SPEED = 200;

  unit: Unit;
  game: Phaser.Scene;
  pointer: Phaser.Input.Pointer;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    // TODO ADD ID
    this.unit = new Unit(-1, x, y, game, {
      name: "player",
      scale: 1,
    });

    this.game.cameras.main.startFollow(this.unit.sprite);
    this.pointer = this.game.input.activePointer;
  }

  update() {
    // TODO: bug when the mouse is not moved for long time
    this.unit.goto(this.pointer.worldX, this.pointer.worldY);

    // TODO:
    // const angle = Phaser.Math.Angle.Between(
    //   this.unit.sprite.x,
    //   this.unit.sprite.y,
    //   this.pointer.worldX,
    //   this.pointer.worldY
    // );

    // this.unit.sprite.setRotation(angle);
  }
}
