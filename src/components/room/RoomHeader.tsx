"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RoomInfo } from "@/types";
import { Copy, Settings, Users } from "lucide-react";

interface RoomHeaderProps {
  room: RoomInfo;
  participantCount: number;
  onToggleSidebar: () => void;
}

export function RoomHeader({
  room,
  participantCount,
  onToggleSidebar,
}: RoomHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(room.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for clipboard API failure
    }
  };

  return (
    <header className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-[#14161d] px-4 sm:px-6 py-3">
      {/* Left: Room info */}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-[#e8e4df]">
          {room.name}
        </h1>
        {room.topic && (
          <p className="hidden sm:block truncate text-xs text-[#6b6e7a]">
            {room.topic}
          </p>
        )}
      </div>

      {/* Center: Participant count pill */}
      <div className="flex items-center gap-1.5 rounded-full bg-[#d4a847]/10 px-2.5 py-1 text-xs text-[#d4a847]">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>{participantCount} in room</span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Room code copy button */}
        <button
          onClick={handleCopyCode}
          className={cn(
            "flex items-center gap-1 font-mono text-xs transition-colors",
            copied
              ? "text-[#d4a847]"
              : "text-[#6b6e7a] hover:text-[#e8e4df]"
          )}
        >
          {copied ? "Copied!" : room.code}
          <Copy size={12} />
        </button>

        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-[#6b6e7a] hover:text-[#e8e4df] hover:bg-white/5 transition-colors"
        >
          <Users size={18} />
        </button>
      </div>
    </header>
  );
}
