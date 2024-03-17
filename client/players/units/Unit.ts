import { Sprite } from "../../utils/types";
import { Score } from "./Score";

type SpriteConfig = {
  name: string;
  scale: number;
};
export class Unit {
  id: number;
  SPEED = 100;

  score: Score = {} as Score;
  sprite: Sprite = {} as Sprite;
  timer: number = 0;
  game: Phaser.Scene = {} as Phaser.Scene;

  constructor(
    id: number,
    x: number,
    y: number,
    game: Phaser.Scene,
    spriteConfig: SpriteConfig
  ) {
    this.game = game;

    this.id = id;

    this.sprite = createSprite(x, y, spriteConfig, game);
    this.score = new Score(x + 40, y-8, game);
  }

  dead() {
    // TODO Marinkov play dead animation
    this.destroy();
  }

  destroy() {
    this.sprite.destroy();
    this.score.destroy();
  }

  //equvalent of update
  goto(x: number, y: number, newScore: number, newTimer: number): void {
    this.game.physics.moveToObject(this.sprite, { x, y }, this.SPEED);
    //this.game.physics.moveToObject(this.score.digitsSprite, { x, y:y-60 }, this.SPEED);
    //this.game.physics.moveToObject(this.score.digitsText,{ x, y:y-60 }, this.SPEED);
    this.timer = newTimer;
    this.score.digitsText.setPosition(this.sprite.x - 17, this.sprite.y - 106);
    this.score.update(newScore);
  }
}

export function createSprite(
  x,
  y,
  spriteConfig: SpriteConfig,
  game: Phaser.Scene
) {
  const sprite = game.physics.add.sprite(x, y, spriteConfig.name);
  sprite.setScale(spriteConfig.scale);
  sprite.setCollideWorldBounds(true);

  return sprite;
}
