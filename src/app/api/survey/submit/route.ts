import { NextResponse } from "next/server";

import { sql } from "@/lib/neon/server";

// Neon PostgreSQL server-side insert. Keep this route on the Node.js runtime.
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

function nullableText(value: unknown): string | null {
  const text = val(value).trim();
  return text ? text : null;
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

function toTimestampOrNull(value: unknown): string | null {
  const text = nullableText(value);
  if (!text) return null;
  const time = Date.parse(text);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function isYes(value: unknown): boolean {
  return val(value).trim().toLowerCase() === "có";
}

function calculateLeadScore(isOwner: boolean, answers: AnyRecord): number {
  if (!isOwner) return 0;

  let score = 0;
  const readiness = toIntOrNull(answers.Readiness);
  const wtp = val(answers.WTP);
  const interest = val(answers.Interest);
  const budget = val(answers.Budget);

  if (isYes(answers.LeadConsent)) score += 30;
  if (wtp === "Có" || wtp === "Có, nếu thấy hiệu quả") score += 20;
  if (readiness === 4 || readiness === 5) score += 20;
  if (interest === "Rất quan tâm" || interest === "Có quan tâm") score += 15;
  if (budget && budget !== "Dưới 500.000đ") score += 15;

  return score;
}

function getPriority(score: number, audience: Audience): string {
  if (audience !== "owner") return "Research";
  if (score >= 70) return "Hot";
  if (score >= 40) return "Warm";
  return "Cold";
}

function buildNotes(payload: AnyRecord): string {
  const notes: string[] = [];

  const audienceLabel = nullableText(payload.audienceLabel);
  if (audienceLabel) notes.push("AudienceLabel: " + audienceLabel);

  return notes.join("\n");
}

export async function POST(request: Request) {
  let payload: AnyRecord;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Body JSON khong hop le." }, { status: 400 });
  }

  const audience = payload.audience;
  if (audience !== "owner" && audience !== "guest") {
    return NextResponse.json(
      { ok: false, error: "audience phai la 'owner' hoac 'guest'." },
      { status: 400 },
    );
  }
  if (!payload.responseId || typeof payload.responseId !== "string") {
    return NextResponse.json({ ok: false, error: "Thieu responseId." }, { status: 400 });
  }
  if (!isObject(payload.answers)) {
    return NextResponse.json({ ok: false, error: "answers phai la object." }, { status: 400 });
  }

  const isOwner = audience === "owner";
  const answers: AnyRecord = payload.answers;
  const contact: AnyRecord = isObject(payload.contact) ? payload.contact : {};
  const leadScore = calculateLeadScore(isOwner, answers);
  const leadConsent = isOwner ? val(answers.LeadConsent) : "";
  const followUpStatus = isYes(leadConsent) || payload.consent === true ? "New" : "No follow-up";

  const row = {
    surveyId: val(payload.responseId),
    source: val(payload.source),
    segment: val(payload.audienceLabel || payload.audience),
    audience,
    pageUrl: val(payload.pageUrl),
    userAgent: val(payload.userAgent),
    completedAt: toTimestampOrNull(payload.completedAt),

    hotelType: isOwner ? val(answers.HotelType) : "",
    rooms: isOwner ? val(answers.Rooms) : "",
    ownerRole: isOwner ? val(answers.Role) : "",
    channel: isOwner ? joinArr(answers.Channel) : "",
    pain: isOwner ? joinArr(answers.Pain) : "",
    timeCost: isOwner ? joinArr(answers.TimeCost) : "",
    currentTool: isOwner ? val(answers.CurrentTool) : "",
    readiness: isOwner ? toIntOrNull(answers.Readiness) : null,
    interest: isOwner ? val(answers.Interest) : "",
    solution: isOwner ? joinArr(answers.Solution) : "",
    pilot: isOwner ? val(answers.Pilot) : "",
    wtp: isOwner ? val(answers.WTP) : "",
    budget: isOwner ? val(answers.Budget) : "",
    leadConsent,

    travelHistory: !isOwner ? val(answers.TravelHistory) : "",
    bookingChannel: !isOwner ? joinArr(answers.BookingChannel) : "",
    criteria: !isOwner ? joinArr(answers.Criteria) : "",
    fanpageZalo: !isOwner ? val(answers.FanpageZalo) : "",
    b2cPain: !isOwner ? joinArr(answers.B2CPain) : "",
    slowReplyLoss: !isOwner ? val(answers.SlowReplyLoss) : "",
    priceMismatch: !isOwner ? val(answers.PriceMismatch) : "",
    responseTime: !isOwner ? val(answers.ResponseTime) : "",
    replyInfo: !isOwner ? joinArr(answers.ReplyInfo) : "",
    botAcceptance: !isOwner ? val(answers.BotAcceptance) : "",
    retention: !isOwner ? val(answers.Retention) : "",
    repeatDriver: !isOwner ? joinArr(answers.Repeat) : "",
    trustFactor: !isOwner ? joinArr(answers.TrustFactor) : "",
    openInsight: !isOwner ? val(answers.OpenInsight) : "",

    name: val(contact.name),
    phone: val(contact.phone),
    hotelCompany: val(contact.hotel),
    position: val(contact.role),
    leadScore,
    priority: getPriority(leadScore, audience),
    followUpStatus,
    resources: val(payload.resources),
    consent: payload.consent === true,
    contactInfo: val(payload.contactInfo),
    notes: buildNotes(payload),
    rawAnswers: JSON.stringify(answers),
    rawPayload: JSON.stringify(payload),
  };

  try {
    const inserted = await sql`
      INSERT INTO survey_responses (
        survey_id, source, segment, audience, page_url, user_agent, completed_at,
        hotel_type, rooms, owner_role, channel, pain, time_cost, current_tool,
        readiness, interest, solution, pilot, wtp, budget, lead_consent,
        travel_history, booking_channel, criteria, fanpage_zalo, b2c_pain,
        slow_reply_loss, price_mismatch, response_time, reply_info,
        bot_acceptance, retention, repeat_driver, trust_factor, open_insight,
        name, phone, hotel_company, position, lead_score, priority,
        follow_up_status, resources, consent, contact_info, notes,
        raw_answers, raw_payload
      ) VALUES (
        ${row.surveyId}, ${row.source}, ${row.segment}, ${row.audience},
        ${row.pageUrl}, ${row.userAgent}, ${row.completedAt},
        ${row.hotelType}, ${row.rooms}, ${row.ownerRole}, ${row.channel},
        ${row.pain}, ${row.timeCost}, ${row.currentTool}, ${row.readiness},
        ${row.interest}, ${row.solution}, ${row.pilot}, ${row.wtp},
        ${row.budget}, ${row.leadConsent}, ${row.travelHistory},
        ${row.bookingChannel}, ${row.criteria}, ${row.fanpageZalo},
        ${row.b2cPain}, ${row.slowReplyLoss}, ${row.priceMismatch},
        ${row.responseTime}, ${row.replyInfo}, ${row.botAcceptance},
        ${row.retention}, ${row.repeatDriver}, ${row.trustFactor},
        ${row.openInsight}, ${row.name}, ${row.phone}, ${row.hotelCompany},
        ${row.position}, ${row.leadScore}, ${row.priority},
        ${row.followUpStatus}, ${row.resources}, ${row.consent},
        ${row.contactInfo}, ${row.notes}, ${row.rawAnswers}::jsonb,
        ${row.rawPayload}::jsonb
      )
      RETURNING survey_id
    `;

    const id = inserted[0]?.survey_id;
    return NextResponse.json({ ok: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Loi khong xac dinh.";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
