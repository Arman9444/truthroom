import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "./src/types";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

// Track typing users per room
const typingUsers = new Map<string, Set<string>>();

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: dev ? `http://${hostname}:${port}` : undefined,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    let currentRoom: string | null = null;
    let currentSession: string | null = null;

    socket.on("room:join", (roomCode, sessionToken) => {
      currentRoom = roomCode;
      currentSession = sessionToken;
      socket.join(roomCode);

      // Count participants in room
      const roomSockets = io.sockets.adapter.rooms.get(roomCode);
      const count = roomSockets ? roomSockets.size : 0;
      console.log(`[Socket] User joined room ${roomCode} (${count} connected)`);
    });

    socket.on("room:leave", (roomCode) => {
      socket.leave(roomCode);
      removeTyping(roomCode, socket.id);
      currentRoom = null;
      currentSession = null;
    });

    socket.on("typing:start", (roomCode) => {
      if (!typingUsers.has(roomCode)) {
        typingUsers.set(roomCode, new Set());
      }
      typingUsers.get(roomCode)!.add(socket.id);
      const count = typingUsers.get(roomCode)!.size;
      socket.to(roomCode).emit("typing:update", count);
    });

    socket.on("typing:stop", (roomCode) => {
      removeTyping(roomCode, socket.id);
    });

    socket.on("disconnect", () => {
      if (currentRoom) {
        removeTyping(currentRoom, socket.id);
        socket.leave(currentRoom);
      }
    });
  });

  function removeTyping(roomCode: string, socketId: string) {
    const roomTyping = typingUsers.get(roomCode);
    if (roomTyping) {
      roomTyping.delete(socketId);
      const count = roomTyping.size;
      io.to(roomCode).emit("typing:update", count);
      if (count === 0) {
        typingUsers.delete(roomCode);
      }
    }
  }

  // Expose io instance globally for API routes to emit events
  (globalThis as Record<string, unknown>).__socketIO = io;

  httpServer.listen(port, () => {
    console.log(`> TruthRoom ready on http://${hostname}:${port}`);
  });
});
