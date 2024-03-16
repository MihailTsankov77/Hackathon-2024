export class SocketConnection {
  socket: WebSocket;
  debug = false;

  online = true;
  bojo = "10.108.5.150";

  constructor(x: number, y: number) {
    this.socket = new WebSocket(
      `ws://${this.online ? this.bojo : "localhost"}:8080/ws`
    );

    // TODO remove Debug
    this.socket.onopen = () => {
      if (this.debug) {
        console.log("Connected to WebSocket server");
      }

      this.join(x, y);
    };

    if (this.debug) {
      this.socket.onmessage = (event) => {
        console.log(event.data);
      };

      this.socket.onclose = () => {
        console.log("Disconnected from WebSocket server");
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    }
  }

  join = (x: number, y: number) => {
    if (this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(`join ${x} ${y}`);
    }
  };

  sendLocation(x: number, y: number) {
    if (this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(`move ${x} ${y}`);
    }
  }

  setMessageHandle(messageHandle: (a: string) => void) {
    this.socket.onmessage = (event) => {
      messageHandle(event.data);
    };
  }

  update(x: number, y: number) {
    this.sendLocation(x, y);
  }
}
