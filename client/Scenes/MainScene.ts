import Phaser from "phaser";
import { preloadImages } from "../utils/images";
import { Player } from "../players/player/Player";
import { Unit } from "../players/units/Unit";
import { Pair } from "../players/units/Pair";
import { Bot } from "../players/units/Bot";
import { SocketConnection } from "../connection/connectionMain";

// TODO move

export type PlayerData = {
  id: number;
  x: number;
  y: number;
  // score: number
  // delay: number
};

const MockPos: Record<number, PlayerData> = {
  1: {
    id: 1,
    x: 200,
    y: 200,
  },
  2: {
    id: 2,
    x: 500,
    y: 500,
  },
  3: {
    id: 3,
    x: 1000,
    y: 1000,
  },
};

const MockPair = [[1, 2], [3]];

export default class MainScene extends Phaser.Scene {
  player: Player;

  gameWidth = 2000;
  gameHeight = 2000;

  // playerPair: Bot;
  botsByIds: Record<string, Bot> = {};

  socket: SocketConnection= new SocketConnection();

  constructor() {
    super("MainScene");
  }

  init() {}

  preload() {
    preloadImages(this);
  }

  

  setUpCameraAndBackground() {
    this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);

    const background = this.add.tileSprite(
      0,
      0,
      this.gameWidth,
      this.gameHeight,
      "background"
    );
    background.setOrigin(0, 0);

    this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
  }

  create() {
    this.setUpCameraAndBackground();

    this.updateData();

    this.player = new Player(500, 500, this);
  }

  updateData() {
    // TODO kill
    MockPair.forEach((pair) => this.usePair(pair));
  }

  getPairId(ids: number[]) {
    return `${ids[0]}-${ids[1] ?? ""}`;
  }

  usePair(ids: number[]) {
    const id = this.getPairId(ids);

    const plData1 = MockPos[ids[0]];
    const plData2 = ids.length > 1 ? MockPos[ids[1]] : undefined;

    if (this.botsByIds[id]) {
      this.botsByIds[id].updateData(plData1, plData2);
    } else {
      this.botsByIds[id] = new Bot(plData1, plData2, this);
    }
  }

  update() {
    this.player.update(this.socket);

    Object.values(this.botsByIds).forEach((bot) => bot.update());

    // this.pairs = this.pairs.filter((pair) => !pair.maybeSplitHand());
  }
}
