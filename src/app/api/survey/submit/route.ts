import { NextResponse } from "next/server";

import { getSupabaseAdmin } from "@/lib/supabase/server";

// Service role + Supabase SDK cần Node.js runtime (không phải Edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Audience = "owner" | "guest";

type AnyRecord = Record<string, any>;

function isObject(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function val(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function joinArr(value: unknown): string {
  if (Array.isArray(value)) {
    return value
      .filter((x) => x !== undefined && x !== null && x !== "")
      .join("; ");
  }
  return val(value);
}

function toIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null || value === "") return null;
  const n = parseInt(String(value), 10);
  return Number.isNaN(n) ? null : n;
}

// Desired Solution: Owner lấy answers.Solution; Guest tổng hợp tín hiệu B2C.
function buildDesiredSolution(isOwner: boolean, answers: AnyRecord): string {
  if (isOwner) return joinArr(answers.Solution);
  const parts: string[] = [];
  if (answers.Criteria) parts.push("Quan tâm: " + joinArr(answers.Criteria));
  if (answers.ResponseTime) parts.push("Mong phản hồi: " + val(answers.ResponseTime));
  if (answers.BotAcceptance) parts.push("Chatbot: " + val(answers.BotAcceptance));
  if (answers.OpenInsight) parts.push("Góp ý: " + val(answers.OpenInsight));
  return parts.join(" | ");
}

// Lead Score chỉ tính cho Owner (giữ logic tương đồng Apps Script); Guest = null.
function calculateLeadScore(isOwner: boolean, answers: AnyRecord): number | null {
  if (!isOwner) return null;
  let score = 0;
  if (answers.LeadConsent === "Có") score += 30;
  if (answers.WTP === "Có" || answers.WTP === "Có, nếu thấy hiệu quả") score += 20;
  if (
    answers.Readiness === "4" ||
    answers.Readiness === "5" ||
    answers.Readiness === 4 ||
    answers.Readiness === 5
  )
    score += 20;
  if (answers.Interest === "Rất quan tâm" || answers.Interest === "Có quan tâm") score += 15;
  if (answers.Budget && answers.Budget !== "Dưới 500.000đ") score += 15;
  return score;
}

function getPriority(score: number | null, audience: Audience): string {
  if (audience !== "owner") return "Research"; // Guest
  const s = score ?? 0;
  if (s >= 70) return "Hot";
  if (s >= 40) return "Warm";
  return "Cold";
}

function buildNotes(payload: AnyRecord, isOwner: boolean, answers: AnyRecord): string {
  const lines: string[] = [];
  lines.push("PageUrl: " + val(payload.pageUrl));
  lines.push("UserAgent: " + val(payload.userAgent));
  lines.push("CompletedAt: " + val(payload.completedAt));
  lines.push("Resources: " + val(payload.resources));
  lines.push("Consent: " + (payload.consent === true ? "TRUE" : "FALSE"));
  lines.push("ContactInfo: " + val(payload.contactInfo));

  if (isOwner) {
    lines.push("Channel: " + joinArr(answers.Channel));
    lines.push("TimeCost: " + joinArr(answers.TimeCost));
    lines.push("CurrentTool: " + val(answers.CurrentTool));
    lines.push("Interest: " + val(answers.Interest));
    lines.push("Pilot: " + val(answers.Pilot));
  } else {
    lines.push("TravelHistory: " + val(answers.TravelHistory));
    lines.push("BookingChannel: " + joinArr(answers.BookingChannel));
    lines.push("SlowReplyLoss: " + val(answers.SlowReplyLoss));
    lines.push("Retention: " + val(answers.Retention));
    lines.push("Repeat: " + joinArr(answers.Repeat));
  }
  return lines.join("\n");
}

function toCompletedAt(value: unknown): string | null {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export async function POST(request: Request) {
  // --- Parse JSON body ---
  let payload: AnyRecord;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON không hợp lệ." }, { status: 400 });
  }

  // --- Validate cơ bản ---
  const audience = payload.audience;
  if (audience !== "owner" && audience !== "guest") {
    return NextResponse.json(
      { ok: false, error: "audience phải là 'owner' hoặc 'guest'." },
      { status: 400 },
    );
  }
  if (!payload.responseId || typeof payload.responseId !== "string") {
    return NextResponse.json({ ok: false, error: "Thiếu responseId." }, { status: 400 });
  }
  if (!isObject(payload.answers)) {
    return NextResponse.json({ ok: false, error: "answers phải là object." }, { status: 400 });
  }

  const isOwner = audience === "owner";
  const answers: AnyRecord = payload.answers;
  const contact: AnyRecord = isObject(payload.contact) ? payload.contact : {};

  const contactPermission =
    answers.LeadConsent || (payload.consent ? "Có" : "Không");
  const leadScore = calculateLeadScore(isOwner, answers);

  const row = {
    survey_id: val(payload.responseId),
    source: val(payload.source),
    segment: val(payload.audienceLabel || payload.audience),
    audience,
    role: isOwner ? val(answers.Role) : "Khách hàng",
    hotel_type: val(answers.HotelType),
    rooms: val(answers.Rooms),
    biggest_pain: isOwner ? joinArr(answers.Pain) : joinArr(answers.B2CPain),
    desired_solution: buildDesiredSolution(isOwner, answers),
    tech_readiness: toIntOrNull(answers.Readiness),
    willingness_to_pay: val(answers.WTP),
    budget_range: val(answers.Budget),
    contact_permission: contactPermission,
    name: val(contact.name),
    phone: val(contact.phone),
    hotel_company: val(contact.hotel),
    position: val(contact.role),
    lead_score: leadScore,
    priority: getPriority(leadScore, audience),
    follow_up_status: contactPermission === "Có" ? "New" : "No follow-up",
    notes: buildNotes(payload, isOwner, answers),
    answers,
    resources: payload.resources ?? null,
    contact: payload.contact ?? null,
    consent: payload.consent === true,
    page_url: val(payload.pageUrl),
    user_agent: val(payload.userAgent),
    completed_at: toCompletedAt(payload.completedAt),
  };

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("survey_responses")
      .insert(row)
      .select("id")
      .single();

    if (error) {
      // Không log payload cá nhân; chỉ trả message lỗi từ DB.
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi không xác định.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
