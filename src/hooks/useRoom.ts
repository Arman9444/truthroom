"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type {
  RoomInfo,
  MessageInfo,
  ParticipantInfo,
} from "@/types";

interface UseRoomReturn {
  room: RoomInfo | null;
  messages: MessageInfo[];
  participants: ParticipantInfo[];
  currentParticipant: ParticipantInfo | null;
  sendMessage: (text: string) => Promise<void>;
  flagMessage: (messageId: string, reason: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  togglePin: (messageId: string) => Promise<void>;
  reveal: (
    level: number,
    hint?: string,
    partial?: string,
    full?: string
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useRoom(roomCode: string): UseRoomReturn {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [currentParticipant, setCurrentParticipant] =
    useState<ParticipantInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // Fetch room info
  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to fetch room");
      }
      const data: RoomInfo = await res.json();
      setRoom(data);
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to fetch room";
      setError(msg);
      return null;
    }
  }, [roomCode]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const url = new URL(`/api/rooms/${roomCode}/messages`, window.location.origin);
      if (lastMessageTimeRef.current) {
        url.searchParams.set("after", lastMessageTimeRef.current);
      }

      const res = await fetch(url.toString());
      if (!res.ok) return;

      const data: MessageInfo[] = await res.json();

      if (data.length > 0) {
        if (lastMessageTimeRef.current) {
          // Append new messages
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.filter((m) => !existingIds.has(m.id));
            // Also update existing messages (reactions, flags, hidden status may change)
            const updated = prev.map((existing) => {
              const freshVersion = data.find((m) => m.id === existing.id);
              return freshVersion ?? existing;
            });
            return [...updated, ...newMsgs];
          });
        } else {
          setMessages(data);
        }
        const latest = data[data.length - 1];
        lastMessageTimeRef.current = latest.createdAt;
      }
    } catch {
      // Silently fail on polling errors
    }
  }, [roomCode]);

  // Fetch participants
  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomCode}/participants`);
      if (!res.ok) return;
      const data: ParticipantInfo[] = await res.json();
      setParticipants(data);
    } catch {
      // Silently fail
    }
  }, [roomCode]);

  // Initial load
  useEffect(() => {
    async function init() {
      setIsLoading(true);
      const roomData = await fetchRoom();
      if (roomData) {
        await Promise.all([fetchMessages(), fetchParticipants()]);
      }
      setIsLoading(false);
    }
    init();
  }, [fetchRoom, fetchMessages, fetchParticipants]);

  // Polling for new messages and participants
  useEffect(() => {
    if (!room || !currentParticipant) return;

    pollingRef.current = setInterval(() => {
      fetchMessages();
      fetchParticipants();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [room, currentParticipant, fetchMessages, fetchParticipants]);

  // Send message
  const sendMessage = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode, text }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send message");
        }

        // Immediately fetch to get the new message
        await fetchMessages();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to send";
        setError(msg);
      }
    },
    [roomCode, fetchMessages]
  );

  // Flag message
  const flagMessage = useCallback(
    async (messageId: string, reason: string) => {
      try {
        const res = await fetch(`/api/messages/${messageId}/flag`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason, roomCode }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to flag message");
        }

        // Update local state
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, userFlagged: true, flags: m.flags + 1 }
              : m
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to flag";
        setError(msg);
      }
    },
    [roomCode]
  );

  // React to message
  const reactToMessage = useCallback(
    async (messageId: string, emoji: string) => {
      try {
        const res = await fetch(
          `/api/messages/${messageId}/react`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emoji, roomCode }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to react");
        }

        const result = await res.json();

        // Optimistic update
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const hasReaction = m.userReactions.includes(emoji);
            return {
              ...m,
              reactions: {
                ...m.reactions,
                [emoji]: (m.reactions[emoji] ?? 0) + (hasReaction ? -1 : 1),
              },
              userReactions: hasReaction
                ? m.userReactions.filter((r) => r !== emoji)
                : [...m.userReactions, emoji],
            };
          })
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to react";
        setError(msg);
      }
    },
    [roomCode]
  );

  // Toggle pin
  const togglePin = useCallback(
    async (messageId: string) => {
      try {
        const res = await fetch(
          `/api/messages/${messageId}/pin`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ roomCode }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to toggle pin");
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId ? { ...m, isPinned: !m.isPinned } : m
          )
        );
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to pin";
        setError(msg);
      }
    },
    [roomCode]
  );

  // Reveal identity
  const reveal = useCallback(
    async (
      level: number,
      hint?: string,
      partial?: string,
      full?: string
    ) => {
      try {
        const res = await fetch(`/api/participants/${currentParticipant?.id}/reveal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level, hint, partial, full, roomCode }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to reveal");
        }

        const updated = await res.json();
        setCurrentParticipant((prev) =>
          prev ? { ...prev, ...updated } : prev
        );

        // Refresh participants
        await fetchParticipants();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to reveal";
        setError(msg);
      }
    },
    [roomCode, fetchParticipants]
  );

  return {
    room,
    messages,
    participants,
    currentParticipant,
    sendMessage,
    flagMessage,
    reactToMessage,
    togglePin,
    reveal,
    isLoading,
    error,
  };
}
