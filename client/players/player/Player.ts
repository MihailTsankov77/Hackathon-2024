import { Unit } from "../units/Unit";

export class Player {
  SPEED = 200;

  unit: Unit;
  game: Phaser.Scene;

  constructor(x: number, y: number, game: Phaser.Scene) {
    this.game = game;

    this.unit = new Unit(x, y, game, {
      name: "player",
      scale: 1,
    });

    // this.game.input.on(
    //   "pointermove",
    //   (pointer) => {
    //     // if (pointer.isDown) { // TODO
    //     this.unit.goto(this.game.input);
    //   },
    //   this
    // );

    this.game.cameras.main.startFollow(this.unit.sprite);
  }

  update() {
    var pointer = this.game.input.activePointer;
    var dx = pointer.worldX + this.unit.sprite.x;
    var dy = pointer.worldY + this.unit.sprite.y;
    console.log(dx, dy);
    this.unit.goto({ x: pointer.worldX, y: pointer.worldY });
  }
}
