import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await prisma.room.findUnique({
      where: { code },
      select: { id: true },
    });

    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { roomId: room.id },
      orderBy: { createdAt: "asc" },
      include: {
        flags: { select: { id: true } },
        reactions: { select: { emoji: true, participantId: true } },
      },
    });

    const formatted = messages.map((m) => {
      const reactionCounts: Record<string, number> = {};
      for (const r of m.reactions) {
        reactionCounts[r.emoji] = (reactionCounts[r.emoji] || 0) + 1;
      }

      return {
        id: m.id,
        text: m.text,
        createdAt: m.createdAt.toISOString(),
        postedAsAlias: m.postedAsAlias,
        postedAsMask: m.postedAsMask,
        revealLevel: m.revealLevel,
        revealName: m.revealName,
        isHidden: m.isHidden,
        isPinned: m.isPinned,
        isSystemMsg: m.isSystemMsg,
        participantId: m.participantId,
        flags: m.flags.length,
        reactions: reactionCounts,
        userReactions: [],
        userFlagged: false,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
