import { io } from 'socket.io-client';

let socket = null;

export function connect(serverUrl) {
  const url = serverUrl || 'http://192.168.1.79:3000';
  socket = io(url, {
    transports: ['websocket'],
    forceNew: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnect() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
