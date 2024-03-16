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

    this.sprite = this.game.physics.add.sprite(x, y, spriteConfig.name);
    this.sprite.setScale(spriteConfig.scale);
    this.sprite.setCollideWorldBounds(true);
    this.score = new Score(x + 40, y, game);
    //Marti
  }

  dead() {
    // TODO Marinkov play dead animation + destroy
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

    this.score.digitsText.setPosition(this.sprite.x - 17, this.sprite.y - 100);
    this.score.update(newScore);

    //Vassi
    //this.timer.update(newTime);

    //console.log("Hi");
  }
}
