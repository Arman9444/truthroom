"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Shield } from "lucide-react";

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
          isEphemeral: ephemeral,
          allowReveal,
          allowReplies,
          slowMode: slowModeSeconds,
          contentWarning: contentWarning.trim() || null,
          expiresIn: expiry === "none" ? null : expiry,
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

  const inputClasses =
    "w-full bg-[#0a0a0f] border border-white/10 focus:border-[#d4a847] focus:outline-none transition-colors rounded-lg px-4 py-2.5 text-[#e8e4df] placeholder:text-[#6b6e7a]/40";
  const labelClasses =
    "block text-xs uppercase tracking-wider text-[#6b6e7a] font-medium mb-1.5";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#d4a847]/5 blur-[120px]" />
      </div>

      {/* Header */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#e8e4df]">
          Create a Room
        </h1>
        <p className="text-[#6b6e7a] text-sm mt-2">
          Set up a space for honest conversation.
        </p>
      </div>

      {/* Form card */}
      <div className="relative z-10 w-full max-w-xl glass rounded-2xl p-8 sm:p-10">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Section 1: Room Details */}
          <div className="space-y-5">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Room Name <span className="text-[#c4604a]">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Team Retrospective"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={80}
                className={inputClasses}
              />
            </div>

            <div>
              <label htmlFor="topic" className={labelClasses}>
                Topic / Prompt
              </label>
              <textarea
                id="topic"
                placeholder="What should the room discuss? (optional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                maxLength={500}
                className={`${inputClasses} resize-none`}
              />
            </div>
          </div>

          {/* Section 2: Room Settings */}
          <div className="border-t border-white/5 pt-6 mt-6">
            <p className="text-xs uppercase tracking-wider text-[#6b6e7a]/60 mb-5">
              Room Settings
            </p>

            <div className="space-y-5">
              <div>
                <label htmlFor="maxParticipants" className={labelClasses}>
                  Max Participants
                </label>
                <input
                  id="maxParticipants"
                  type="number"
                  min={2}
                  max={100}
                  value={maxParticipants}
                  onChange={(e) => setMaxParticipants(Number(e.target.value))}
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="slowMode" className={labelClasses}>
                  Slow Mode (seconds)
                </label>
                <input
                  id="slowMode"
                  type="number"
                  min={0}
                  max={300}
                  value={slowModeSeconds}
                  onChange={(e) => setSlowModeSeconds(Number(e.target.value))}
                  className={inputClasses}
                />
                <p className="text-xs text-[#6b6e7a]/60 mt-1.5">
                  0 = no slow mode. Otherwise, seconds between messages per
                  user.
                </p>
              </div>

              <div>
                <label className={labelClasses}>Room Expiry</label>
                <Select
                  value={expiry}
                  onValueChange={(v) => v && setExpiry(v)}
                >
                  <SelectTrigger className="w-full bg-[#0a0a0f] border border-white/10 focus:border-[#d4a847] transition-colors rounded-lg">
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
            </div>
          </div>

          {/* Section 3: Safety & Privacy */}
          <div className="border-t border-white/5 pt-6 mt-6">
            <p className="text-xs uppercase tracking-wider text-[#6b6e7a]/60 mb-5">
              Safety &amp; Privacy
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-[#e8e4df]">Ephemeral Room</p>
                  <p className="text-xs text-[#6b6e7a]">
                    Messages are deleted when the room closes
                  </p>
                </div>
                <Switch
                  checked={ephemeral}
                  onCheckedChange={setEphemeral}
                  className="data-[state=checked]:bg-[#d4a847]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-[#e8e4df]">Allow Reveal</p>
                  <p className="text-xs text-[#6b6e7a]">
                    Participants can choose to unmask their identity
                  </p>
                </div>
                <Switch
                  checked={allowReveal}
                  onCheckedChange={setAllowReveal}
                  className="data-[state=checked]:bg-[#d4a847]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-[#e8e4df]">Allow Replies</p>
                  <p className="text-xs text-[#6b6e7a]">
                    Enable threaded replies to messages
                  </p>
                </div>
                <Switch
                  checked={allowReplies}
                  onCheckedChange={setAllowReplies}
                  className="data-[state=checked]:bg-[#d4a847]"
                />
              </div>

              <div className="pt-1">
                <label htmlFor="cw" className={labelClasses}>
                  Content Warning
                </label>
                <input
                  id="cw"
                  type="text"
                  placeholder="e.g. Sensitive topics discussed (optional)"
                  value={contentWarning}
                  onChange={(e) => setContentWarning(e.target.value)}
                  maxLength={200}
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-[#c4604a]">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-[#d4a847] text-[#0a0a0f] font-semibold rounded-lg py-3 text-base hover:bg-[#d4a847]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>

          {/* Privacy note */}
          <p className="flex items-center justify-center gap-1.5 text-xs text-[#6b6e7a]/60">
            <Shield className="h-3.5 w-3.5" />
            Your identity is never stored or shared.
          </p>
        </form>
      </div>
    </main>
  );
}
