import Phaser from "phaser";
import { preloadImages } from "../utils/images";
import { Bot } from "../players/units/Bot";
import { SocketConnection } from "../connection/connectionMain";
import { PlayerGroup } from "../players/player/PlayerGroup";
import { Timer } from "../players/units/Timer";
import { Player } from "../players/player/Player";

export type CollideFun = (group1: number[], group2: number[]) => void;

export type PlayerData = {
  id: number;
  x: number;
  y: number;
  points: number;
  cooldown: number;
};

const mock = true;

const MockPos: Record<number, PlayerData> = {
  1: {
    id: 1,
    x: 200,
    y: 200,
    points: 0,
    cooldown: 0,
  },
  2: {
    id: 2,
    x: 500,
    y: 500,
    points: 0,
    cooldown: 0,
  },
  3: {
    id: 3,
    x: 1000,
    y: 1000,
    points: 0,
    cooldown: 0,
  },
  4: {
    id: 3,
    x: 1000,
    y: 1000,
    points: 0,
    cooldown: 0,
  },
  6: {
    id: 3,
    x: 799,
    y: 800,
    points: 0,
    cooldown: 0,
  },
};

const MockPair = [[1, 2], [3, 4], [6]];

export default class MainScene extends Phaser.Scene {
  playerGroup: PlayerGroup;

  gameWidth = 2000;
  gameHeight = 2000;

  playerX = 0;
  playerY = 0;
  playerId = 4;

  // playerPair: Bot;
  botsByIds: Record<string, Bot> = {};

  pairs: number[][] = mock ? MockPair : [];
  playersData: Record<number, PlayerData> = mock ? MockPos : {};

  socket: SocketConnection;

  timer: Timer;

  constructor() {
    super("MainScene");
    this.playerX = mock ? 800 : this.getRandomWidth();
    this.playerY = mock ? 500 : this.getRandomHight();
  }

  init() {}

  preload() {
    preloadImages(this);
  }

  getRandomWidth() {
    const leftOrRight = Math.round(Math.random());
    const offset = Math.random() * 100 + 200;

    return (1 - leftOrRight * 2) * offset + leftOrRight > 0 ? innerWidth : 0;
  }

  getRandomHight() {
    const offset =
      Math.random() * (innerHeight - 1.5 * this.gameWidth) +
      1.5 * this.gameHeight;

    return offset;
  }

  setUpCameraAndBackground() {
    this.cameras.main.setBounds(0, 0, this.gameWidth, this.gameHeight);
    this.cameras.main.setZoom(1);

    const background = this.add.tileSprite(
      0,
      0,
      this.gameWidth,
      this.gameHeight,
      "background",
    );
    background.setOrigin(0, 0);

    this.physics.world.setBounds(0, 0, this.gameWidth, this.gameHeight);
  }

  joinServer() {
    this.socket = new SocketConnection(this.playerX, this.playerY);
    this.socket.setMessageHandle(this.handleMessage);
  }

  create() {
    this.setUpCameraAndBackground();
    this.timer = new Timer(
      this.cameras.main.scrollX,
      this.cameras.main.scrollY,
      this,
    );


    this.playerGroup = new PlayerGroup(
      {
        id: this.playerId,
        x: this.playerX,
        y: this.playerY,
        points: 0,
        cooldown: 0,
      },
      this,
    );

    this.updateData();

    this.joinServer();
  }

  handleMessage = (rawData: string) => {
    const [method, data] = rawData.split(" ");

    switch (method) {
      case "id": {
        this.playerId = parseInt(data);
        this.playerGroup.setId(this.playerId);

        break;
      }
      case "heartbeat": {
        const parsed = JSON.parse(data);
        this.pairs = parsed.connections;
        this.playersData = parsed.players;
        this.updateData();

        break;
      }
    }
  };

  updateData() {
    this.killPlayers();
    this.pairs.forEach((pair) => this.usePair(pair));
  }

  getPairId(ids: number[]) {
    return `${ids[0]}-${ids[1] ?? ""}`;
  }

  killPlayers() {
    const toBeKilled = Object.keys(this.botsByIds).filter((id) =>
      this.pairs.every((pair) => id !== this.getPairId(pair)),
    );

    let addIds: number[] = [];
    toBeKilled.forEach((id) => {
      addIds = addIds.concat(this.botsByIds[id].onKill());

      delete this.botsByIds[id];
    });

    addIds.forEach((id) => this.usePair([id]));
  }

  handlePLayer(ids: number[]) {
    const plData1 = this.playersData[this.playerId];
    const plData2 =
      ids.length > 1
        ? this.playersData[ids.filter((id) => id !== this.playerId)[0]]
        : undefined;

    this.playerGroup.updateData(plData1, plData2);
  }

  usePair(ids: number[]) {
    if (ids.includes(this.playerId)) {
      this.handlePLayer(ids);
      return;
    }

    const id = this.getPairId(ids);

    const plData1 = this.playersData[ids[0]];
    const plData2 = ids.length > 1 ? this.playersData[ids[1]] : undefined;

    console.log(this.playerGroup);
    if (this.botsByIds[id]) {
      this.botsByIds[id].updateData(plData1, plData2);
    } else {
      this.botsByIds[id] = new Bot(plData1, plData2, this);

      this.botsByIds[id].addCollisionWithAPlayer(
        this.playerGroup,
        (groupOne: number[], groupTwo: number[]) => {
          console.log(groupOne, groupTwo);
        },
      );
    }
  }

  update() {
    this.playerGroup.update(this.socket);
    this.timer.timeText.setPosition(
      this.cameras.main.scrollX - 500,
      this.cameras.main.scrollY - 500,
    );

    this.timer.timeText.update();
    console.log(this.timer.timeText.getBounds());

    Object.values(this.botsByIds).forEach((bot) =>
      bot.update(this.playerGroup),
    );

    // this.pairs = this.pairs.filter((pair) => !pair.maybeSplitHand());
  }
}
