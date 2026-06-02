# HƯỚNG DẪN CẤU HÌNH GOOGLE SHEETS APPS SCRIPT — V2 (21 CỘT)

> Đây là phiên bản **V2**, thay thế bản cũ (`GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`, header 39 cột,
> Spreadsheet ID cũ trỏ file .xlsx). V2 dùng **Google Sheet gốc mới** và ghi đúng **21 cột** đã
> tồn tại sẵn trong tab `09_Response_Tracker`.

> ⚠️ **QUAN TRỌNG:**
> - Link edit của Google Sheet **KHÔNG** phải API endpoint. Frontend chỉ gửi tới **Apps Script
>   Web App URL** (`.../exec`).
> - Apps Script V2 **KHÔNG tự ghi header**, **KHÔNG thêm/xóa/đổi cột**, **KHÔNG tạo cột RawJson
>   riêng**. Nó chỉ append đúng 21 cột hiện có. Backup JSON rút gọn được nhét vào cột `Notes`.

---

## 1. Mục tiêu
- Ghi mỗi lượt khảo sát thành **1 dòng mới** vào Google Sheet gốc mới, tab `09_Response_Tracker`.
- Map dữ liệu payload frontend vào **đúng 21 cột hiện có** (không đổi cấu trúc sheet).
- Tự tính `Lead Score`, `Priority`, `Follow-up Status` cho lead.

## 2. Thông tin sheet

| Thông tin       | Giá trị                                            |
| --------------- | -------------------------------------------------- |
| Spreadsheet ID  | `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`    |
| Sheet name      | `09_Response_Tracker`                              |
| Số cột          | 21 (cố định, không đổi)                            |

Link gốc:
```
https://docs.google.com/spreadsheets/d/1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI/edit
```

## 3. 21 cột hiện có (dòng 3 của tab)

> Dòng 1 là tiêu đề lớn `09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật`; dòng 2 để trống;
> **21 header thật nằm ở dòng 3**. Vì vậy `HEADER_ROW = 3` trong code V2.

```
1. Survey ID            8. Biggest Pain          15. Phone
2. Submit Date          9. Desired Solution      16. Hotel/Company
3. Source              10. Tech Readiness 1-5    17. Position
4. Segment             11. Willingness To Pay    18. Lead Score
5. Role                12. Budget Range          19. Priority
6. Hotel Type          13. Contact Permission    20. Follow-up Status
7. Rooms               14. Name                  21. Notes
```

> Apps Script V2 sẽ **đọc dòng 3 (`HEADER_ROW`) và validate** đúng 21 header này trước khi append.
> Nếu sai/thiếu sẽ trả lỗi `Header mismatch...` và **không ghi gì**.

---

## 4. Các bước cấu hình & deploy

1. Mở **Google Sheet mới** (ID `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`).
2. Mở tab `09_Response_Tracker`.
3. Kiểm tra **dòng 3** đúng 21 cột như mục 3 (không thừa/thiếu/sai chính tả, kể cả dấu cách).
4. Vào menu **Extensions → Apps Script**.
5. Xóa code mẫu, **dán toàn bộ code V2 ở mục 5** vào `Code.gs`.
6. Bấm **Save** (`Ctrl + S`).
7. **Deploy:**
   - Nếu chưa có deployment: **Deploy → New deployment → Web app**.
   - Nếu đã có (từ Prompt 11/12): **Deploy → Manage deployments → Edit (bút chì) → Version: New
     version → Deploy** (giữ nguyên URL `/exec` cũ).
   - Cấu hình: **Execute as: Me**, **Who has access: Anyone**.
