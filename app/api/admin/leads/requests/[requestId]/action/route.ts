import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { getDatabase } from "@/lib/mongodb";
import { ILeadUpdateRequest } from "@/lib/lead-engine/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { requestId } = await params;
    const body = await req.json();
    const { action } = body; // "approve" | "reject"

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: 'action must be either "approve" or "reject"' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const requestDoc = await db
      .collection<ILeadUpdateRequest>("lead_update_requests")
      .findOne({ requestId });

    if (!requestDoc) {
      return NextResponse.json(
        { error: "Update request not found" },
        { status: 404 }
      );
    }

    if (action === "approve") {
      // 1. Mark request as approved
      await db.collection("lead_update_requests").updateOne(
        { requestId },
        {
          $set: {
            status: "approved",
            reviewedAt: new Date(),
            reviewedBy: admin.email,
          },
        }
      );

      // 2. Fetch target lead
      const targetLead = await db
        .collection("leads")
        .findOne({ leadId: requestDoc.leadId });

      if (targetLead) {
        // Construct updated notes string with attribution
        const checklistSummary = [
          requestDoc.checklist.contacted ? "Client Contacted: YES" : null,
          requestDoc.checklist.meetingScheduled ? "Meeting Scheduled" : null,
          requestDoc.checklist.followUpNeeded ? "Follow-Up Needed" : null,
        ]
          .filter(Boolean)
          .join(" | ");

        const newNoteEntry = `\n\n[Collaborator Update by ${requestDoc.submittedBy} on ${new Date().toLocaleDateString()}]: ${checklistSummary}${
          requestDoc.notes ? `\nNotes: ${requestDoc.notes}` : ""
        }`;

        const updatedNotes = (targetLead.notes || "") + newNoteEntry;

        // Apply update to the lead
        await db.collection("leads").updateOne(
          { leadId: requestDoc.leadId },
          {
            $set: {
              status: requestDoc.proposedStatus,
              notes: updatedNotes.trim(),
              updatedAt: new Date(),
            },
          }
        );
      }

      // 3. Audit log
      await db.collection("lead_audit_logs").insertOne({
        action: "lead_update_request_approved",
        performedBy: admin.email,
        details: {
          requestId,
          leadId: requestDoc.leadId,
          proposedStatus: requestDoc.proposedStatus,
        },
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Update approved and applied to lead record!",
      });
    } else {
      // Reject request
      await db.collection("lead_update_requests").updateOne(
        { requestId },
        {
          $set: {
            status: "rejected",
            reviewedAt: new Date(),
            reviewedBy: admin.email,
          },
        }
      );

      await db.collection("lead_audit_logs").insertOne({
        action: "lead_update_request_rejected",
        performedBy: admin.email,
        details: { requestId, leadId: requestDoc.leadId },
        timestamp: new Date(),
      });

      return NextResponse.json({
        success: true,
        message: "Update request rejected.",
      });
    }
  } catch (err: any) {
    console.error("Action on lead request error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process request." },
      { status: 500 }
    );
  }
}
