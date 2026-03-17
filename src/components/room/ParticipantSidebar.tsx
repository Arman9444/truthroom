"use client";

import { cn } from "@/lib/utils";
import type { ParticipantInfo } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface ParticipantSidebarProps {
  participants: ParticipantInfo[];
  currentParticipantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ParticipantSidebar({
  participants,
  currentParticipantId,
  isOpen,
  onClose,
}: ParticipantSidebarProps) {
  const activeParticipants = participants.filter((p) => p.isActive);

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "z-50 flex flex-col border-l border-border/30 bg-card transition-transform duration-200",
          // Desktop: static sidebar
          "hidden md:flex md:w-56 md:translate-x-0",
          // Mobile: overlay from right
          isOpen &&
            "fixed inset-y-0 right-0 flex w-72 translate-x-0 md:relative md:w-56",
          !isOpen && "fixed inset-y-0 right-0 translate-x-full md:relative"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-foreground">Participants</h3>
            <Badge
              variant="outline"
              className="border-amber/30 bg-amber/10 text-[10px] text-amber"
            >
              {activeParticipants.length}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-muted-foreground md:hidden"
            onClick={onClose}
          >
            &times;
          </Button>
        </div>

        <Separator className="bg-border/30" />

        {/* Participant list */}
        <ScrollArea className="flex-1">
          <div className="space-y-0.5 p-2">
            {activeParticipants.map((participant) => {
              const isCurrent = participant.id === currentParticipantId;
              return (
                <div
                  key={participant.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                    isCurrent
                      ? "bg-amber/10 text-amber"
                      : "text-muted-foreground"
                  )}
                >
                  <span className="text-base">{participant.mask}</span>
                  <span className={cn("truncate", isCurrent && "font-medium")}>
                    {participant.alias}
                  </span>
                  {isCurrent && (
                    <span className="ml-auto text-[10px] text-amber/50">(you)</span>
                  )}
                  {participant.revealLevel > 0 && (
                    <Badge
                      variant="outline"
                      className="ml-auto border-amber/20 bg-amber/5 text-[9px] text-amber/60"
                    >
                      {participant.revealLevel === 3 && participant.revealFull
                        ? participant.revealFull
                        : participant.revealLevel === 2
                          ? participant.revealPartial ?? "Partial"
                          : participant.revealHint ?? "Hint"}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
