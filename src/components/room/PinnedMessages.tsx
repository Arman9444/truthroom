"use client";

import { useState } from "react";
import type { MessageInfo } from "@/types";

interface PinnedMessagesProps {
  messages: MessageInfo[];
  participantId: string;
}

export function PinnedMessages({ messages, participantId }: PinnedMessagesProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (messages.length === 0) return null;

  return (
    <div>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 w-full px-4 sm:px-6 py-2 bg-[#d4a847]/5 border-b border-[#d4a847]/10 cursor-pointer hover:bg-[#d4a847]/10 transition-colors"
      >
        <span>&#128204;</span>
        <span className="text-xs font-medium text-[#d4a847]">Pinned</span>
        <span className="text-[10px] bg-[#d4a847]/15 text-[#d4a847] px-1.5 py-0.5 rounded-full font-medium">
          {messages.length}
        </span>
        <span className="ml-auto text-xs text-[#d4a847]/50">
          {isExpanded ? "\u25BE" : "\u25B8"}
        </span>
      </button>

      {isExpanded && (
        <div>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="px-4 sm:px-6 py-2 bg-[#d4a847]/[0.02] border-b border-[#d4a847]/5"
            >
              <p className="text-sm text-[#e8e4df]/70 truncate">
                <span className="text-xs mr-1">{msg.postedAsMask}</span>
                <span className="text-xs font-medium text-[#d4a847]/60 mr-1.5">
                  {msg.postedAsAlias}
                </span>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
