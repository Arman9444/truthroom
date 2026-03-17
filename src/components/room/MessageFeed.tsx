"use client";

import { useEffect, useRef } from "react";
import type { MessageInfo } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { PinnedMessages } from "./PinnedMessages";

interface MessageFeedProps {
  messages: MessageInfo[];
  participantId: string;
  onFlag: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

export function MessageFeed({
  messages,
  participantId,
  onFlag,
  onReact,
}: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const pinnedMessages = messages.filter((m) => m.isPinned);
  const chronologicalMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > prevMessageCountRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevMessageCountRef.current = messages.length;
  }, [messages.length]);

  // Scroll to bottom on initial load
  useEffect(() => {
    bottomRef.current?.scrollIntoView();
  }, []);

  return (
    <div
      className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:#6b6e7a30_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#6b6e7a]/20 [&::-webkit-scrollbar-thumb]:rounded-full"
    >
      {pinnedMessages.length > 0 && (
        <PinnedMessages messages={pinnedMessages} participantId={participantId} />
      )}

      <div ref={scrollRef} className="flex flex-col py-3">
        {chronologicalMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[240px]">
            <span className="text-6xl text-[#6b6e7a]/10 font-serif select-none">&ldquo;</span>
            <p className="text-[#6b6e7a] text-sm mt-2">
              The room is quiet. Be the first to share.
            </p>
          </div>
        ) : (
          chronologicalMessages.map((message) => (
            <div key={message.id} className="animate-slide-up">
              <MessageBubble
                message={message}
                isOwnMessage={message.participantId === participantId}
                onFlag={onFlag}
                onReact={onReact}
              />
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
