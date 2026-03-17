"use client";

import { ALLOWED_REACTIONS } from "@/types";

interface ReactionBarProps {
  reactions: Record<string, number>;
  userReactions: string[];
  onReact: (emoji: string) => void;
}

export function ReactionBar({ reactions, userReactions, onReact }: ReactionBarProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ALLOWED_REACTIONS.map((emoji) => {
        const count = reactions[emoji] ?? 0;
        const isActive = userReactions.includes(emoji);

        if (count === 0 && !isActive) return null;

        return (
          <button
            key={emoji}
            onClick={() => onReact(emoji)}
            className={
              isActive
                ? "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer bg-[#d4a847]/15 text-[#d4a847] border border-[#d4a847]/30"
                : "flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors cursor-pointer bg-white/5 text-[#6b6e7a] hover:bg-white/10"
            }
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        );
      })}
    </div>
  );
}
