import Phaser from "phaser";
import { preloadImages } from "../utils/images";
import { Player } from "../players/player/Player";
import { Bot } from "../players/units/Bot";
import { SocketConnection } from "../connection/connectionMain";

// TODO move

export type PlayerData = {
  id: number;
  x: number;
  y: number;
  points: number;
  // delay: number
};

export default class MainScene extends Phaser.Scene {
  player: Player;

  gameWidth = 2000;
  gameHeight = 2000;

  playerX = 0;
  playerY = 0;
  playerId = -1;

  // playerPair: Bot;
  botsByIds: Record<string, Bot> = {};

  pairs: number[][] = [];
  playersData: Record<number, PlayerData> = {};

  socket: SocketConnection;

  constructor() {
    super("MainScene");
    this.playerX = this.getRandomWidth();
    this.playerY = this.getRandomHight();
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

    this.updateData();

    this.player = new Player(this.playerId, this.playerX, this.playerY, this);
    this.joinServer();
  }

  handleMessage = (rawData: string) => {
    const [method, data] = rawData.split(" ");

    switch (method) {
      case "id": {
        this.playerId = parseInt(data);
        this.player.setId(this.playerId);

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

  usePair(ids: number[]) {
    const id = this.getPairId(ids);

    const plData1 = this.playersData[ids[0]];
    const plData2 = ids.length > 1 ? this.playersData[ids[1]] : undefined;

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
