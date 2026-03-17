"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send } from "lucide-react";
import { detectTargeting, getRandomPlaceholder } from "@/lib/moderation";
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSend: (text: string) => void;
  slowMode: number;
  typingCount: number;
  onTypingStart: () => void;
  onTypingStop: () => void;
  disabled?: boolean;
}

export function MessageInput({
  onSend,
  slowMode,
  typingCount,
  onTypingStart,
  onTypingStop,
  disabled,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const [placeholder] = useState(() => getRandomPlaceholder());
  const [showTargetingWarning, setShowTargetingWarning] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isSendDisabled = disabled || text.trim().length === 0 || cooldownRemaining > 0;

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [text]);

  const startCooldown = useCallback(() => {
    if (slowMode <= 0) return;
    setCooldownRemaining(slowMode);
    cooldownIntervalRef.current = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [slowMode]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isSendDisabled) return;

    // Check targeting
    if (detectTargeting(trimmed) && !showTargetingWarning) {
      setShowTargetingWarning(true);
      return;
    }

    onSend(trimmed);
    setText("");
    setShowTargetingWarning(false);
    startCooldown();

    // Stop typing indicator
    if (isTypingRef.current) {
      isTypingRef.current = false;
      onTypingStop();
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  }, [text, isSendDisabled, showTargetingWarning, onSend, startCooldown, onTypingStop]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);

    // Reset targeting warning when text changes
    if (showTargetingWarning) {
      setShowTargetingWarning(false);
    }

    // Typing indicator management
    if (value.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTypingStart();
      }
      // Reset the stop-typing timer
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onTypingStop();
      }, 3000);
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTypingStop();
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    }
  };

  return (
    <div className="border-t border-white/[0.06] bg-[#14161d] px-4 sm:px-6 py-3">
      {/* Anti-targeting warning */}
      {showTargetingWarning && (
        <div className="bg-[#c4604a]/10 border border-[#c4604a]/20 rounded-lg px-4 py-3 mb-3">
          <p className="text-sm text-[#c4604a]">
            This sounds like it might be directed at a specific person. Anonymous
            spaces work best when sharing your own experience. Send anyway?
          </p>
          <div className="mt-2 flex gap-3">
            <button
              onClick={handleSend}
              className="text-xs font-medium text-[#c4604a] hover:text-[#c4604a]/80 cursor-pointer"
            >
              Send anyway
            </button>
            <button
              onClick={() => setShowTargetingWarning(false)}
              className="text-xs font-medium text-[#6b6e7a] hover:text-[#e8e4df] cursor-pointer"
            >
              Edit message
            </button>
          </div>
        </div>
      )}

      {/* Slow mode countdown */}
      {cooldownRemaining > 0 && (
        <p className="text-xs text-[#6b8aab] mb-2">
          Slow mode: wait{" "}
          <span className="font-mono text-[#d4a847]/70">{cooldownRemaining}s</span>
        </p>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || cooldownRemaining > 0}
          rows={1}
          className="flex-1 bg-[#0a0a0f] border border-white/10 focus:border-[#d4a847]/50 rounded-xl px-4 py-3 text-sm text-[#e8e4df] placeholder:text-[#6b6e7a]/40 resize-none outline-none transition-colors min-h-[44px] max-h-[120px]"
        />
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          className={cn(
            "w-10 h-10 rounded-full bg-[#d4a847] text-[#0a0a0f] flex items-center justify-center transition-all hover:bg-[#d4a847]/90 disabled:opacity-30 cursor-pointer",
            text.trim().length > 0
              ? "opacity-100 scale-100"
              : "opacity-0 scale-75 pointer-events-none"
          )}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Typing indicator */}
      {typingCount > 0 && (
        <p className="text-xs text-[#6b6e7a]/50 italic mt-1">
          {typingCount === 1
            ? "Someone is typing..."
            : `${typingCount} people are typing...`}
        </p>
      )}
    </div>
  );
}
