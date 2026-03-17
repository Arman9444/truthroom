"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import type { RoomInfo } from "@/types";

export default function ManageRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [topic, setTopic] = useState("");
  const [slowMode, setSlowMode] = useState(0);
  const [flagThreshold, setFlagThreshold] = useState(3);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    fetchRoom();
  }, [code]);

  async function fetchRoom() {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) throw new Error("Room not found");
      const data = await res.json();
      setRoom(data);
      setTopic(data.topic || "");
      setSlowMode(data.slowMode);
      setFlagThreshold(data.flagThreshold);
      setIsActive(data.isActive);
    } catch {
      setError("Could not load room. Are you the room creator?");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/rooms/${code}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, slowMode, flagThreshold, isActive }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      const updated = await res.json();
      setRoom(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleCloseRoom() {
    if (!confirm("Are you sure you want to close this room? This cannot be undone.")) return;
    setSaving(true);
    try {
      await fetch(`/api/rooms/${code}/manage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      router.push("/");
    } catch {
      setError("Failed to close room");
      setSaving(false);
    }
  }

  async function handleExport() {
    try {
      const res = await fetch(`/api/rooms/${code}/manage`);
      if (!res.ok) throw new Error("Failed to export");
      // For now, just fetch messages and create a text blob
      const messagesRes = await fetch(`/api/rooms/${code}/messages`);
      if (!messagesRes.ok) throw new Error("Failed to fetch messages");
      const messages = await messagesRes.json();
      const transcript = messages
        .map((m: { postedAsMask: string; postedAsAlias: string; createdAt: string; text: string; isSystemMsg: boolean }) =>
          m.isSystemMsg
            ? `[${new Date(m.createdAt).toLocaleString()}] ${m.text}`
            : `[${new Date(m.createdAt).toLocaleString()}] ${m.postedAsMask} ${m.postedAsAlias}: ${m.text}`
        )
        .join("\n");
      const blob = new Blob([transcript], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `candor-${code}-transcript.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Failed to export transcript");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading room settings...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">{error || "Room not found"}</p>
            <Button variant="outline" className="mt-4 w-full" onClick={() => router.push("/")}>
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Manage Room</h1>
            <p className="text-muted-foreground">
              {room.name} &middot; <span className="font-mono text-sm">{code}</span>
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push(`/room/${code}`)}>
            Back to Room
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Room Settings</CardTitle>
            <CardDescription>Adjust room configuration. You cannot see who is behind any alias.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic / Prompt</Label>
              <Textarea
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="What should participants discuss?"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slowMode">Slow Mode (seconds between messages, 0 = off)</Label>
              <Input
                id="slowMode"
                type="number"
                min={0}
                max={300}
                value={slowMode}
                onChange={(e) => setSlowMode(parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="flagThreshold">Flag Threshold (flags to auto-hide)</Label>
              <Input
                id="flagThreshold"
                type="number"
                min={1}
                max={20}
                value={flagThreshold}
                onChange={(e) => setFlagThreshold(parseInt(e.target.value) || 3)}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Room Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Participants</p>
                <p className="text-2xl font-bold">{room.participantCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">{room.isActive ? "Active" : "Closed"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full" onClick={handleExport}>
              Export Anonymized Transcript
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleCloseRoom} disabled={saving}>
              Close Room Permanently
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