8. Copy **Web App URL** dạng `https://script.google.com/macros/s/xxxx/exec`.
9. **Nếu URL thay đổi**, cập nhật `.env.local` (và `.env` nếu muốn):
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/xxxx/exec
   ```
   > Nếu chỉ tạo **New version** trên deployment cũ thì URL `/exec` **không đổi** → không cần
   > sửa env.
10. Restart `pnpm dev` (nếu đang chạy) để env mới có hiệu lực.
11. Submit thử **1 Owner** + **1 Guest** qua web.
12. Mở tab `09_Response_Tracker` kiểm tra có 2 dòng mới, đúng cột.

> Kiểm tra nhanh endpoint bằng trình duyệt (GET): mở URL `/exec`, phải thấy JSON
> `{"ok":true,"sheetName":"09_Response_Tracker","spreadsheetId":"1Nd8-...","expectedColumns":21,"headerRow":3}`.
> Nếu **không thấy `headerRow:3`** nghĩa là bản Web App đang chạy code cũ → chưa Deploy New version.

---

## 5. Code Apps Script V2 hoàn chỉnh

Dán nguyên đoạn dưới đây vào `Code.gs`:

```javascript
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
```

---

## 6. Bảng mapping 21 cột

| # | Cột sheet              | Nguồn dữ liệu payload                                              | Ghi chú |
| - | ---------------------- | ----------------------------------------------------------------- | ------- |
| 1 | Survey ID              | `payload.responseId`                                              | `BBO-...` |
| 2 | Submit Date            | `new Date()`                                                      | Giờ server Apps Script |
| 3 | Source                 | `payload.source`                                                  | `bbotech-vung-tau-hotel-survey` |
| 4 | Segment                | `payload.audienceLabel || payload.audience`                       | Nhóm đối tượng |
| 5 | Role                   | Owner: `answers.Role` · Guest: `"Khách hàng"`                     | |
| 6 | Hotel Type             | `answers.HotelType || ""`                                         | Guest để trống |
| 7 | Rooms                  | `answers.Rooms || ""`                                             | Guest để trống |
| 8 | Biggest Pain           | Owner: `answers.Pain` · Guest: `answers.B2CPain` (array → `; `)   | |
| 9 | Desired Solution       | Owner: `answers.Solution` · Guest: tổng hợp Criteria/ResponseTime/BotAcceptance/OpenInsight | array → `; ` |
| 10| Tech Readiness 1-5     | `answers.Readiness || ""`                                         | |
| 11| Willingness To Pay     | `answers.WTP || ""`                                               | |
| 12| Budget Range           | `answers.Budget || ""`                                            | |
| 13| Contact Permission     | `answers.LeadConsent || (payload.consent ? "Có" : "Không")`       | |
| 14| Name                   | `payload.contact.name || ""`                                      | guard null |
| 15| Phone                  | `payload.contact.phone || ""`                                     | guard null |
| 16| Hotel/Company          | `payload.contact.hotel || ""`                                     | guard null |
| 17| Position               | `payload.contact.role || ""`                                      | guard null |
| 18| Lead Score             | `calculateLeadScore()`                                            | Owner tính điểm, Guest `""` |
| 19| Priority               | `getPriority(score, audience)`                                    | Owner: Hot/Warm/Cold · Guest: Research |
| 20| Follow-up Status       | Contact Permission = "Có" → `"New"`, ngược lại `"No follow-up"`   | |
| 21| Notes                  | PageUrl, UserAgent, CompletedAt, Resources, Consent, ContactInfo, field phụ B2B/B2C + JSON backup rút gọn | Không tạo cột RawJson riêng |

---

## 7. Logic Lead Score & Priority

**Lead Score (chỉ Owner; Guest = `""`):**
- `+30` nếu `LeadConsent === "Có"`
- `+20` nếu `WTP` là `"Có"` hoặc `"Có, nếu thấy hiệu quả"`
- `+20` nếu `Readiness` là `4` hoặc `5`
- `+15` nếu `Interest` là `"Rất quan tâm"` hoặc `"Có quan tâm"`
- `+15` nếu `Budget` có giá trị và **khác** `"Dưới 500.000đ"`
- Điểm tối đa: `100`.

**Priority:**
- Owner: `Hot` nếu score ≥ 70 · `Warm` nếu score ≥ 40 · `Cold` nếu thấp hơn.
- Guest: `Research`.

**Follow-up Status:**
- `Contact Permission === "Có"` → `New`
- Ngược lại → `No follow-up`

---

## 8. Bảo mật
- Apps Script chạy dưới quyền chủ sheet (Execute as: Me) → không cần OAuth/secret phía frontend.
- **Spreadsheet ID chỉ nằm trong code Apps Script (server-side)** — không nhúng vào frontend.
- Frontend chỉ dùng biến `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` (URL `/exec` public).
- Không dùng link edit của Google Sheet làm endpoint.
- Frontend gọi `fetch(..., { mode: "no-cors" })` → không đọc được response. Xác nhận thành công
  bằng cách mở tab `09_Response_Tracker` kiểm tra dòng mới (hoặc test bằng curl đọc `{ok:true}`).
