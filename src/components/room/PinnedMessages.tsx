"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { MessageInfo } from "@/types";

interface PinnedMessagesProps {
  messages: MessageInfo[];
  participantId: string;
}

export function PinnedMessages({ messages, participantId }: PinnedMessagesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (messages.length === 0) return null;

  return (
    <div className="border-b border-amber/15 bg-amber/5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-2 px-4 py-2 text-xs text-amber/70 transition-colors hover:bg-amber/10"
      >
        <span>📌</span>
        <span className="font-medium">
          {messages.length} pinned message{messages.length !== 1 ? "s" : ""}
        </span>
        <span className="ml-auto">{isExpanded ? "▾" : "▸"}</span>
      </button>

      {isExpanded && (
        <div className="space-y-1 px-4 pb-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-md bg-amber/5 px-3 py-2 text-sm"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-xs">{msg.postedAsMask}</span>
                <span className="text-xs font-medium text-amber/80">
                  {msg.postedAsAlias}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-foreground/70">
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
