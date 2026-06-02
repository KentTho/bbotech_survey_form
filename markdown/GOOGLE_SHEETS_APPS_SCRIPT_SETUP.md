# HƯỚNG DẪN CẤU HÌNH GOOGLE SHEETS APPS SCRIPT

> 🛑 **TÀI LIỆU NÀY ĐÃ LỖI THỜI (DEPRECATED) — GIỮ LẠI LÀM LỊCH SỬ.**
> - Bản này dùng Spreadsheet ID cũ (`1TjiP6oB...`, là file .xlsx upload → KHÔNG ghi được) và
>   bộ header 39 cột tự sinh.
> - **KHÔNG dùng hướng dẫn/header trong file này nữa.**
> - Hãy dùng bản mới: **[`GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md`](./GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md)**
>   (Google Sheet gốc mới, ghi đúng 21 cột hiện có, có validate header strict).

Tài liệu này hướng dẫn tạo một **Apps Script Web App** đóng vai trò endpoint nhận dữ liệu
khảo sát từ frontend (Next.js static export) và ghi vào Google Sheet.

> ⚠️ **QUAN TRỌNG:** Link edit của Google Sheet **KHÔNG** phải là API endpoint.
> Frontend chỉ gửi dữ liệu tới **Apps Script Web App URL** (dạng `.../exec`).
> Không bao giờ nhúng secret/credentials vào frontend.

---

## 1. Mục tiêu

- Ghi mỗi lượt khảo sát thành **1 dòng mới** vào Google Sheet, tab `09_Response_Tracker`.
- Tách các trường quan trọng thành cột riêng (Audience, Contact, các câu trả lời...).
- Lưu thêm cột `RawJson` chứa toàn bộ payload gốc để backup/đối chiếu.

---

## 2. Thông tin sheet

| Thông tin       | Giá trị                                  |
| --------------- | ---------------------------------------- |
| Spreadsheet ID  | `1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9`      |
| Sheet name      | `09_Response_Tracker`                    |

Spreadsheet ID được lấy từ link gốc:

```
https://docs.google.com/spreadsheets/d/1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9/edit
                                        └──────────── Spreadsheet ID ───────────┘
```

> Tab `09_Response_Tracker` **phải tồn tại sẵn** trong Spreadsheet. Nếu chưa có, hãy tạo tab
> trống với đúng tên này trước khi deploy. Apps Script sẽ tự thêm dòng header nếu sheet trống.

---

## 3. Cách tạo Apps Script

1. Mở Google Sheet (file có ID ở trên).
2. Vào menu **Extensions → Apps Script**.
3. Xóa code mẫu, **dán toàn bộ code ở mục 4** vào file `Code.gs`.
4. Bấm **Save** (biểu tượng đĩa hoặc `Ctrl + S`).
5. Bấm **Deploy → New deployment**.
6. Chọn loại deployment: bấm bánh răng ⚙ → **Web app**.
7. Cấu hình:
   - **Description:** `BBOTech Survey Endpoint` (tùy ý).
   - **Execute as:** `Me` (chạy dưới quyền chủ sheet — không cần OAuth phía frontend).
   - **Who has access:** `Anyone` (để frontend public gọi được).
8. Bấm **Deploy**, chấp nhận cấp quyền (Authorize access) nếu được hỏi.
9. Copy **Web App URL** — phải có dạng kết thúc bằng `/exec`:

   ```
   https://script.google.com/macros/s/AKfycbxxxxxxxxxxxxxxxxx/exec
   ```

10. Dán URL đó vào file `.env.local` hoặc `.env` của project:

    ```
    NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/AKfycbxxxx/exec
    ```

11. Chạy lại `pnpm dev` (hoặc build lại) để biến môi trường có hiệu lực.

> Mỗi lần sửa code Apps Script, cần **Deploy → Manage deployments → Edit → New version**
> để cập nhật bản chạy. URL `/exec` không đổi nếu chỉ tạo version mới trên deployment cũ.

---

## 4. Code Apps Script hoàn chỉnh

Dán nguyên đoạn dưới đây vào `Code.gs`:

