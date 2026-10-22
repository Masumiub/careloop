import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
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

type Params = { params: Promise<{ id: string }> };

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

async function loadJoined(id: string) {
  const [row] = await db
    .select(requestFields)
    .from(serviceRequests)
    .leftJoin(participants, eq(serviceRequests.participantId, participants.id))
    .leftJoin(staff, eq(serviceRequests.assignedStaffId, staff.id))
    .where(eq(serviceRequests.id, id))
    .limit(1);
  return row ?? null;
}

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const row = await loadJoined(id);
    if (!row) return jsonError("Request not found", 404);
    return NextResponse.json({ request: row });
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
      .select({ id: serviceRequests.id })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);
    if (!existing) return jsonError("Request not found", 404);

    const updates: Partial<typeof serviceRequests.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.status !== undefined) {
      const status = asTrimmedString(body.status);
      if (!STATUS_IDS.includes(status)) return jsonError("Invalid status");
      updates.status = status;
    }
    if (body.priority !== undefined) {
      const priority = asTrimmedString(body.priority);
      if (!PRIORITY_IDS.includes(priority)) return jsonError("Invalid priority");
      updates.priority = priority;
    }
    if (body.serviceType !== undefined) {
      const serviceType = asTrimmedString(body.serviceType);
      if (!SERVICE_IDS.includes(serviceType)) return jsonError("Invalid service type");
      updates.serviceType = serviceType;
    }
    if (body.preferredTime !== undefined) {
      const preferredTime = asTrimmedString(body.preferredTime);
      if (!TIME_IDS.includes(preferredTime)) return jsonError("Invalid time of day");
      updates.preferredTime = preferredTime;
    }
    if (body.title !== undefined) {
      const title = asTrimmedString(body.title);
      if (title.length < 4) return jsonError("Title is too short");
      updates.title = title;
    }
    if (body.description !== undefined) {
      const description = asTrimmedString(body.description);
      if (description.length < 10) return jsonError("Description is too short");
      updates.description = description;
    }
    if (body.suburb !== undefined) {
      const suburb = asTrimmedString(body.suburb);
      if (!suburb) return jsonError("Suburb is required");
      updates.suburb = suburb;
    }
    if (body.preferredDate !== undefined) {
      if (body.preferredDate === null || body.preferredDate === "") {
        updates.preferredDate = null;
      } else {
        const preferredDate = asTrimmedString(body.preferredDate);
        if (!isDateInput(preferredDate)) return jsonError("Invalid date");
        updates.preferredDate = preferredDate;
      }
    }
    if (body.staffNotes !== undefined) {
      updates.staffNotes = asTrimmedString(body.staffNotes) || null;
    }
    if (body.assignedStaffId !== undefined) {
      if (body.assignedStaffId === null || body.assignedStaffId === "") {
        updates.assignedStaffId = null;
      } else {
        const staffId = asTrimmedString(body.assignedStaffId);
        const [member] = await db
          .select({ id: staff.id })
          .from(staff)
          .where(eq(staff.id, staffId))
          .limit(1);
        if (!member) return jsonError("Staff member not found", 404);
        updates.assignedStaffId = staffId;
        if (body.status === undefined) updates.status = "in_progress";
      }
    }

    await db.update(serviceRequests).set(updates).where(eq(serviceRequests.id, id));
    const row = await loadJoined(id);
    return NextResponse.json({ request: row });
  } catch (err) {
    return handleUnexpected(err);
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const [existing] = await db
      .select({ id: serviceRequests.id })
      .from(serviceRequests)
      .where(eq(serviceRequests.id, id))
      .limit(1);
    if (!existing) return jsonError("Request not found", 404);
    await db.delete(serviceRequests).where(eq(serviceRequests.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleUnexpected(err);
  }
}
