import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateIdentity } from "@/lib/identity";
import { cookies } from "next/headers";
import crypto from "node:crypto";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cookieStore = await cookies();

    // Find the room
    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        participants: { where: { isActive: true }, select: { alias: true } },
        _count: { select: { participants: { where: { isActive: true } } } },
      },
    });

    if (!room || !room.isActive) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      );
    }

    // Check for existing session
    const existingToken = cookieStore.get(`session_${code}`)?.value;
    if (existingToken) {
      const existing = await prisma.participant.findUnique({
        where: { sessionToken: existingToken },
      });
      if (existing && existing.roomId === room.id && existing.isActive) {
        return NextResponse.json({
          id: existing.id,
          alias: existing.alias,
          mask: existing.mask,
        });
      }
    }

    // Check if room is full
    if (room._count.participants >= room.maxParticipants) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 403 }
      );
    }

    // Generate identity
    const existingAliases = room.participants.map((p) => p.alias);
    const { alias, mask } = generateIdentity(existingAliases);

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");

    // Create participant
    const participant = await prisma.participant.create({
      data: {
        roomId: room.id,
        sessionToken,
        alias,
        mask,
      },
    });

    // Set session cookie
    cookieStore.set(`session_${code}`, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: room.expiresAt
        ? Math.floor((room.expiresAt.getTime() - Date.now()) / 1000)
        : 60 * 60 * 24 * 30,
    });

    return NextResponse.json(
      { id: participant.id, alias: participant.alias, mask: participant.mask },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
