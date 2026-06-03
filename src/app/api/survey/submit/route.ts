import { NextResponse } from "next/server";

import { sql } from "@/lib/neon/server";

// Ghi vào Neon PostgreSQL ở server-side. Giữ Node.js runtime.
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

// "Biggest Pain": Owner lấy Pain; Guest gộp B2CPain + tín hiệu giá báo sai (PriceMismatch).
function buildBiggestPain(isOwner: boolean, answers: AnyRecord): string {
  if (isOwner) return joinArr(answers.Pain);
  const parts: string[] = [];
  const pain = joinArr(answers.B2CPain);
  if (pain) parts.push(pain);
  if (answers.PriceMismatch)
    parts.push("Giá báo sau khác ban đầu: " + val(answers.PriceMismatch));
  return parts.join(" | ");
}

// "Desired Solution": Owner lấy Solution; Guest tổng hợp tín hiệu kỳ vọng B2C.
function buildDesiredSolution(isOwner: boolean, answers: AnyRecord): string {
  if (isOwner) return joinArr(answers.Solution);
  const parts: string[] = [];
  if (answers.Criteria) parts.push("Tiêu chí chọn: " + joinArr(answers.Criteria));
  if (answers.ReplyInfo) parts.push("Mong trả lời ngay: " + joinArr(answers.ReplyInfo));
  if (answers.ResponseTime) parts.push("Thời gian phản hồi: " + val(answers.ResponseTime));
  if (answers.BotAcceptance) parts.push("Chatbot: " + val(answers.BotAcceptance));
  if (answers.TrustFactor) parts.push("Tạo niềm tin: " + joinArr(answers.TrustFactor));
  if (answers.OpenInsight) parts.push("Góp ý: " + val(answers.OpenInsight));
  return parts.join(" | ");
}

// Lead Score: Owner tính server-side; Guest = 0.
function calculateLeadScore(isOwner: boolean, answers: AnyRecord): number {
  if (!isOwner) return 0;
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

function getPriority(score: number, audience: Audience): string {
  if (audience !== "owner") return "Research"; // Guest
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

// "Notes": gom toàn bộ dữ liệu phụ không có cột riêng + full answers JSON compact.
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
    lines.push("FanpageZalo: " + val(answers.FanpageZalo));
    lines.push("SlowReplyLoss: " + val(answers.SlowReplyLoss));
    lines.push("Retention: " + val(answers.Retention));
    lines.push("Repeat: " + joinArr(answers.Repeat));
  }

  // Full answers compact JSON (không log ra console, chỉ lưu DB).
  lines.push("AnswersJSON: " + JSON.stringify(answers));
  return lines.join("\n");
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

  // Mapping đúng 21 cột bảng survey_responses (Submit Date dùng DEFAULT now() server-side).
  const row = {
    surveyId: val(payload.responseId),
    source: val(payload.source),
    segment: val(payload.audienceLabel || payload.audience),
    role: isOwner ? val(answers.Role) : "Khách hàng",
    hotelType: isOwner ? val(answers.HotelType) : "",
    rooms: isOwner ? val(answers.Rooms) : "",
    biggestPain: buildBiggestPain(isOwner, answers),
    desiredSolution: buildDesiredSolution(isOwner, answers),
    techReadiness: isOwner ? toIntOrNull(answers.Readiness) : null,
    willingnessToPay: isOwner ? val(answers.WTP) : "",
    budgetRange: isOwner ? val(answers.Budget) : "",
    contactPermission,
    name: val(contact.name),
    phone: val(contact.phone),
    hotelCompany: val(contact.hotel),
    position: val(contact.role),
    leadScore,
    priority: getPriority(leadScore, audience),
    followUpStatus: contactPermission === "Có" ? "New" : "No follow-up",
    notes: buildNotes(payload, isOwner, answers),
  };

  try {
    // Insert parameter-hoá vào Neon. Tên cột dùng quoted identifiers (có dấu cách / ký tự đặc biệt).
    // "Submit Date" để DEFAULT now() (thời điểm server nhận request).
    const inserted = await sql`
      INSERT INTO survey_responses (
        "Survey ID", "Source", "Segment", "Role", "Hotel Type", "Rooms",
        "Biggest Pain", "Desired Solution", "Tech Readiness 1-5",
        "Willingness To Pay", "Budget Range", "Contact Permission",
        "Name", "Phone", "Hotel/Company", "Position",
        "Lead Score", "Priority", "Follow-up Status", "Notes"
      ) VALUES (
        ${row.surveyId}, ${row.source}, ${row.segment}, ${row.role},
        ${row.hotelType}, ${row.rooms}, ${row.biggestPain}, ${row.desiredSolution},
        ${row.techReadiness}, ${row.willingnessToPay}, ${row.budgetRange},
        ${row.contactPermission}, ${row.name}, ${row.phone}, ${row.hotelCompany},
        ${row.position}, ${row.leadScore}, ${row.priority}, ${row.followUpStatus},
        ${row.notes}
      )
      RETURNING "Survey ID"
    `;

    const id = inserted[0]?.["Survey ID"];
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    // Không log payload cá nhân; chỉ trả message lỗi.
    const message = err instanceof Error ? err.message : "Lỗi không xác định.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
