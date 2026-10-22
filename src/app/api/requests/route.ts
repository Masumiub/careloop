import { NextResponse } from "next/server";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { participants, serviceRequests, staff } from "@/db/schema";
import {
  asTrimmedString,
  handleUnexpected,
  isDateInput,
  jsonError,
  PRIORITY_IDS,
  SERVICE_IDS,
  STATUS_IDS,
  TIME_IDS,
} from "@/lib/http";

export const dynamic = "force-dynamic";

const requestFields = {
  id: serviceRequests.id,
  participantId: serviceRequests.participantId,
  serviceType: serviceRequests.serviceType,
  title: serviceRequests.title,
  description: serviceRequests.description,
  suburb: serviceRequests.suburb,
  preferredDate: serviceRequests.preferredDate,
  preferredTime: serviceRequests.preferredTime,
  priority: serviceRequests.priority,
  status: serviceRequests.status,
  assignedStaffId: serviceRequests.assignedStaffId,
  staffNotes: serviceRequests.staffNotes,
  createdAt: serviceRequests.createdAt,
  updatedAt: serviceRequests.updatedAt,
  participantName: participants.name,
  participantSuburb: participants.suburb,
  participantState: participants.state,
  participantColor: participants.color,
  staffName: staff.name,
  staffRole: staff.role,
  staffColor: staff.color,
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = asTrimmedString(url.searchParams.get("q") ?? "");
    const status = asTrimmedString(url.searchParams.get("status") ?? "");
    const participantId = asTrimmedString(url.searchParams.get("participantId") ?? "");
    const staffId = asTrimmedString(url.searchParams.get("staffId") ?? "");
    const serviceType = asTrimmedString(url.searchParams.get("serviceType") ?? "");

    const conditions = [];
    if (status && STATUS_IDS.includes(status)) conditions.push(eq(serviceRequests.status, status));
    if (participantId) conditions.push(eq(serviceRequests.participantId, participantId));
    if (staffId) conditions.push(eq(serviceRequests.assignedStaffId, staffId));
    if (serviceType && SERVICE_IDS.includes(serviceType))
      conditions.push(eq(serviceRequests.serviceType, serviceType));
    if (q) {
      const like = `%${q}%`;
      conditions.push(
        or(
          ilike(serviceRequests.title, like),
          ilike(serviceRequests.description, like),
          ilike(serviceRequests.suburb, like),
          ilike(participants.name, like),
        ),
      );
    }

    const rows = await db
      .select(requestFields)
      .from(serviceRequests)
      .leftJoin(participants, eq(serviceRequests.participantId, participants.id))
      .leftJoin(staff, eq(serviceRequests.assignedStaffId, staff.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(serviceRequests.createdAt));

    return NextResponse.json({ requests: rows });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") return jsonError("Invalid request body");

    const participantId = asTrimmedString(body.participantId);
    const serviceType = asTrimmedString(body.serviceType);
    const title = asTrimmedString(body.title);
    const description = asTrimmedString(body.description);
    const suburb = asTrimmedString(body.suburb);
    const preferredTime = asTrimmedString(body.preferredTime) || "Flexible";
    const priority = asTrimmedString(body.priority) || "medium";
    const preferredDate = body.preferredDate ? asTrimmedString(body.preferredDate) : null;

    if (!participantId) return jsonError("Please choose who this request is for");
    if (!SERVICE_IDS.includes(serviceType)) return jsonError("Please choose a valid service type");
    if (title.length < 4) return jsonError("Please give your request a short title");
    if (description.length < 10)
      return jsonError("Please describe what you need (at least 10 characters)");
    if (!suburb) return jsonError("Please let us know the suburb for this service");
    if (!TIME_IDS.includes(preferredTime)) return jsonError("Please choose a valid time of day");
    if (!PRIORITY_IDS.includes(priority)) return jsonError("Please choose a valid priority");
    if (preferredDate && !isDateInput(preferredDate)) return jsonError("Please choose a valid date");

    const [participant] = await db
      .select({ id: participants.id })
      .from(participants)
      .where(eq(participants.id, participantId))
      .limit(1);
    if (!participant) return jsonError("Participant not found", 404);

    const [created] = await db
      .insert(serviceRequests)
      .values({
        participantId,
        serviceType,
        title,
        description,
        suburb,
        preferredDate,
        preferredTime,
        priority,
      })
      .returning({ id: serviceRequests.id });

    const [row] = await db
      .select(requestFields)
      .from(serviceRequests)
      .leftJoin(participants, eq(serviceRequests.participantId, participants.id))
      .leftJoin(staff, eq(serviceRequests.assignedStaffId, staff.id))
      .where(eq(serviceRequests.id, created.id))
      .limit(1);

    return NextResponse.json({ request: row }, { status: 201 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
