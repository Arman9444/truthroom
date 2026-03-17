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
      include: {
        _count: {
          select: { participants: { where: { isActive: true } } },
        },
      },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: room.id,
      code: room.code,
      name: room.name,
      topic: room.topic,
      isActive: room.isActive,
      maxParticipants: room.maxParticipants,
      allowReveal: room.allowReveal,
      allowReplies: room.allowReplies,
      isEphemeral: room.isEphemeral,
      slowMode: room.slowMode,
      contentWarning: room.contentWarning,
      flagThreshold: room.flagThreshold,
      requireAgreement: room.requireAgreement,
      participantCount: room._count.participants,
    });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}
