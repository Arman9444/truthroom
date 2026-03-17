"use client";

import { useState, useEffect, useCallback, useRef, use } from "react";
import type {
  RoomInfo,
  MessageInfo,
  ParticipantInfo,
} from "@/types";
import { RulesAgreement } from "@/components/room/RulesAgreement";
import { RoomHeader } from "@/components/room/RoomHeader";
import { MessageFeed } from "@/components/room/MessageFeed";
import { MessageInput } from "@/components/room/MessageInput";
import { ParticipantSidebar } from "@/components/room/ParticipantSidebar";
import { FlagModal } from "@/components/room/FlagModal";
import { RevealModal } from "@/components/room/RevealModal";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: PageProps) {
  const { code } = use(params);

  // Core state
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [messages, setMessages] = useState<MessageInfo[]>([]);
  const [participants, setParticipants] = useState<ParticipantInfo[]>([]);
  const [currentParticipant, setCurrentParticipant] =
    useState<ParticipantInfo | null>(null);

  // UI state
  const [phase, setPhase] = useState<"loading" | "agreement" | "joined" | "error">(
    "loading"
  );
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagTargetId, setFlagTargetId] = useState<string | null>(null);
  const [revealModalOpen, setRevealModalOpen] = useState(false);
  const [typingCount, setTypingCount] = useState(0);

  // Refs for polling
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMessageTimeRef = useRef<string | null>(null);

  // ---------- Fetch helpers ----------

  const fetchRoom = useCallback(async (): Promise<RoomInfo | null> => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Room not found");
      }
      const data: RoomInfo = await res.json();
      setRoom(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load room");
      setPhase("error");
      return null;
    }
  }, [code]);

  const fetchMessages = useCallback(async () => {
    try {
      const url = new URL(`/api/rooms/${code}/messages`, window.location.origin);
      if (lastMessageTimeRef.current) {
        url.searchParams.set("after", lastMessageTimeRef.current);
      }
      const res = await fetch(url.toString());
      if (!res.ok) return;
      const data: MessageInfo[] = await res.json();

      if (data.length > 0) {
        if (lastMessageTimeRef.current) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMsgs = data.filter((m) => !existingIds.has(m.id));
            const updated = prev.map((existing) => {
              const freshVersion = data.find((m) => m.id === existing.id);
              return freshVersion ?? existing;
            });
            return [...updated, ...newMsgs];
          });
        } else {
          setMessages(data);
        }
        lastMessageTimeRef.current = data[data.length - 1].createdAt;
      }
    } catch {
      // Silent polling failure
    }
  }, [code]);

  const fetchParticipants = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/participants`);
      if (!res.ok) return;
      const data: ParticipantInfo[] = await res.json();
      setParticipants(data);
    } catch {
      // Silent failure
    }
  }, [code]);

  // ---------- Init: fetch room ----------

  useEffect(() => {
    async function init() {
      const roomData = await fetchRoom();
      if (!roomData) return;

      if (roomData.requireAgreement) {
        setPhase("agreement");
      } else {
        // Auto-join if no agreement required
        await handleJoin();
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Join room ----------

  const handleJoin = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}/join`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to join");
      }

      const participant = await res.json();
      setCurrentParticipant({
        id: participant.id,
        alias: participant.alias,
        mask: participant.mask,
        isActive: true,
        revealLevel: 0,
      });

      // Fetch initial data
      await Promise.all([fetchMessages(), fetchParticipants()]);
      setPhase("joined");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join room");
      setPhase("error");
    }
  }, [code, fetchMessages, fetchParticipants]);

  // ---------- Polling ----------

  useEffect(() => {
    if (phase !== "joined") return;

    pollingRef.current = setInterval(() => {
      fetchMessages();
      fetchParticipants();
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [phase, fetchMessages, fetchParticipants]);

  // ---------- Actions ----------

  const handleSendMessage = useCallback(
    async (text: string) => {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomCode: code, text }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to send");
        }

        await fetchMessages();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to send message");
      }
    },
    [code, fetchMessages]
  );

  const handleFlag = useCallback((messageId: string) => {
    setFlagTargetId(messageId);
    setFlagModalOpen(true);
  }, []);

  const handleFlagSubmit = useCallback(
    async (reason: string) => {
      if (!flagTargetId) return;
      try {
        const res = await fetch(
          `/api/messages/${flagTargetId}/flag`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason, roomCode: code }),
          }
        );

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to flag");
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === flagTargetId
              ? { ...m, userFlagged: true, flags: m.flags + 1 }
              : m
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to flag message");
      }
      setFlagTargetId(null);
    },
    [code, flagTargetId]
  );

  const handleReact = useCallback(
    async (messageId: string, emoji: string) => {
      // Optimistic update
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const hasReaction = m.userReactions.includes(emoji);
          return {
            ...m,
            reactions: {
              ...m.reactions,
              [emoji]: Math.max(
                0,
                (m.reactions[emoji] ?? 0) + (hasReaction ? -1 : 1)
              ),
            },
            userReactions: hasReaction
              ? m.userReactions.filter((r) => r !== emoji)
              : [...m.userReactions, emoji],
          };
        })
      );

      try {
        await fetch(`/api/messages/${messageId}/react`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji, roomCode: code }),
        });
      } catch {
        // Revert on error by refetching
        await fetchMessages();
      }
    },
    [code, fetchMessages]
  );

  const handleReveal = useCallback(
    async (
      level: number,
      hint?: string,
      partial?: string,
      full?: string
    ) => {
      try {
        if (!currentParticipant?.id) {
          throw new Error("No participant session found. Try refreshing the page.");
        }
        const res = await fetch(`/api/participants/${currentParticipant.id}/reveal`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ level, hint, partial, full, roomCode: code }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to reveal");
        }

        const updated = await res.json();
        setCurrentParticipant((prev) =>
          prev ? { ...prev, ...updated } : prev
        );
        await fetchParticipants();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reveal");
      }
    },
    [code, fetchParticipants]
  );

  // Typing indicator stubs (will connect to Socket.IO later)
  const handleTypingStart = useCallback(() => {
    // Will emit via socket
  }, []);

  const handleTypingStop = useCallback(() => {
    // Will emit via socket
  }, []);

  // ---------- Render ----------

  // Loading state
  if (phase === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="glow-amber animate-pulse-glow text-4xl">&#9679;</div>
          <p className="mt-4 text-sm text-muted-foreground/50">
            Entering the room...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (phase === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-destructive">{error || "Something went wrong"}</p>
          <Button
            variant="ghost"
            className="mt-4 text-muted-foreground"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  // Agreement phase
  if (phase === "agreement" && room) {
    return (
      <RulesAgreement
        contentWarning={room.contentWarning}
        onAgree={handleJoin}
      />
    );
  }

  // Joined phase - full room UI
  if (phase === "joined" && room && currentParticipant) {
    return (
      <div className="flex h-screen flex-col bg-background">
        <RoomHeader
          room={room}
          participantCount={participants.filter((p) => p.isActive).length}
          onToggleSidebar={() => setSidebarOpen((o) => !o)}
        />

        <div className="flex min-h-0 flex-1">
          {/* Main content area */}
          <div className="flex min-w-0 flex-1 flex-col">
            <MessageFeed
              messages={messages}
              participantId={currentParticipant.id}
              onFlag={handleFlag}
              onReact={handleReact}
            />

            <MessageInput
              onSend={handleSendMessage}
              slowMode={room.slowMode}
              typingCount={typingCount}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </div>

          {/* Sidebar */}
          <ParticipantSidebar
            participants={participants}
            currentParticipantId={currentParticipant.id}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Reveal button - floating in bottom-right area on desktop */}
        {room.allowReveal && (
          <Button
            variant="ghost"
            size="sm"
            className="fixed bottom-20 right-4 z-30 border border-amber/20 bg-card/90 text-xs text-amber/70 backdrop-blur-sm hover:bg-amber/10 hover:text-amber md:bottom-4 md:right-60"
            onClick={() => setRevealModalOpen(true)}
          >
            Reveal Identity
          </Button>
        )}

        {/* Modals */}
        <FlagModal
          isOpen={flagModalOpen}
          onClose={() => {
            setFlagModalOpen(false);
            setFlagTargetId(null);
          }}
          onSubmit={handleFlagSubmit}
        />

        <RevealModal
          isOpen={revealModalOpen}
          currentLevel={currentParticipant.revealLevel}
          allowReveal={room.allowReveal}
          onClose={() => setRevealModalOpen(false)}
          onReveal={handleReveal}
        />

        {/* Error toast */}
        {error && (
          <div className="fixed bottom-4 left-4 z-50 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive shadow-lg">
            {error}
            <button
              className="ml-3 text-xs underline"
              onClick={() => setError(null)}
            >
              dismiss
            </button>
          </div>
        )}
      </div>
    );
  }

  return null;
}
