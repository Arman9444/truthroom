import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateRoomCode } from "@/lib/identity";
import { cookies } from "next/headers";
import bcryptjs from "bcryptjs";
import crypto from "node:crypto";
import type { RoomSettings } from "@/types";

export async function POST(request: Request) {
  try {
    const body: RoomSettings = await request.json();

    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    // Generate unique room code with collision retry
    let code: string;
    let attempts = 0;
    do {
      code = generateRoomCode();
      const existing = await prisma.room.findUnique({ where: { code } });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Failed to generate unique room code" },
        { status: 500 }
      );
    }

    // Generate and hash creator token
    const creatorToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcryptjs.hash(creatorToken, 10);

    // Calculate expiration
    let expiresAt: Date | null = null;
    if (body.expiresIn) {
      const now = new Date();
      switch (body.expiresIn) {
        case "1h":
          expiresAt = new Date(now.getTime() + 60 * 60 * 1000);
          break;
        case "24h":
          expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "7d":
          expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        code,
        name: body.name.trim(),
        topic: body.topic?.trim() || null,
        maxParticipants: body.maxParticipants,
        allowReveal: body.allowReveal,
        allowReplies: body.allowReplies,
        isEphemeral: body.isEphemeral,
        slowMode: body.slowMode,
        contentWarning: body.contentWarning?.trim() || null,
        flagThreshold: body.flagThreshold,
        requireAgreement: body.requireAgreement,
        expiresAt,
        creatorToken: hashedToken,
      },
    });

    // Set creator token cookie
    const cookieStore = await cookies();
    cookieStore.set(`creator_${code}`, creatorToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: expiresAt
        ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
        : 60 * 60 * 24 * 30, // 30 days default
    });

    return NextResponse.json({ code: room.code, creatorToken }, { status: 201 });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
