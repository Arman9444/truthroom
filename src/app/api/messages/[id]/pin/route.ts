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
    const { id: messageId } = await params;
    const body = await request.json();
    const { roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
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

    // Toggle pin
    const updated = await prisma.message.update({
      where: { id: messageId },
      data: { isPinned: !message.isPinned },
    });

    return NextResponse.json({ pinned: updated.isPinned });
  } catch (error) {
    console.error("Error toggling pin:", error);
    return NextResponse.json(
      { error: "Failed to toggle pin" },
      { status: 500 }
    );
  }
}
