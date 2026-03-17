import type { Server } from "socket.io";
import type { ServerToClientEvents, ClientToServerEvents } from "@/types";

export function getIO(): Server<ClientToServerEvents, ServerToClientEvents> | null {
  return (globalThis as Record<string, unknown>).__socketIO as Server<
    ClientToServerEvents,
    ServerToClientEvents
  > | null;
}

export function emitToRoom(roomCode: string, event: string, ...args: unknown[]) {
  const io = getIO();
  if (io) {
    (io.to(roomCode) as unknown as Record<string, (...a: unknown[]) => void>).emit(event, ...args);
  }
}
