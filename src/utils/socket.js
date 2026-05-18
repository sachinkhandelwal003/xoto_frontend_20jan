import { io } from "socket.io-client";

let socket = null;

export const getSocket = () => {
  if (!socket || socket.disconnected) {
    socket = io("https://xoto.ae", {
      transports: ["websocket"],
      reconnection: true,
    });
  }
  return socket;
};

export const registerSocket = (userId) => {
  if (!userId) return;
  const sock = getSocket();
  const doRegister = () => {
    
    sock.emit("register", userId);
  };
  if (sock.connected) doRegister();
  else sock.on("connect", doRegister);
};


const messagesCache = {}; 

export const getCachedMessages = (room) => messagesCache[room] || [];

export const addMessageToCache = (room, msg) => {
  if (!messagesCache[room]) messagesCache[room] = [];
  
  const exists = messagesCache[room].find(m => m.id === msg.id);
  if (!exists) messagesCache[room].push(msg);
};

export const setRoomMessages = (room, msgs) => {
  messagesCache[room] = msgs;
};