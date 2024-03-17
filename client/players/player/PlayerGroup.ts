import { SocketConnection } from "../../connection/connectionMain";
import { PlayerData } from "../../Scenes/MainScene";
import { Pair } from "../units/Pair";
import { createSprite, Unit } from "../units/Unit";
import { Player } from "./Player";

export class PlayerGroup {
  game: Phaser.Scene;

  player: Player;
  unit2: Unit | undefined;
  pair: Pair | undefined;

  score: number = 0;
  cooldown: number = 0;

  constructor(playerData: PlayerData, game: Phaser.Scene) {
    this.game = game;
    this.player = new Player(playerData.id, playerData.x, playerData.y, game);
  }

  setId(id: number) {
    this.player.setId(id);
  }

  updateData(plData1: PlayerData, plData2: PlayerData | undefined) {
    this.score = plData1.points;
    this.cooldown = plData1.cooldown;

    if (plData2) {
      if (!this.unit2) {
        const oldSprite = this.player.unit.sprite;

        this.player.unit.sprite = createSprite(
          oldSprite.x,
          oldSprite.y,
          {
            name: "player-glow",
            scale: 0.15,
          },
          this.game
        );
        this.game.cameras.main.startFollow(this.player.unit.sprite, true);
        oldSprite.destroy();

        this.unit2 = new Unit(plData2.id, plData2.x, plData2.y, this.game, {
          name: "slavi-glow",
          scale: 0.1,
        });

        this.pair = new Pair(this.player.unit, this.unit2, this.game);
      } else {
        this.unit2.goto(plData2.x, plData2.y, plData2.points, plData2.cooldown);
      }
    } else if (this.pair) {
      this.pair?.splitForPlayer();

      const oldSprite = this.player.unit.sprite;

      this.player.unit.sprite = createSprite(
        oldSprite.x,
        oldSprite.y,
        {
          name: "player",
          scale: 0.1,
        },
        this.game
      );
      this.game.cameras.main.startFollow(this.player.unit.sprite, true);

      oldSprite.destroy();

      this.unit2 = undefined;
      this.pair = undefined;
    }
  }

  update(socket: SocketConnection) {
    this.player.update(socket, this.score, this.cooldown);

    if (this.pair) {
      this.pair.update();
      this.pair.maybeSplitHand(socket);
    }
  }

  getIds() {
    if (this.unit2) {
      return [this.player.unit.id, this.unit2?.id];
    }

    return [this.player.unit.id];
  }
}
