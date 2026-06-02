// ============================================================================
// BBOTech Survey — Apps Script V2 (21 cột) — PATCH HEADER_ROW = 3
// Nguồn: markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md
// Dán TOÀN BỘ file này vào Code.gs, sau đó:
//   Deploy → Manage deployments → Edit (bút chì) → Version: New version → Deploy
// (Chỉ Save thôi KHÔNG cập nhật bản Web App đang chạy.)
// ============================================================================

// ===== CẤU HÌNH =====
var SPREADSHEET_ID = '1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI';
var SHEET_NAME = '09_Response_Tracker';

// Dòng chứa 21 header THẬT trong tab. Dòng 1 là tiêu đề lớn
// ("09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật"), nên header bắt đầu ở DÒNG 3.
var HEADER_ROW = 3;

// 21 cột CỐ ĐỊNH hiện có của sheet. KHÔNG đổi thứ tự, KHÔNG thêm, KHÔNG bớt.
var EXPECTED_HEADERS = [
  'Survey ID',
  'Submit Date',
  'Source',
  'Segment',
  'Role',
  'Hotel Type',
  'Rooms',
  'Biggest Pain',
  'Desired Solution',
  'Tech Readiness 1-5',
  'Willingness To Pay',
  'Budget Range',
  'Contact Permission',
  'Name',
  'Phone',
  'Hotel/Company',
  'Position',
  'Lead Score',
  'Priority',
  'Follow-up Status',
  'Notes'
];

// ===== HELPERS =====
function val(value) {
  return value === undefined || value === null ? '' : value;
}

function joinArr(value) {
  if (Array.isArray(value)) {
    return value.filter(function (x) { return x !== undefined && x !== null && x !== ''; }).join('; ');
  }
  return val(value);
}

function isOwner(payload) {
  return payload && payload.audience === 'owner';
}

// Guest không có cột Desired Solution riêng → tổng hợp ngắn từ các tín hiệu B2C.
function buildDesiredSolution(payload, answers) {
  if (isOwner(payload)) {
    return joinArr(answers.Solution);
  }
  var parts = [];
  if (answers.Criteria) parts.push('Quan tâm: ' + joinArr(answers.Criteria));
  if (answers.ResponseTime) parts.push('Mong phản hồi: ' + val(answers.ResponseTime));
  if (answers.BotAcceptance) parts.push('Chatbot: ' + val(answers.BotAcceptance));
  if (answers.OpenInsight) parts.push('Góp ý: ' + val(answers.OpenInsight));
  return parts.join(' | ');
}

// Lead Score chỉ tính cho Owner; Guest trả '' (không chấm điểm).
function calculateLeadScore(payload, answers) {
  if (!isOwner(payload)) return '';
  var score = 0;
  if (answers.LeadConsent === 'Có') score += 30;
  if (answers.WTP === 'Có' || answers.WTP === 'Có, nếu thấy hiệu quả') score += 20;
  if (answers.Readiness === '4' || answers.Readiness === '5' ||
      answers.Readiness === 4 || answers.Readiness === 5) score += 20;
  if (answers.Interest === 'Rất quan tâm' || answers.Interest === 'Có quan tâm') score += 15;
  if (answers.Budget && answers.Budget !== 'Dưới 500.000đ') score += 15;
  return score;
}

function getPriority(score, audience) {
  if (audience !== 'owner') return 'Research'; // Guest
  if (score >= 70) return 'Hot';
  if (score >= 40) return 'Warm';
  return 'Cold';
}

// Đọc dòng HEADER_ROW (= 3), so khớp đúng 21 header.
function validateHeaders(sheet) {
  var lastCol = sheet.getLastColumn();
  if (lastCol < EXPECTED_HEADERS.length) {
    return { ok: false, error: 'Header mismatch: sheet co ' + lastCol + ' cot, can ' + EXPECTED_HEADERS.length };
  }
  var headerRow = sheet.getRange(HEADER_ROW, 1, 1, EXPECTED_HEADERS.length).getValues()[0];
  for (var i = 0; i < EXPECTED_HEADERS.length; i++) {
    var actual = String(headerRow[i]).trim();
    if (actual !== EXPECTED_HEADERS[i]) {
      return {
        ok: false,
        error: 'Header mismatch tai cot ' + (i + 1) + ': nhan "' + actual + '", can "' + EXPECTED_HEADERS[i] + '"'
      };
    }
  }
  return { ok: true };
}

