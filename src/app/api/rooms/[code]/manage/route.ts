import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import bcryptjs from "bcryptjs";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const cookieStore = await cookies();

    // Verify creator token
    const creatorToken = cookieStore.get(`creator_${code}`)?.value;
    if (!creatorToken) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    const isValid = await bcryptjs.compare(creatorToken, room.creatorToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Update allowed fields only
    const body = await request.json();
    const allowedFields: Record<string, unknown> = {};

    if (body.topic !== undefined) allowedFields.topic = body.topic;
    if (body.slowMode !== undefined) allowedFields.slowMode = body.slowMode;
    if (body.isActive !== undefined) allowedFields.isActive = body.isActive;
    if (body.flagThreshold !== undefined) allowedFields.flagThreshold = body.flagThreshold;

    const updated = await prisma.room.update({
      where: { code },
      data: allowedFields,
    });

    return NextResponse.json({
      id: updated.id,
      code: updated.code,
      name: updated.name,
      topic: updated.topic,
      isActive: updated.isActive,
      slowMode: updated.slowMode,
      flagThreshold: updated.flagThreshold,
    });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}
