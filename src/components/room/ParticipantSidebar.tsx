"use client";

import { cn } from "@/lib/utils";
import type { ParticipantInfo } from "@/types";
import { X } from "lucide-react";

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
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "z-50 flex h-full flex-col border-l border-white/[0.06] bg-[#14161d] transition-transform duration-200",
          // Desktop: static sidebar
          "hidden md:flex md:w-64 md:translate-x-0",
          // Mobile: overlay from right
          isOpen &&
            "fixed inset-y-0 right-0 flex w-72 translate-x-0 md:relative md:w-64",
          !isOpen && "fixed inset-y-0 right-0 translate-x-full md:relative"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[#6b6e7a]">
              Participants
            </h3>
            <span className="text-xs text-[#d4a847]">
              {activeParticipants.length}
            </span>
          </div>
          <button
            className="p-1 rounded-lg text-[#6b6e7a] hover:text-[#e8e4df] hover:bg-white/5 transition-colors md:hidden"
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        {/* Participant list */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="space-y-1 mt-3">
            {activeParticipants.map((participant) => {
              const isCurrent = participant.id === currentParticipantId;
              const isRevealed =
                participant.revealLevel > 0 &&
                (participant.revealFull ||
                  participant.revealPartial ||
                  participant.revealHint);
              const revealName =
                participant.revealLevel === 3
                  ? participant.revealFull
                  : participant.revealLevel === 2
                    ? participant.revealPartial ?? "Partial"
                    : participant.revealHint ?? "Hint";

              return (
                <div
                  key={participant.id}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2",
                    isCurrent &&
                      "border border-[#d4a847]/20 bg-[#d4a847]/10"
                  )}
                >
                  {/* Mask emoji */}
                  <span className="text-base">{participant.mask}</span>

                  {/* Name block */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "block truncate text-sm",
                        isCurrent
                          ? "text-[#d4a847]"
                          : isRevealed
                            ? "text-[#d4a847]/80"
                            : "text-[#e8e4df]"
                      )}
                    >
                      {participant.alias}
                    </span>
                    {isRevealed && (
                      <span className="block truncate text-[11px] text-[#6b8aab]">
                        {revealName}
                      </span>
                    )}
                  </div>

                  {/* You badge or active dot */}
                  {isCurrent ? (
                    <span className="ml-auto text-[10px] text-[#d4a847]/60">
                      (you)
                    </span>
                  ) : (
                    participant.isActive && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}