function buildNotes(payload, answers, contact) {
  var lines = [];
  lines.push('PageUrl: ' + val(payload.pageUrl));
  lines.push('UserAgent: ' + val(payload.userAgent));
  lines.push('CompletedAt: ' + val(payload.completedAt));
  lines.push('Resources: ' + val(payload.resources));
  lines.push('Consent: ' + (payload.consent === true ? 'TRUE' : 'FALSE'));
  lines.push('ContactInfo: ' + val(payload.contactInfo));

  if (isOwner(payload)) {
    lines.push('Channel: ' + joinArr(answers.Channel));
    lines.push('TimeCost: ' + joinArr(answers.TimeCost));
    lines.push('CurrentTool: ' + val(answers.CurrentTool));
    lines.push('Interest: ' + val(answers.Interest));
    lines.push('Pilot: ' + val(answers.Pilot));
  } else {
    lines.push('TravelHistory: ' + val(answers.TravelHistory));
    lines.push('BookingChannel: ' + joinArr(answers.BookingChannel));
    lines.push('SlowReplyLoss: ' + val(answers.SlowReplyLoss));
    lines.push('Retention: ' + val(answers.Retention));
    lines.push('Repeat: ' + joinArr(answers.Repeat));
  }

  // Backup JSON rút gọn (không tạo cột RawJson riêng).
  lines.push('JSON: ' + JSON.stringify(payload));
  return lines.join('\n');
}

// ===== ENDPOINTS =====
function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      return jsonOut({ ok: false, error: 'Khong tim thay sheet/tab: ' + SHEET_NAME });
    }

    var headerCheck = validateHeaders(sheet);
    if (!headerCheck.ok) {
      return jsonOut({ ok: false, error: headerCheck.error });
    }

    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    var answers = payload.answers || {};
    var contact = payload.contact || {};
    var owner = isOwner(payload);

    var score = calculateLeadScore(payload, answers);
    var contactPermission = answers.LeadConsent || (payload.consent ? 'Có' : 'Không');

    var rowMap = {
      'Survey ID': val(payload.responseId),
      'Submit Date': new Date(),
      'Source': val(payload.source),
      'Segment': val(payload.audienceLabel || payload.audience),
      'Role': owner ? val(answers.Role) : 'Khách hàng',
      'Hotel Type': val(answers.HotelType),
      'Rooms': val(answers.Rooms),
      'Biggest Pain': owner ? joinArr(answers.Pain) : joinArr(answers.B2CPain),
      'Desired Solution': buildDesiredSolution(payload, answers),
      'Tech Readiness 1-5': val(answers.Readiness),
      'Willingness To Pay': val(answers.WTP),
      'Budget Range': val(answers.Budget),
      'Contact Permission': contactPermission,
      'Name': val(contact.name),
      'Phone': val(contact.phone),
      'Hotel/Company': val(contact.hotel),
      'Position': val(contact.role),
      'Lead Score': score,
      'Priority': getPriority(score, payload.audience),
      'Follow-up Status': contactPermission === 'Có' ? 'New' : 'No follow-up',
      'Notes': buildNotes(payload, answers, contact)
    };

    var row = EXPECTED_HEADERS.map(function (key) { return rowMap[key]; });
    sheet.appendRow(row);

    return jsonOut({ ok: true });
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOut({
    ok: true,
    message: 'BBOTech survey endpoint V2 is alive',
    sheetName: SHEET_NAME,
    spreadsheetId: SPREADSHEET_ID,
    expectedColumns: 21,
    headerRow: HEADER_ROW
  });
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
