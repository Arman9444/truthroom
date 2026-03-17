"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ALLOWED_REACTIONS, type MessageInfo } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactionBar } from "./ReactionBar";

interface MessageBubbleProps {
  message: MessageInfo;
  isOwnMessage: boolean;
  onFlag: (id: string) => void;
  onReact: (id: string, emoji: string) => void;
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function MessageBubble({
  message,
  isOwnMessage,
  onFlag,
  onReact,
}: MessageBubbleProps) {
  const [showHidden, setShowHidden] = useState(false);
  const [showActions, setShowActions] = useState(false);

  // System messages have distinct styling
  if (message.isSystemMsg) {
    return (
      <div className="animate-fade-in py-2 text-center">
        <p className="text-xs italic text-muted-foreground/70">{message.text}</p>
      </div>
    );
  }

  // Hidden messages
  if (message.isHidden && !showHidden) {
    return (
      <div className="animate-fade-in py-2">
        <div className="rounded-lg border border-border/30 bg-secondary/30 px-4 py-3">
          <p className="text-sm italic text-muted-foreground/50">
            [This message was hidden by the community]
          </p>
          <button
            onClick={() => setShowHidden(true)}
            className="mt-1 text-xs text-muted-foreground/40 underline hover:text-muted-foreground/60"
          >
            show anyway
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="animate-fade-in group py-1"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          "relative rounded-lg px-4 py-3 transition-colors",
          isOwnMessage
            ? "bg-amber/5 border border-amber/15"
            : "bg-secondary/40 border border-transparent hover:border-border/20"
        )}
      >
        {/* Pin indicator */}
        {message.isPinned && (
          <div className="absolute -top-1 right-2 text-xs text-amber/70">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <span className="cursor-default">📌</span>
                </TooltipTrigger>
                <TooltipContent>Pinned message</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}

        {/* Header: mask, alias, reveal badge, timestamp */}
        <div className="mb-1 flex items-center gap-2">
          <span className="text-base" role="img" aria-label="mask">
            {message.postedAsMask}
          </span>
          <span
            className={cn(
              "text-sm font-medium",
              isOwnMessage ? "text-amber" : "text-foreground"
            )}
          >
            {message.postedAsAlias}
          </span>

          {message.revealLevel > 0 && (
            <Badge
              variant="outline"
              className="border-amber/30 bg-amber/10 text-[10px] text-amber"
            >
              {message.revealLevel === 3 && message.revealName
                ? message.revealName
                : message.revealLevel === 2
                  ? "Partially revealed"
                  : "Hint given"}
            </Badge>
          )}

          <span className="ml-auto text-[10px] text-muted-foreground/50">
            {formatTime(message.createdAt)}
          </span>
        </div>

        {/* Message text */}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
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

        {/* Hover actions */}
        <div
          className={cn(
            "absolute -top-3 right-2 flex items-center gap-0.5 rounded-md border border-border/50 bg-card px-1 py-0.5 shadow-md transition-opacity",
            showActions ? "opacity-100" : "pointer-events-none opacity-0"
          )}
        >
          {/* Reaction quick buttons */}
          {ALLOWED_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="rounded p-1 text-xs transition-colors hover:bg-secondary"
              title={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}

          {/* Flag button (don't show for own messages) */}
          {!isOwnMessage && (
            <>
              <div className="mx-0.5 h-4 w-px bg-border/50" />
              <button
                onClick={() => onFlag(message.id)}
                className="rounded p-1 text-xs text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                title="Flag this message"
              >
                🚩
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
