import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { ALLOWED_REACTIONS } from "@/types";

async function getParticipant(roomCode: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(`session_${roomCode}`)?.value;
  if (!sessionToken) return null;
  return prisma.participant.findUnique({ where: { sessionToken } });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await params;
    const body = await request.json();
    const { emoji, roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_REACTIONS.includes(emoji)) {
      return NextResponse.json(
        { error: "Invalid reaction emoji" },
        { status: 400 }
      );
    }

    const participant = await getParticipant(roomCode);
    if (!participant) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify message exists and belongs to the same room
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: 404 }
      );
    }

    if (participant.roomId !== message.roomId) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    // Toggle: check if reaction exists
    const existing = await prisma.reaction.findUnique({
      where: {
        messageId_participantId_emoji: {
          messageId,
          participantId: participant.id,
          emoji,
        },
      },
    });

    let active: boolean;

    if (existing) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      active = false;
    } else {
      await prisma.reaction.create({
        data: {
          messageId,
          participantId: participant.id,
          emoji,
        },
      });
      active = true;
    }

    // Get updated count for this emoji on this message
    const count = await prisma.reaction.count({
      where: { messageId, emoji },
    });

    return NextResponse.json({ toggled: true, active, count });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}
