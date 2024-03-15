import { Sprite } from "../../utils/types";

type SpriteConfig = {
  name: string;
  scale: number;
};
export class Unit {
  SPEED = 100;

  sprite: Sprite = {} as Sprite;
  game: Phaser.Scene = {} as Phaser.Scene;

  constructor(
    x: number,
    y: number,
    game: Phaser.Scene,
    spriteConfig: SpriteConfig
  ) {
    this.game = game;

    this.sprite = this.game.physics.add.sprite(x, y, spriteConfig.name);
    this.sprite.setScale(spriteConfig.scale);
    // this.sprite.body.setSize(
    //   this.sprite.width * spriteConfig.scale,
    //   this.sprite.height * spriteConfig.scale,
    //   true
    // );
    this.sprite.setCollideWorldBounds(true);
  }

  goto(coordinates: { x: number; y: number }): void {
    // const distance = Math.sqrt(
    //   (this.sprite.x - x) ** 2 + (this.sprite.y - y) ** 2
    // );

    // const duration = (distance / this.SPEED) * 1000;

    // this.game.tweens.add({
    //   targets: this.sprite,
    //   x,
    //   y,
    //   duration,
    //   ease: "Linear",
    //   onComplete: function () {
    //     // TODO
    //     console.log("Sprite reached destination!");
    //   },
    // });

    this.game.physics.moveToObject(this.sprite, coordinates, this.SPEED);
  }
}
