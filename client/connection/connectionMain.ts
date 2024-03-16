export class SocketConnection{
    socket:WebSocket;

    constructor(){
        this.socket = new WebSocket('ws://localhost:8080/ws');
        
        this.socket.onopen = () => {
            console.log('Connected to WebSocket server');
            this.socket.send('Hello, server!');
        };
        
        this.socket.onmessage = (event) => {
            console.log('Received message from server:', event.data);
        };
        
        this.socket.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };
        
        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

    }

    
}
