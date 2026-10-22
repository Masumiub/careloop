import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { participants } from "@/db/schema";
import { asTrimmedString, handleUnexpected, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(participants).where(eq(participants.id, id)).limit(1);
    if (!row) return jsonError("Participant not found", 404);
    return NextResponse.json({ participant: row });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request body");

    const [existing] = await db
      .select()
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1);
    if (!existing) return jsonError("Participant not found", 404);

    const updates: Partial<typeof participants.$inferInsert> = {};

    if (body.name !== undefined) {
      const name = asTrimmedString(body.name);
      if (name.length < 2) return jsonError("Name is too short");
      updates.name = name;
    }
    if (body.preferredName !== undefined)
      updates.preferredName = asTrimmedString(body.preferredName) || null;
    if (body.email !== undefined) {
      const email = asTrimmedString(body.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return jsonError("Please provide a valid email address");
      if (email !== existing.email) {
        const [duplicate] = await db
          .select({ id: participants.id })
          .from(participants)
          .where(eq(participants.email, email))
          .limit(1);
        if (duplicate) return jsonError("A participant with this email already exists", 409);
      }
      updates.email = email;
    }
    if (body.phone !== undefined) {
      const phone = asTrimmedString(body.phone);
      if (phone.length < 8) return jsonError("Please provide a valid phone number");
      updates.phone = phone;
    }
    if (body.suburb !== undefined) {
      const suburb = asTrimmedString(body.suburb);
      if (!suburb) return jsonError("Suburb is required");
      updates.suburb = suburb;
    }
    if (body.state !== undefined) {
      const state = asTrimmedString(body.state).toUpperCase();
      if (!state) return jsonError("State is required");
      updates.state = state;
    }
    if (body.postcode !== undefined) {
      const postcode = asTrimmedString(body.postcode);
      if (!/^\d{4}$/.test(postcode)) return jsonError("Postcode must be 4 digits");
      updates.postcode = postcode;
    }
    if (body.ndisNumber !== undefined)
      updates.ndisNumber = asTrimmedString(body.ndisNumber) || null;
    if (body.accessibilityNotes !== undefined)
      updates.accessibilityNotes = asTrimmedString(body.accessibilityNotes) || null;
    if (body.supportNeeds !== undefined) {
      updates.supportNeeds = Array.isArray(body.supportNeeds)
        ? body.supportNeeds.map((s: unknown) => asTrimmedString(s)).filter(Boolean)
        : [];
    }
    if (body.color !== undefined) updates.color = asTrimmedString(body.color) || existing.color;

    const [updated] = await db
      .update(participants)
      .set(updates)
      .where(eq(participants.id, id))
      .returning();
    return NextResponse.json({ participant: updated });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [existing] = await db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.id, id))
      .limit(1);
    if (!existing) return jsonError("Participant not found", 404);
    await db.delete(participants).where(eq(participants.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
