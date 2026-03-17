"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { RoomInfo } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <header className="flex items-center gap-3 border-b border-border/30 bg-card/80 px-4 py-3 backdrop-blur-sm">
      {/* Room info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h1 className="glow-amber-subtle truncate text-lg font-semibold text-amber">
            {room.name}
          </h1>
          <Badge
            variant="outline"
            className="shrink-0 border-amber/30 bg-amber/10 text-[10px] text-amber"
          >
            {participantCount} in room
          </Badge>
        </div>
        {room.topic && (
          <p className="truncate text-xs text-muted-foreground/60">{room.topic}</p>
        )}
      </div>

      {/* Room code */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            onClick={handleCopyCode}
            className={cn(
              "rounded-md border border-border/30 bg-secondary/50 px-2 py-1 font-mono text-xs transition-colors cursor-pointer",
              copied ? "text-amber" : "text-muted-foreground/60 hover:text-muted-foreground"
            )}
          >
            {copied ? "Copied!" : room.code}
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy room code</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Sidebar toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground"
        onClick={onToggleSidebar}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </Button>
    </header>
  );
}
