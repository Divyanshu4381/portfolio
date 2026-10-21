import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { ILeadShare, ILeadUpdateRequest } from "@/lib/lead-engine/types";
import crypto from "crypto";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token || token.length < 32) {
      return NextResponse.json({ error: "Invalid share token" }, { status: 400 });
    }

    const db = await getDatabase();
    const share = await db.collection<ILeadShare>("lead_shares").findOne({ token });

    if (!share) {
      return NextResponse.json(
        { error: "Share link not found or has expired." },
        { status: 404 }
      );
    }

    if (share.isRevoked) {
      return NextResponse.json(
        { error: "This share link has been revoked." },
        { status: 403 }
      );
    }

    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "This share link has expired." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      leadId,
      proposedStatus = "contacted",
      checklist = { contacted: true },
      notes = "",
      submittedBy = "Anonymous Collaborator",
    } = body;

    if (!leadId) {
      return NextResponse.json({ error: "leadId is required" }, { status: 400 });
    }

    // Verify lead exists
    const lead = await db.collection("leads").findOne({ leadId });
    if (!lead) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }

    const requestId = `REQ-${Date.now()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    const requestDoc: ILeadUpdateRequest = {
      requestId,
      shareToken: token,
      shareTitle: share.title,
      leadId,
      companyName: lead.companyName || "Unknown Company",
      contactPerson: lead.contactPerson || "",
      proposedStatus,
      checklist: {
        contacted: Boolean(checklist.contacted),
        meetingScheduled: Boolean(checklist.meetingScheduled),
        followUpNeeded: Boolean(checklist.followUpNeeded),
      },
      notes: String(notes).trim(),
      submittedBy: String(submittedBy).trim() || "Collaborator",
      status: "pending",
      createdAt: new Date(),
    };

    await db.collection("lead_update_requests").insertOne(requestDoc);

    // Audit log
    await db.collection("lead_audit_logs").insertOne({
      action: "lead_update_requested",
      performedBy: submittedBy,
      details: {
        requestId,
        leadId,
        companyName: lead.companyName,
        proposedStatus,
      },
      timestamp: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Update request submitted! Waiting for admin review and approval.",
      requestId,
    });
  } catch (err: any) {
    console.error("Submit lead update request error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to submit update request." },
      { status: 500 }
    );
  }
}
