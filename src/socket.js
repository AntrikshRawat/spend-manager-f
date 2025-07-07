import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  transports: ['websocket', 'polling'] , // optional: force WebSocket only
});

export default socket;
