import { NextResponse } from "next/server";
import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { staff } from "@/db/schema";
import { asTrimmedString, handleUnexpected, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = asTrimmedString(url.searchParams.get("q") ?? "");
    const rows = await db
      .select()
      .from(staff)
      .where(
        q
          ? or(
              ilike(staff.name, `%${q}%`),
              ilike(staff.role, `%${q}%`),
              ilike(staff.region, `%${q}%`),
            )
          : undefined,
      )
      .orderBy(asc(staff.name));
    return NextResponse.json({ staff: rows });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request body");

    const name = asTrimmedString(body.name);
    const email = asTrimmedString(body.email).toLowerCase();
    const phone = asTrimmedString(body.phone);
    const role = asTrimmedString(body.role);
    const region = asTrimmedString(body.region);
    const specialities = Array.isArray(body.specialities)
      ? body.specialities.map((s: unknown) => asTrimmedString(s)).filter(Boolean)
      : [];
    const color = asTrimmedString(body.color) || "pine";

    if (name.length < 2) return jsonError("Please provide the team member's full name");
    if (!EMAIL_RE.test(email)) return jsonError("Please provide a valid email address");
    if (phone.length < 8) return jsonError("Please provide a valid phone number");
    if (!role) return jsonError("Please choose a role");
    if (!region) return jsonError("Region is required");

    const [duplicate] = await db
      .select({ id: staff.id })
      .from(staff)
      .where(eq(staff.email, email))
      .limit(1);
    if (duplicate) return jsonError("A team member with this email already exists", 409);

    const [created] = await db
      .insert(staff)
      .values({ name, email, phone, role, region, specialities, color })
      .returning();

    return NextResponse.json({ staff: created }, { status: 201 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
