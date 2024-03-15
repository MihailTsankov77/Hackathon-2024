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
    this.sprite.setCollideWorldBounds(true);
  }

  goto(x: number, y: number): void {
    this.game.physics.moveToObject(this.sprite, { x, y }, this.SPEED);
  }
}