```javascript
// ===== CẤU HÌNH =====
var SPREADSHEET_ID = '1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9';
var SHEET_NAME = '09_Response_Tracker';

// Thứ tự cột header trong sheet. Đổi thứ tự ở đây sẽ đổi thứ tự ghi.
var HEADERS = [
  'SubmittedAt',
  'ResponseId',
  'Audience',
  'AudienceLabel',
  'Source',
  'UserAgent',
  'PageUrl',
  'CompletedAt',
  'Resources',
  'Consent',
  'ContactName',
  'ContactPhone',
  'ContactHotel',
  'ContactRole',
  'HotelType',
  'Rooms',
  'Role',
  'Channel',
  'Pain',
  'TimeCost',
  'CurrentTool',
  'Readiness',
  'Interest',
  'Solution',
  'Pilot',
  'WTP',
  'Budget',
  'LeadConsent',
  'TravelHistory',
  'BookingChannel',
  'Criteria',
  'B2CPain',
  'SlowReplyLoss',
  'ResponseTime',
  'BotAcceptance',
  'Retention',
  'Repeat',
  'OpenInsight',
  'RawJson'
];

function doPost(e) {
  try {
    // 1) Mở đúng Spreadsheet và sheet
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      throw new Error('Khong tim thay sheet/tab: ' + SHEET_NAME);
    }

    // 2) Tự thêm header nếu sheet đang trống
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
    }

    // 3) Đọc payload JSON từ frontend (gửi dạng text/plain)
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    var answers = payload.answers || {};
    var contact = payload.contact || {};

    // Helper: join mảng (multiple choice) bằng "; "
    function joinArr(value) {
      if (Array.isArray(value)) {
        return value.join('; ');
      }
      return value == null ? '' : value;
    }

    function val(value) {
      return value == null ? '' : value;
    }

    // 4) Map dữ liệu vào đúng thứ tự HEADERS
    var rowMap = {
      SubmittedAt: new Date(),
      ResponseId: val(payload.responseId),
      Audience: val(payload.audience),
      AudienceLabel: val(payload.audienceLabel),
      Source: val(payload.source),
      UserAgent: val(payload.userAgent),
      PageUrl: val(payload.pageUrl),
      CompletedAt: val(payload.completedAt),
      Resources: val(payload.resources),
      Consent: payload.consent === true ? 'TRUE' : 'FALSE',
      ContactName: val(contact.name),
      ContactPhone: val(contact.phone),
      ContactHotel: val(contact.hotel),
      ContactRole: val(contact.role),
      HotelType: val(answers.HotelType),
      Rooms: val(answers.Rooms),
      Role: val(answers.Role),
      Channel: joinArr(answers.Channel),
      Pain: joinArr(answers.Pain),
      TimeCost: joinArr(answers.TimeCost),
      CurrentTool: val(answers.CurrentTool),
      Readiness: val(answers.Readiness),
      Interest: val(answers.Interest),
      Solution: joinArr(answers.Solution),
      Pilot: val(answers.Pilot),
      WTP: val(answers.WTP),
      Budget: val(answers.Budget),
      LeadConsent: val(answers.LeadConsent),
      TravelHistory: val(answers.TravelHistory),
      BookingChannel: joinArr(answers.BookingChannel),
      Criteria: joinArr(answers.Criteria),
      B2CPain: joinArr(answers.B2CPain),
      SlowReplyLoss: val(answers.SlowReplyLoss),
      ResponseTime: val(answers.ResponseTime),
      BotAcceptance: val(answers.BotAcceptance),
      Retention: val(answers.Retention),
      Repeat: joinArr(answers.Repeat),
      OpenInsight: val(answers.OpenInsight),
      RawJson: JSON.stringify(payload)
    };

    // 5) Build row theo đúng thứ tự HEADERS rồi append
    var row = HEADERS.map(function (key) {
      return rowMap[key];
    });
    sheet.appendRow(row);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Cho phép kiểm tra nhanh endpoint bằng trình duyệt (GET).
function doGet() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, message: 'BBOTech survey endpoint is alive' }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 5. Cột dữ liệu (header) sẽ tạo trong sheet

Apps Script tự ghi header ở dòng 1 nếu sheet trống, gồm các cột:

```
SubmittedAt | ResponseId | Audience | AudienceLabel | Source | UserAgent | PageUrl |
CompletedAt | Resources | Consent | ContactName | ContactPhone | ContactHotel |
ContactRole | HotelType | Rooms | Role | Channel | Pain | TimeCost | CurrentTool |
Readiness | Interest | Solution | Pilot | WTP | Budget | LeadConsent | TravelHistory |
BookingChannel | Criteria | B2CPain | SlowReplyLoss | ResponseTime | BotAcceptance |
Retention | Repeat | OpenInsight | RawJson
```

Quy ước map dữ liệu:

- **Multiple choice** (mảng) như `Channel`, `Pain`, `TimeCost`, `Solution`, `BookingChannel`,
  `Criteria`, `B2CPain`, `Repeat` → được nối bằng `; `.
- **Object `contact`** → tách thành `ContactName`, `ContactPhone`, `ContactHotel`, `ContactRole`.
- **`RawJson`** → lưu nguyên payload JSON để backup, đối chiếu khi cần.
- **`SubmittedAt`** → thời điểm server (Apps Script) nhận request.
- **`CompletedAt`** → thời điểm người dùng bấm gửi (do frontend gửi lên, ISO string).

---

## 6. Phản hồi của Apps Script

- Thành công: `{"ok": true}`
- Lỗi: `{"ok": false, "error": "..."}`

> Frontend gọi bằng `fetch(..., { mode: "no-cors" })` nên **không đọc được nội dung response**
> (response là opaque). Đây là giới hạn CORS bình thường của Apps Script Web App.
> Việc xác nhận dữ liệu đã ghi thành công được thực hiện bằng cách **kiểm tra trực tiếp tab
> `09_Response_Tracker`** trong Google Sheet.

---

## 7. Bảo mật

- Apps Script chạy dưới quyền **chủ sở hữu** (Execute as: Me) → không cần đưa OAuth token,
  API key hay private credential nào vào frontend.
- Frontend chỉ biết URL `/exec` public (lưu trong biến `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`).
- Spreadsheet ID chỉ nằm trong code Apps Script (server-side), không bắt buộc xuất hiện ở
  frontend.
