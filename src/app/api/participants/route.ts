import { NextResponse } from "next/server";
import { asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { participants } from "@/db/schema";
import { asTrimmedString, handleUnexpected, jsonError } from "@/lib/http";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = asTrimmedString(url.searchParams.get("q") ?? "");
    const rows = await db
      .select()
      .from(participants)
      .where(
        q
          ? or(
              ilike(participants.name, `%${q}%`),
              ilike(participants.suburb, `%${q}%`),
              ilike(participants.email, `%${q}%`),
              ilike(participants.ndisNumber, `%${q}%`),
            )
          : undefined,
      )
      .orderBy(asc(participants.name));
    return NextResponse.json({ participants: rows });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request body");

    const name = asTrimmedString(body.name);
    const preferredName = asTrimmedString(body.preferredName) || null;
    const email = asTrimmedString(body.email).toLowerCase();
    const phone = asTrimmedString(body.phone);
    const suburb = asTrimmedString(body.suburb);
    const state = asTrimmedString(body.state).toUpperCase();
    const postcode = asTrimmedString(body.postcode);
    const ndisNumber = asTrimmedString(body.ndisNumber) || null;
    const accessibilityNotes = asTrimmedString(body.accessibilityNotes) || null;
    const supportNeeds = Array.isArray(body.supportNeeds)
      ? body.supportNeeds.map((s: unknown) => asTrimmedString(s)).filter(Boolean)
      : [];
    const color = asTrimmedString(body.color) || "pine";

    if (name.length < 2) return jsonError("Please provide the participant's full name");
    if (!EMAIL_RE.test(email)) return jsonError("Please provide a valid email address");
    if (phone.length < 8) return jsonError("Please provide a valid phone number");
    if (!suburb) return jsonError("Suburb is required");
    if (!state) return jsonError("State is required");
    if (!/^\d{4}$/.test(postcode)) return jsonError("Postcode must be 4 digits");

    const [duplicate] = await db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.email, email))
      .limit(1);
    if (duplicate) return jsonError("A participant with this email already exists", 409);

    const [created] = await db
      .insert(participants)
      .values({
        name,
        preferredName,
        email,
        phone,
        suburb,
        state,
        postcode,
        ndisNumber,
        supportNeeds,
        accessibilityNotes,
        color,
      })
      .returning();

    return NextResponse.json({ participant: created }, { status: 201 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
