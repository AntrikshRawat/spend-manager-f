import { io } from "socket.io-client";

const socket = io("http://localhost:3000", {
  transports: ['websocket', 'polling'] , // optional: force WebSocket only
});

export default socket;
