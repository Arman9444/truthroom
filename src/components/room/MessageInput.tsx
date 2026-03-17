"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
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
    <div className="border-t border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Typing indicator */}
      {typingCount > 0 && (
        <div className="px-4 py-1">
          <p className="text-[11px] italic text-muted-foreground/50">
            {typingCount === 1
              ? "Someone is typing..."
              : `${typingCount} people are typing...`}
          </p>
        </div>
      )}

      {/* Targeting warning */}
      {showTargetingWarning && (
        <div className="mx-4 mt-2 rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
          <p className="text-xs text-yellow-400/90">
            This sounds like it might be directed at a specific person. Anonymous
            spaces work best when sharing your own experience. Send anyway?
          </p>
          <div className="mt-1.5 flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-yellow-400/70 hover:text-yellow-400"
              onClick={handleSend}
            >
              Send anyway
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs text-muted-foreground/50"
              onClick={() => {
                setShowTargetingWarning(false);
              }}
            >
              Edit message
            </Button>
          </div>
        </div>
      )}

      {/* Slow mode countdown */}
      {cooldownRemaining > 0 && (
        <div className="px-4 py-1">
          <p className="text-[11px] text-muted-foreground/50">
            Slow mode: wait{" "}
            <span className="font-mono text-amber/70">{cooldownRemaining}s</span>
          </p>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || cooldownRemaining > 0}
          rows={1}
          className={cn(
            "max-h-32 min-h-[40px] flex-1 resize-none border-border/30 bg-secondary/50 text-sm",
            "placeholder:text-muted-foreground/30 focus-visible:ring-amber/30"
          )}
        />
        <Button
          onClick={handleSend}
          disabled={isSendDisabled}
          size="sm"
          className="h-10 bg-amber px-4 text-primary-foreground hover:bg-amber/90 disabled:opacity-30"
        >
          Send
        </Button>
      </div>
    </div>
  );
}
