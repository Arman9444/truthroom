"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function JoinRoomPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6);
    setCode(value);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${code}`);

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

      router.push(`/room/${code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-amber/5 blur-[100px]" />
      </div>

      <Card className="relative z-10 w-full max-w-sm border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl glow-amber-subtle">
            Join a Room
          </CardTitle>
          <CardDescription>
            Enter the 6-character room code to step inside.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                ref={inputRef}
                value={code}
                onChange={handleCodeChange}
                placeholder="ABCDEF"
                maxLength={6}
                autoFocus
                className="text-center text-2xl font-mono tracking-[0.4em] h-14 uppercase placeholder:tracking-[0.4em] placeholder:text-muted-foreground/40"
                aria-label="Room code"
              />
              <p className="text-xs text-muted-foreground text-center">
                {code.length}/6 characters
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full text-base"
              size="lg"
              disabled={loading || code.length !== 6}
            >
              {loading ? "Joining..." : "Join Room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
