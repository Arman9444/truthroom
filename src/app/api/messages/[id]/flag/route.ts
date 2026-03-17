import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import {
  adjustTrustForFlagReceived,
  adjustTrustForValidatedFlag,
} from "@/lib/trust";
import type { FlagReason } from "@/types";

const VALID_REASONS: FlagReason[] = ["harmful", "targeting", "spam", "off-topic"];

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
    const { reason, roomCode } = body;

    if (!roomCode) {
      return NextResponse.json(
        { error: "Room code is required" },
        { status: 400 }
      );
    }

    if (!VALID_REASONS.includes(reason)) {
      return NextResponse.json(
        { error: "Invalid flag reason" },
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
      include: { room: true },
    });

    if (!message || message.room.code !== roomCode) {
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

    // Create flag (unique constraint prevents double-flagging)
    try {
      await prisma.flag.create({
        data: {
          messageId,
          flaggedBy: participant.id,
          reason,
        },
      });
    } catch (e: unknown) {
      if (
        e &&
        typeof e === "object" &&
        "code" in e &&
        (e as { code: string }).code === "P2002"
      ) {
        return NextResponse.json(
          { error: "Already flagged this message" },
          { status: 409 }
        );
      }
      throw e;
    }

    // Update flagged participant's trust score
    const flaggedParticipant = await prisma.participant.findUnique({
      where: { id: message.participantId },
    });

    if (flaggedParticipant) {
      await prisma.participant.update({
        where: { id: flaggedParticipant.id },
        data: {
          trustScore: adjustTrustForFlagReceived(flaggedParticipant.trustScore),
          flagsReceived: { increment: 1 },
        },
      });
    }

    // Update flagger's flagsGiven
    await prisma.participant.update({
      where: { id: participant.id },
      data: { flagsGiven: { increment: 1 } },
    });

    // Check if flags meet threshold to hide message
    const flagCount = await prisma.flag.count({
      where: { messageId },
    });

    if (flagCount >= message.room.flagThreshold && !message.isHidden) {
      await prisma.message.update({
        where: { id: messageId },
        data: { isHidden: true },
      });

      // Reward all flaggers with validated flag bonus
      const flags = await prisma.flag.findMany({
        where: { messageId },
        include: { flagger: true },
      });

      for (const flag of flags) {
        await prisma.participant.update({
          where: { id: flag.flaggedBy },
          data: {
            trustScore: adjustTrustForValidatedFlag(flag.flagger.trustScore),
          },
        });
      }
    }

    return NextResponse.json({ flagged: true });
  } catch (error) {
    console.error("Error flagging message:", error);
    return NextResponse.json(
      { error: "Failed to flag message" },
      { status: 500 }
    );
  }
}
