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

    const participants = await prisma.participant.findMany({
      where: { roomId: room.id, isActive: true },
      select: {
        id: true,
        alias: true,
        mask: true,
        isActive: true,
        revealLevel: true,
        revealHint: true,
        revealPartial: true,
        revealFull: true,
      },
      orderBy: { joinedAt: "asc" },
    });

    return NextResponse.json(participants);
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
