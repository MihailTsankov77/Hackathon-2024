import Phaser from "phaser";
import { Unit } from "./Unit";
import { CollideFun, PlayerData } from "../../Scenes/MainScene";
import { Pair } from "./Pair";
import { PlayerGroup } from "../player/PlayerGroup";

export class Bot {
  game: Phaser.Scene;

  dataPlayer1: PlayerData;
  dataPlayer2: PlayerData | undefined;

  unit1: Unit;
  unit2: Unit | undefined;

  pair: Pair | undefined;

  collideFunction: () => void;

  constructor(
    dataPlayer1: PlayerData,
    dataPlayer2: PlayerData | undefined,
    game: Phaser.Scene
  ) {
    this.game = game;

    this.dataPlayer1 = dataPlayer1;
    this.dataPlayer2 = dataPlayer2;
    this.createUnits();
  }

  createUnits() {
    this.unit1 = new Unit(
      this.dataPlayer1.id,
      this.dataPlayer1.x,
      this.dataPlayer1.y,
      this.game,
      {
        name: "slavi",
        scale: 0.1,
      }
    );

    if (!this.dataPlayer2) {
      return;
    }

    this.unit2 = new Unit(
      this.dataPlayer2.id,
      this.dataPlayer2.x,
      this.dataPlayer2.y,
      this.game,
      {
        name: "slavi",
        scale: 0.1,
      }
    );

    this.pair = new Pair(this.unit1, this.unit2, this.game);
  }

  updateData = (dataPlayer1: PlayerData, dataPlayer2?: PlayerData) => {
    this.dataPlayer1 = dataPlayer1;
    this.dataPlayer2 = dataPlayer2;
    this.unit1.goto(
      dataPlayer1.x,
      dataPlayer1.y,
      dataPlayer1.points,
      dataPlayer1.cooldown
    );

    if (this.unit2 && dataPlayer2) {
      //console.log(dataPlayer2.points);
      this.unit2.goto(
        dataPlayer2.x,
        dataPlayer2.y,
        dataPlayer2.points,
        dataPlayer2.cooldown
      );
    }
  };

  onKill = (): number[] => {
    if (this.pair) {
      return this.pair.split();
    }

    this.unit1.dead();
    return [];
  };

  update(playerGroup: PlayerGroup) {
    if (this.pair) {
      this.pair.update();
      this.pair.checkCollision(this.collideFunction, playerGroup);
    }

    if (playerGroup.pair) {
      playerGroup.pair.checkCollision2(this.collideFunction, this);
    }
  }

  addCollisionWithAPlayer(playerGroup: PlayerGroup, collide: CollideFun) {
    this.collideFunction = () => {
      collide(this.getIds(), playerGroup.getIds());
    };
    this.game.physics.add.collider(
      playerGroup.player.unit.sprite,
      this.unit1.sprite,
      this.collideFunction
    );

    if (this.unit2) {
      this.game.physics.add.collider(
        playerGroup.player.unit.sprite,
        this.unit2.sprite,
        this.collideFunction
      );
    }

    if (playerGroup.unit2) {
      this.game.physics.add.collider(
        playerGroup.unit2.sprite,
        this.unit1.sprite,
        this.collideFunction
      );

      if (this.unit2) {
        this.game.physics.add.collider(
          playerGroup.unit2.sprite,
          this.unit2.sprite,
          this.collideFunction
        );
      }
    }
  }

  getIds() {
    if (this.unit2) {
      return [this.unit1.id, this.unit2?.id];
    }

    return [this.unit1.id];
  }
}
