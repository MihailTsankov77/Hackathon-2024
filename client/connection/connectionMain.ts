function throttle(func, delay) {
  let lastCalledTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCalledTime >= delay) {
      func.apply(this, args);
      lastCalledTime = now;
    }
  };
}

export class SocketConnection {
  socket: WebSocket;
  debug = false;

  online = false;
  bojo = "10.108.5.150";

  constructor(x: number, y: number) {
    this.socket = new WebSocket(
      `ws://${this.online ? this.bojo : "localhost"}:8080/ws`
    );

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

  disconnect() {
    this.socket.close();
  }

  setMessageHandle(messageHandle: (a: string) => void) {
    this.socket.onmessage = (event) => {
      messageHandle(event.data);
    };
  }

  sendCollision = throttle((event: { winners: number[]; losers: number[] }) => {
    if (this.socket.readyState == WebSocket.OPEN) {
      this.socket.send(`collision ${JSON.stringify(event)}`);
    }
    // console.log(event);
  }, 1000);

  update(x: number, y: number) {
    this.sendLocation(x, y);
  }

  connect(id1: number, id2: number) {
    this.socket.send(`connect ${id1} ${id2}`);
  }

  sendDisconnect(id1: number, id2: number, isMutual: boolean) {
    this.socket.send(`disconnect ${id1} ${id2} ${isMutual}`);
  }
}
