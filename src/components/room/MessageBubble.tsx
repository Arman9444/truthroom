"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ALLOWED_REACTIONS, type MessageInfo } from "@/types";
import { ReactionBar } from "./ReactionBar";
import { Flag } from "lucide-react";

interface MessageBubbleProps {
  message: MessageInfo;
  isOwnMessage: boolean;
  onFlag: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessageBubble({
  message,
  isOwnMessage,
  onFlag,
  onReact,
}: MessageBubbleProps) {
  const [showHidden, setShowHidden] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // Reveal system messages — special treatment
  if (message.isSystemMsg && message.revealLevel && message.revealLevel > 0) {
    return (
      <div className="animate-fade-in bg-[#d4a847]/5 border border-[#d4a847]/10 rounded-lg mx-4 sm:mx-6 py-2 px-4">
        <p className="text-sm italic text-[#d4a847]/80 text-center">
          &mdash; {message.text} &mdash;
        </p>
      </div>
    );
  }

  // System messages have distinct styling
  if (message.isSystemMsg) {
    return (
      <div className="text-center py-2 px-4">
        <p className="text-sm italic text-[#6b6e7a]">
          &mdash; {message.text} &mdash;
        </p>
      </div>
    );
  }

  // Hidden messages
  if (message.isHidden && !showHidden) {
    return (
      <div
        className={cn(
          "group relative px-4 sm:px-6 py-3",
          isOwnMessage && "border-l-2 border-[#d4a847]/40"
        )}
      >
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base" role="img" aria-label="mask">
            {message.postedAsMask}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              message.revealLevel > 0 ? "text-[#d4a847]" : "text-[#e8e4df]"
            )}
          >
            {message.postedAsAlias}
          </span>
          <span className="ml-auto text-[10px] text-[#6b6e7a]/50">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Blurred text with overlay */}
        <div className="relative">
          <p className="text-sm text-[#e8e4df]/90 leading-relaxed whitespace-pre-wrap blur-sm">
            {message.text}
          </p>
          <div className="absolute inset-0 flex items-center gap-2">
            <span className="text-[#6b6e7a] text-xs">[Hidden by community]</span>
            <button
              onClick={() => setShowHidden(true)}
              className="text-[#6b8aab] text-xs hover:underline cursor-pointer"
            >
              show anyway
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group relative px-4 sm:px-6 py-3 hover:bg-white/[0.02] transition-colors",
        isOwnMessage && "border-l-2 border-[#d4a847]/40"
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Header: mask, alias, reveal badge, pin, timestamp */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-base" role="img" aria-label="mask">
          {message.postedAsMask}
        </span>
        <span
          className={cn(
            "text-sm font-medium",
            message.revealLevel > 0 ? "text-[#d4a847]" : "text-[#e8e4df]"
          )}
        >
          {message.postedAsAlias}
        </span>

        {message.revealLevel > 0 && (
          <span className="text-[10px] text-[#d4a847]/60 bg-[#d4a847]/10 px-1.5 py-0.5 rounded">
            {message.revealLevel === 3 && message.revealName
              ? message.revealName
              : message.revealLevel === 2
                ? "Partially revealed"
                : "Hint given"}
          </span>
        )}

        {message.isPinned && <span className="text-xs">📌</span>}

        <span className="ml-auto text-[10px] text-[#6b6e7a]/50">
          {formatTime(message.createdAt)}
        </span>
      </div>

      {/* Message text */}
      <p className="text-sm text-[#e8e4df]/90 leading-relaxed whitespace-pre-wrap">
        {message.text}
      </p>

      {/* Reactions */}
      {Object.keys(message.reactions).length > 0 && (
        <div className="mt-2">
          <ReactionBar
            reactions={message.reactions}
            userReactions={message.userReactions}
            onReact={(emoji) => onReact(message.id, emoji)}
          />
        </div>
      )}

      {/* Hover actions bar */}
      <div
        className={cn(
          "absolute -top-3 right-4 flex gap-0.5 bg-[#14161d] border border-white/[0.06] rounded-lg px-1 py-0.5 shadow-lg transition-opacity",
          showActions ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      >
        {/* Reaction quick buttons */}
        {ALLOWED_REACTIONS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onReact(message.id, emoji)}
            className="text-xs hover:bg-white/5 rounded p-1 cursor-pointer"
            title={`React with ${emoji}`}
          >
            {emoji}
          </button>
        ))}

        {/* Flag button (don't show for own messages) */}
        {!isOwnMessage && (
          <>
            <div className="mx-0.5 h-4 w-px bg-white/[0.06]" />
            <button
              onClick={() => onFlag(message.id)}
              className="rounded p-1 text-[#6b6e7a] hover:text-[#c4604a] cursor-pointer transition-colors"
              title="Flag this message"
            >
              <Flag size={12} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
