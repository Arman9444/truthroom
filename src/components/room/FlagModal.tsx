"use client";

import { useState } from "react";
import { FLAG_REASONS } from "@/types";

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

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setSelectedReason("");
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={handleBackdropClick}
    >
      <div className="glass rounded-2xl p-6 sm:p-8 max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold text-[#e8e4df] mb-1">
          Flag Message
        </h2>
        <p className="text-sm text-[#6b6e7a] mb-5">
          Why are you flagging this message? If enough people flag it, the
          message will be hidden.
        </p>

        <div className="space-y-2">
          {FLAG_REASONS.map((reason) => (
            <button
              key={reason.value}
              onClick={() => setSelectedReason(reason.value)}
              className={
                selectedReason === reason.value
                  ? "w-full text-left px-4 py-3 rounded-lg border border-[#c4604a]/40 bg-[#c4604a]/10 text-sm text-[#e8e4df] transition-colors"
                  : "w-full text-left px-4 py-3 rounded-lg border border-white/[0.06] text-sm text-[#e8e4df] transition-colors hover:bg-white/[0.03]"
              }
            >
              {reason.label}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={() => {
              setSelectedReason("");
              onClose();
            }}
            className="text-[#6b6e7a] hover:text-[#e8e4df] transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="bg-[#c4604a] text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-40 transition-colors"
          >
            Submit Flag
          </button>
        </div>
      </div>
    </div>
  );
}
