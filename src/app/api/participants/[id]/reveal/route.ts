import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

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
    const { id: participantId } = await params;
    const body = await request.json();
    const { level, hint, partial, full, roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    if (level === undefined || level < 0 || level > 3) {
      return NextResponse.json(
        { error: "Invalid reveal level (must be 0-3)" },
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

    // Verify the participant ID matches the session user
    if (participant.id !== participantId) {
      return NextResponse.json(
        { error: "Can only reveal your own identity" },
        { status: 403 }
      );
    }

    // Check room allows reveal
    const room = await prisma.room.findUnique({
      where: { id: participant.roomId },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    if (!room.allowReveal) {
      return NextResponse.json(
        { error: "This room does not allow reveals" },
        { status: 403 }
      );
    }

    // Ensure level is higher than current (one-way door)
    if (level <= participant.revealLevel) {
      return NextResponse.json(
        { error: "Can only increase reveal level" },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = { revealLevel: level };
    if (hint !== undefined) updateData.revealHint = hint;
    if (partial !== undefined) updateData.revealPartial = partial;
    if (full !== undefined) updateData.revealFull = full;

    const updated = await prisma.participant.update({
      where: { id: participantId },
      data: updateData,
    });

    // Determine reveal display name
    const revealName =
      level >= 3
        ? updated.revealFull
        : level >= 2
          ? updated.revealPartial
          : level >= 1
            ? updated.revealHint
            : null;

    // Create system message
    await prisma.message.create({
      data: {
        roomId: room.id,
        participantId: participant.id,
        text: `\uD83C\uDFAD ${participant.alias} has chosen to reveal: ${revealName ?? "a hint"}`,
        isSystemMsg: true,
        postedAsAlias: participant.alias,
        postedAsMask: participant.mask,
        revealLevel: level,
        revealName: revealName ?? null,
      },
    });

    return NextResponse.json({
      id: updated.id,
      alias: updated.alias,
      mask: updated.mask,
      isActive: updated.isActive,
      revealLevel: updated.revealLevel,
      revealHint: updated.revealHint,
      revealPartial: updated.revealPartial,
      revealFull: updated.revealFull,
    });
  } catch (error) {
    console.error("Error revealing identity:", error);
    return NextResponse.json(
      { error: "Failed to reveal identity" },
      { status: 500 }
    );
  }
}
