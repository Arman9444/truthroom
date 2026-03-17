"use client";

import { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <ScrollArea className="flex-1">
      <PinnedMessages messages={pinnedMessages} participantId={participantId} />

      <div ref={scrollRef} className="space-y-1 px-4 py-3">
        {chronologicalMessages.length === 0 ? (
          <div className="flex h-40 items-center justify-center">
            <p className="text-sm italic text-muted-foreground/40">
              The room is quiet. Be the first to share.
            </p>
          </div>
        ) : (
          chronologicalMessages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.participantId === participantId}
              onFlag={onFlag}
              onReact={onReact}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
