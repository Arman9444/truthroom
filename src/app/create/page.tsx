"use client";

import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CreateRoomPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(20);
  const [ephemeral, setEphemeral] = useState(false);
  const [allowReveal, setAllowReveal] = useState(true);
  const [allowReplies, setAllowReplies] = useState(false);
  const [slowModeSeconds, setSlowModeSeconds] = useState(0);
  const [contentWarning, setContentWarning] = useState("");
  const [expiry, setExpiry] = useState<string>("24h");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          topic: topic.trim() || null,
          maxParticipants,
          ephemeral,
          allowReveal,
          allowReplies,
          slowModeSeconds,
          contentWarning: contentWarning.trim() || null,
          expiry,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to create room");
      }

      const data = await res.json();

      // Store creator token in cookie
      if (data.creatorToken) {
        document.cookie = `creator_token_${data.code}=${data.creatorToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      }

      router.push(`/room/${data.code}`);
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

      <Card className="relative z-10 w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl glow-amber-subtle">
            Create a Room
          </CardTitle>
          <CardDescription>
            Set up a space for anonymous, honest conversation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Room name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Room Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Team Retrospective"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
              />
            </div>

            {/* Topic */}
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Prompt</Label>
              <Textarea
                id="topic"
                placeholder="What should the room discuss? (optional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                maxLength={500}
              />
            </div>

            {/* Max participants */}
            <div className="space-y-2">
              <Label htmlFor="maxParticipants">Max Participants</Label>
              <Input
                id="maxParticipants"
                type="number"
                min={2}
                max={100}
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
              />
            </div>

            {/* Toggles */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ephemeral Room</Label>
                  <p className="text-xs text-muted-foreground">
                    Messages are deleted when the room closes
                  </p>
                </div>
                <Switch
                  checked={ephemeral}
                  onCheckedChange={setEphemeral}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Reveal</Label>
                  <p className="text-xs text-muted-foreground">
                    Participants can choose to unmask their identity
                  </p>
                </div>
                <Switch
                  checked={allowReveal}
                  onCheckedChange={setAllowReveal}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Replies</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable threaded replies to messages
                  </p>
                </div>
                <Switch
                  checked={allowReplies}
                  onCheckedChange={setAllowReplies}
                />
              </div>
            </div>

            {/* Slow mode */}
            <div className="space-y-2">
              <Label htmlFor="slowMode">Slow Mode (seconds)</Label>
              <Input
                id="slowMode"
                type="number"
                min={0}
                max={300}
                value={slowModeSeconds}
                onChange={(e) => setSlowModeSeconds(Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">
                0 = no slow mode. Otherwise, seconds between messages per user.
              </p>
            </div>

            {/* Content warning */}
            <div className="space-y-2">
              <Label htmlFor="cw">Content Warning</Label>
              <Input
                id="cw"
                placeholder="e.g. Sensitive topics discussed (optional)"
                value={contentWarning}
                onChange={(e) => setContentWarning(e.target.value)}
                maxLength={200}
              />
            </div>

            {/* Expiry */}
            <div className="space-y-2">
              <Label>Room Expiry</Label>
              <Select value={expiry} onValueChange={(v) => v && setExpiry(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="none">No expiry</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {/* Submit */}
            <Button
              type="submit"
              className="w-full text-base"
              size="lg"
              disabled={loading || !name.trim()}
            >
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
