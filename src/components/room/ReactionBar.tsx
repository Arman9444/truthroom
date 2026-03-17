"use client";

import { cn } from "@/lib/utils";
import { ALLOWED_REACTIONS } from "@/types";

interface ReactionBarProps {
  reactions: Record<string, number>;
  userReactions: string[];
  onReact: (emoji: string) => void;
}

export function ReactionBar({ reactions, userReactions, onReact }: ReactionBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {ALLOWED_REACTIONS.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        const isActive = userReactions.includes(emoji);

        if (count === 0 && !isActive) return null;

        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors",
              isActive
                ? "bg-amber/20 text-amber ring-1 ring-amber/40"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            )}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
