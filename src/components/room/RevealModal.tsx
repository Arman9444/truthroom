"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedLevel(null);
      onClose();
    }
  };

  if (!allowReveal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border/30 bg-card sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Reveal Your Identity
          </DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Choose how much to reveal. Each level shares more about who you are.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="rounded-md border border-amber/30 bg-amber/5 px-3 py-2">
          <p className="text-xs font-medium text-amber">
            This is a one-way door &mdash; you cannot go back.
          </p>
          <p className="mt-0.5 text-[11px] text-amber/60">
            Once you reveal, all your past and future messages will show your
            reveal level.
          </p>
        </div>

        <Separator className="bg-border/30" />

        {/* Levels */}
        <div className="space-y-3 py-2">
          {LEVELS.map(({ level, title, description, placeholder, field }) => {
            const isCompleted = currentLevel >= level;
            const isNext = level === currentLevel + 1;
            const isLocked = level > currentLevel + 1;
            const isSelected = selectedLevel === level;

            return (
              <div key={level}>
                <button
                  onClick={() => {
                    if (!isLocked && !isCompleted) setSelectedLevel(level);
                  }}
                  disabled={isLocked || isCompleted}
                  className={cn(
                    "w-full rounded-lg border px-4 py-3 text-left transition-colors",
                    isCompleted
                      ? "border-amber/30 bg-amber/10 opacity-60"
                      : isSelected
                        ? "border-amber/50 bg-amber/15"
                        : isNext
                          ? "border-border/40 bg-secondary/30 hover:bg-secondary/50"
                          : "cursor-not-allowed border-border/20 bg-secondary/10 opacity-40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">
                      Level {level}: {title}
                    </span>
                    {isCompleted && (
                      <span className="text-xs text-amber">Done</span>
                    )}
                    {isLocked && (
                      <span className="text-xs text-muted-foreground/40">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground/60">
                    {description}
                  </p>
                </button>

                {/* Input for the selected level */}
                {isSelected && (
                  <div className="mt-2 pl-4">
                    <Label className="text-xs text-muted-foreground/70">
                      {title}
                    </Label>
                    <Input
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
                      className="mt-1 border-border/30 bg-secondary/50 text-sm placeholder:text-muted-foreground/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-muted-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleReveal}
            disabled={selectedLevel === null}
            className="bg-amber text-primary-foreground hover:bg-amber/90 disabled:opacity-30"
          >
            Reveal Level {selectedLevel ?? "..."}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
