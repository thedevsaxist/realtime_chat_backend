import { WebSocket } from 'ws';

// Maps userId -> their active WebSocket connection.
const userSockets = new Map<string, WebSocket>();

export const registerUserSocket = (userId: string, socket: WebSocket) => {
  userSockets.set(userId, socket);
};

export const removeUserSocket = (userId: string) => {
  userSockets.delete(userId);
};

export const notifyUser = (userId: string, event: string, data: unknown) => {
  const socket = userSockets.get(userId);
  if (socket?.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
};
