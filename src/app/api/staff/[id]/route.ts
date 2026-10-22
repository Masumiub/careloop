import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { asTrimmedString, handleUnexpected, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [row] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (!row) return jsonError("Team member not found", 404);
    return NextResponse.json({ staff: row });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request body");

    const [existing] = await db.select().from(staff).where(eq(staff.id, id)).limit(1);
    if (!existing) return jsonError("Team member not found", 404);

    const updates: Partial<typeof staff.$inferInsert> = {};

    if (body.name !== undefined) {
      const name = asTrimmedString(body.name);
      if (name.length < 2) return jsonError("Name is too short");
      updates.name = name;
    }
    if (body.email !== undefined) {
      const email = asTrimmedString(body.email).toLowerCase();
      if (!EMAIL_RE.test(email)) return jsonError("Please provide a valid email address");
      if (email !== existing.email) {
        const [duplicate] = await db
          .select({ id: staff.id })
          .from(staff)
          .where(eq(staff.email, email))
          .limit(1);
        if (duplicate) return jsonError("A team member with this email already exists", 409);
      }
      updates.email = email;
    }
    if (body.phone !== undefined) {
      const phone = asTrimmedString(body.phone);
      if (phone.length < 8) return jsonError("Please provide a valid phone number");
      updates.phone = phone;
    }
    if (body.role !== undefined) {
      const role = asTrimmedString(body.role);
      if (!role) return jsonError("Role is required");
      updates.role = role;
    }
    if (body.region !== undefined) {
      const region = asTrimmedString(body.region);
      if (!region) return jsonError("Region is required");
      updates.region = region;
    }
    if (body.specialities !== undefined) {
      updates.specialities = Array.isArray(body.specialities)
        ? body.specialities.map((s: unknown) => asTrimmedString(s)).filter(Boolean)
        : [];
    }
    if (body.active !== undefined) updates.active = Boolean(body.active);
    if (body.color !== undefined) updates.color = asTrimmedString(body.color) || existing.color;

    const [updated] = await db.update(staff).set(updates).where(eq(staff.id, id)).returning();
    return NextResponse.json({ staff: updated });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [existing] = await db.select({ id: staff.id }).from(staff).where(eq(staff.id, id)).limit(1);
    if (!existing) return jsonError("Team member not found", 404);
    await db.delete(staff).where(eq(staff.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
