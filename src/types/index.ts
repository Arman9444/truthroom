export interface RoomSettings {
  name: string;
  topic?: string;
  maxParticipants: number;
  allowReveal: boolean;
  allowReplies: boolean;
  isEphemeral: boolean;
  slowMode: number;
  contentWarning?: string;
  flagThreshold: number;
  requireAgreement: boolean;
  expiresIn?: "1h" | "24h" | "7d" | null;
}

export interface RoomInfo {
  id: string;
  code: string;
  name: string;
  topic: string | null;
  isActive: boolean;
  maxParticipants: number;
  allowReveal: boolean;
  allowReplies: boolean;
  isEphemeral: boolean;
  slowMode: number;
  contentWarning: string | null;
  flagThreshold: number;
  requireAgreement: boolean;
  participantCount: number;
}

export interface ParticipantInfo {
  id: string;
  alias: string;
  mask: string;
  isActive: boolean;
  revealLevel: number;
  revealHint?: string | null;
  revealPartial?: string | null;
  revealFull?: string | null;
}

export interface MessageInfo {
  id: string;
  text: string;
  createdAt: string;
  postedAsAlias: string;
  postedAsMask: string;
  revealLevel: number;
  revealName: string | null;
  isHidden: boolean;
  isPinned: boolean;
  isSystemMsg: boolean;
  participantId: string;
  flags: number;
  reactions: Record<string, number>;
  userReactions: string[];
  userFlagged: boolean;
}

export type FlagReason = "harmful" | "targeting" | "spam" | "off-topic";

export type RevealLevel = 0 | 1 | 2 | 3;

export type AllowedReaction = "💯" | "🤝" | "❤️" | "💪" | "👀" | "🙏";

export const ALLOWED_REACTIONS: AllowedReaction[] = ["💯", "🤝", "❤️", "💪", "👀", "🙏"];

export const FLAG_REASONS: { value: FlagReason; label: string }[] = [
  { value: "harmful", label: "Harmful content" },
  { value: "targeting", label: "Targeting someone" },
  { value: "spam", label: "Spam" },
  { value: "off-topic", label: "Off-topic" },
];

// Socket event types
export interface ServerToClientEvents {
  "message:new": (message: MessageInfo) => void;
  "message:hidden": (messageId: string) => void;
  "message:pinned": (messageId: string, isPinned: boolean) => void;
  "reaction:toggle": (messageId: string, emoji: string, count: number) => void;
  "participant:join": (participant: ParticipantInfo) => void;
  "participant:leave": (participantId: string) => void;
  "participant:reveal": (participantId: string, level: number, name: string | null) => void;
  "room:settings_changed": (settings: Partial<RoomInfo>) => void;
  "room:closing": (minutesLeft: number) => void;
  "typing:update": (count: number) => void;
}

export interface ClientToServerEvents {
  "room:join": (roomCode: string, sessionToken: string) => void;
  "room:leave": (roomCode: string) => void;
  "message:send": (roomCode: string, text: string) => void;
  "typing:start": (roomCode: string) => void;
  "typing:stop": (roomCode: string) => void;
}
