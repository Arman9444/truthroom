import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

async function getParticipant(roomCode: string) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(`session_${roomCode}`)?.value;
  if (!sessionToken) return null;
  return prisma.participant.findUnique({ where: { sessionToken } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomCode, text } = body;

    if (!roomCode || !text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Room code and text are required" },
        { status: 400 }
      );
    }

    // Look up participant from session
    const participant = await getParticipant(roomCode);
    if (!participant) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Verify participant belongs to room
    const room = await prisma.room.findUnique({
      where: { code: roomCode },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    if (participant.roomId !== room.id) {
      return NextResponse.json(
        { error: "Not a member of this room" },
        { status: 403 }
      );
    }

    if (!participant.isActive) {
      return NextResponse.json(
        { error: "Participant is no longer active" },
        { status: 403 }
      );
    }

    // Check slow mode
    if (room.slowMode > 0) {
      const lastMessage = await prisma.message.findFirst({
        where: {
          participantId: participant.id,
          roomId: room.id,
          isSystemMsg: false,
        },
        orderBy: { createdAt: "desc" },
      });

      if (lastMessage) {
        const elapsed = Date.now() - lastMessage.createdAt.getTime();
        const cooldown = room.slowMode * 1000;
        if (elapsed < cooldown) {
          const remaining = Math.ceil((cooldown - elapsed) / 1000);
          return NextResponse.json(
            { error: `Slow mode active. Wait ${remaining} seconds.` },
            { status: 429 }
          );
        }
      }
    }

    // Create message with snapshot of current identity state
    const message = await prisma.message.create({
      data: {
        roomId: room.id,
        participantId: participant.id,
        text: text.trim(),
        postedAsAlias: participant.alias,
        postedAsMask: participant.mask,
        revealLevel: participant.revealLevel,
        revealName:
          participant.revealLevel >= 3
            ? participant.revealFull
            : participant.revealLevel >= 2
              ? participant.revealPartial
              : participant.revealLevel >= 1
                ? participant.revealHint
                : null,
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
