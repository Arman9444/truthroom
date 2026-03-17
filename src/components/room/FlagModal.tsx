"use client";

import { useState } from "react";
import { FLAG_REASONS } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function FlagModal({ isOpen, onClose, onSubmit }: FlagModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit(selectedReason);
    setSelectedReason("");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedReason("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="border-border/30 bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Flag Message</DialogTitle>
          <DialogDescription className="text-muted-foreground/70">
            Why are you flagging this message? If enough people flag it, the
            message will be hidden.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-4">
          {FLAG_REASONS.map((reason) => (
            <label
              key={reason.value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3 transition-colors",
                selectedReason === reason.value
                  ? "border-amber/40 bg-amber/10"
                  : "border-border/30 bg-secondary/30 hover:bg-secondary/50"
              )}
            >
              <input
                type="radio"
                name="flag-reason"
                value={reason.value}
                checked={selectedReason === reason.value}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="sr-only"
              />
              <div
                className={cn(
                  "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
                  selectedReason === reason.value
                    ? "border-amber bg-amber"
                    : "border-muted-foreground/30"
                )}
              >
                {selectedReason === reason.value && (
                  <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </div>
              <span className="text-sm text-foreground/80">{reason.label}</span>
            </label>
          ))}
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
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-30"
          >
            Submit Flag
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
