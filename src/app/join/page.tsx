"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const fullCode = code.join("");

  const handleChange = useCallback(
    (index: number, value: string) => {
      const char = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(-1);

      setCode((prev) => {
        const next = [...prev];
        next[index] = char;
        return next;
      });
      setError("");

      if (char && index < 5) {
        inputRefs[index + 1].current?.focus();
      }
    },
    [inputRefs],
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Backspace" && !code[index] && index > 0) {
        inputRefs[index - 1].current?.focus();
      }
    },
    [code, inputRefs],
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData
        .getData("text")
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 6);

      if (pasted.length > 0) {
        const next = Array(6).fill("");
        for (let i = 0; i < pasted.length; i++) {
          next[i] = pasted[i];
        }
        setCode(next);
        setError("");

        const focusIndex = Math.min(pasted.length, 5);
        inputRefs[focusIndex].current?.focus();
      }
    },
    [inputRefs],
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (fullCode.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${fullCode}`);

      if (res.status === 404) {
        setError("Room not found. Check the code and try again.");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Unable to join room");
      }

      const data = await res.json();

      if (data.isFull) {
        setError("This room is full.");
        setLoading(false);
        return;
      }

      router.push(`/room/${fullCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  const boxClasses =
    "w-12 h-14 sm:w-14 sm:h-16 text-center font-mono text-xl sm:text-2xl uppercase bg-[#0a0a0f] border border-white/10 rounded-lg focus:border-[#d4a847] focus:outline-none transition-colors text-[#e8e4df]";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#d4a847]/5 blur-[120px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md glass rounded-2xl p-8 sm:p-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-[#e8e4df]">Join a Room</h1>
          <p className="text-[#6b6e7a] text-sm mt-2">
            Enter the 6-character room code to join.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP-style code inputs */}
          <div className="flex justify-center gap-2 sm:gap-3">
            {code.map((char, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type="text"
                inputMode="text"
                maxLength={1}
                pattern="[A-Za-z0-9]"
                value={char}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                autoFocus={i === 0}
                aria-label={`Character ${i + 1}`}
                className={boxClasses}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#c4604a] text-center">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || fullCode.length !== 6}
            className="w-full bg-[#d4a847] text-[#0a0a0f] font-semibold rounded-lg py-3 text-base hover:bg-[#d4a847]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Joining..." : "Join Room"}
          </button>
        </form>
      </div>

      {/* Help text */}
      <p className="text-xs text-[#6b6e7a]/60 mt-4 text-center relative z-10">
        Don&apos;t have a code? Ask the room creator to share one.
      </p>
    </main>
  );
}
