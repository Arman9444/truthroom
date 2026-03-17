"use client";

import { useState } from "react";

interface RevealModalProps {
  isOpen: boolean;
  currentLevel: number;
  allowReveal: boolean;
  onClose: () => void;
  onReveal: (
    level: number,
    hint?: string,
    partial?: string,
    full?: string
  ) => void;
}

const LEVELS = [
  {
    level: 1,
    title: "Hint",
    description:
      'Share a vague hint about who you are (e.g., "I work in the same building as most of you")',
    placeholder: "A vague hint...",
    field: "hint" as const,
  },
  {
    level: 2,
    title: "Partial Reveal",
    description:
      'Share more identifying information (e.g., "I\'m on the marketing team")',
    placeholder: "More specific info...",
    field: "partial" as const,
  },
  {
    level: 3,
    title: "Full Reveal",
    description: "Share your real name or identity. Everyone will see who you are.",
    placeholder: "Your real name...",
    field: "full" as const,
  },
];

export function RevealModal({
  isOpen,
  currentLevel,
  allowReveal,
  onClose,
  onReveal,
}: RevealModalProps) {
  const [hint, setHint] = useState("");
  const [partial, setPartial] = useState("");
  const [full, setFull] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  const handleReveal = () => {
    if (selectedLevel === null) return;
    onReveal(
      selectedLevel,
      selectedLevel >= 1 ? hint || undefined : undefined,
      selectedLevel >= 2 ? partial || undefined : undefined,
      selectedLevel >= 3 ? full || undefined : undefined
    );
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedLevel(null);
      onClose();
    }
  };

  if (!allowReveal) return null;
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-lg w-full mx-4">
        <h2 className="font-serif text-xl text-[#e8e4df] mb-1">
          Reveal Your Identity
        </h2>
        <p className="text-sm text-[#6b6e7a] mb-4">
          Choose how much to reveal. Each level shares more about who you are.
        </p>

        <div className="bg-[#d4a847]/10 border border-[#d4a847]/20 rounded-lg px-4 py-3 mb-5">
          <p className="text-sm font-medium text-[#d4a847]">
            This is a one-way door &mdash; you cannot go back.
          </p>
          <p className="text-xs text-[#d4a847]/60 mt-0.5">
            Once you reveal, all your past and future messages will show your
            reveal level.
          </p>
        </div>

        <div className="space-y-3">
          {LEVELS.map(({ level, title, description, placeholder, field }) => {
            const isCompleted = currentLevel >= level;
            const isNext = level === currentLevel + 1;
            const isLocked = level > currentLevel + 1;
            const isSelected = selectedLevel === level;

            let className =
              "w-full text-left px-4 py-3 rounded-xl border transition-all";

            if (isCompleted) {
              className +=
                " border-[#d4a847]/30 bg-[#d4a847]/10 opacity-60";
            } else if (isSelected) {
              className +=
                " border-[#d4a847]/40 bg-[#d4a847]/10";
            } else if (isNext) {
              className +=
                " border-white/[0.06] hover:border-[#d4a847]/30 hover:bg-[#d4a847]/5 cursor-pointer";
            } else {
              className +=
                " border-white/[0.06] opacity-30 cursor-not-allowed";
            }

            return (
              <div key={level}>
                <button
                  onClick={() => {
                    if (!isLocked && !isCompleted) setSelectedLevel(level);
                  }}
                  disabled={isLocked || isCompleted}
                  className={className}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#e8e4df]">
                      Level {level}: {title}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-[#d4a847]">Done</span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-[#6b6e7a]/50">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6b6e7a] mt-0.5">
                    {description}
                  </p>
                </button>

                {isSelected && (
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={
                        field === "hint"
                          ? hint
                          : field === "partial"
                            ? partial
                            : full
                      }
                      onChange={(e) => {
                        if (field === "hint") setHint(e.target.value);
                        else if (field === "partial") setPartial(e.target.value);
                        else setFull(e.target.value);
                      }}
                      className="w-full bg-[#0a0a0f] border border-white/10 focus:border-[#d4a847] rounded-lg px-3 py-2 text-sm text-[#e8e4df] placeholder:text-[#6b6e7a]/50 outline-none transition-colors"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={() => {
              setSelectedLevel(null);
              onClose();
            }}
            className="text-[#6b6e7a] hover:text-[#e8e4df] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleReveal}
            disabled={selectedLevel === null}
            className="bg-[#d4a847] text-[#0a0a0f] font-semibold px-6 py-2.5 rounded-lg disabled:opacity-30 transition-colors"
          >
            Reveal Level {selectedLevel ?? "..."}
          </button>
        </div>
      </div>
    </div>
  );
}
