# PROMPT 15B — BÁO CÁO PATCH HEADER_ROW = 3 VÀ RETEST

## 1. Tóm tắt nhiệm vụ
Patch Apps Script V2 để **đọc 21 header ở dòng 3** (thay vì dòng 1), deploy New version, rồi
retest ghi dữ liệu thật (Owner + Guest) vào tab `09_Response_Tracker`.

Kết quả:
- ✅ **Đã patch code V2**: thêm `HEADER_ROW = 3`, `validateHeaders()` đọc dòng 3, `doGet()` trả
  thêm `headerRow: 3`.
- ✅ **Type-check + build PASS**.
- ⚠️ **Bước Deploy New version là thao tác THỦ CÔNG trên trình duyệt** (Extensions → Apps Script
  → dán code → Deploy → Manage deployments → New version). Claude Code CLI **không có quyền**
  chỉnh/deploy project Apps Script trên cloud (không có `clasp`, không có `.gs` trong repo).
- ⚠️ Vì chưa deploy, endpoint LIVE **vẫn chạy code cũ**: GET chưa có `headerRow:3`; POST Owner/Guest
  vẫn `Header mismatch tại cột 1`.

→ **Kết luận: NEEDS REVIEW / BLOCKED ở bước deploy.** Code đã sẵn sàng; cần user deploy rồi báo lại
để retest (curl đã chuẩn bị sẵn).

## 2. Root cause
- Tab `09_Response_Tracker` có bố cục:
  - **Dòng 1**: tiêu đề lớn `09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật`
  - **Dòng 2**: trống
  - **Dòng 3**: 21 header thật (`Survey ID`, `Submit Date`, `Source`, …, `Notes`)
- Code V2 cũ `validateHeaders()` đọc **dòng 1** → so khớp `"09. Response Tracker…"` với `"Survey ID"`
  → luôn `Header mismatch tại cột 1` → strict validation **chặn ghi**.
- Prompt 15 đoán header ở dòng 2 (`HEADER_ROW = 2`) — **sai dòng**. Prompt 15B xác định đúng là
  **dòng 3** và patch `HEADER_ROW = 3`.

## 3. Apps Script patch
Đã sửa trong `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md` và xuất bản sạch để dán:
`markdown/apps-script/Code.v2.HEADER_ROW_3.gs`.

- **`HEADER_ROW = 3`** ✅ — thêm ngay dưới `SHEET_NAME`:
  ```javascript
  var SHEET_NAME = '09_Response_Tracker';
  // Dòng 1 là tiêu đề lớn → header thật ở DÒNG 3.
  var HEADER_ROW = 3;
  ```
- **`validateHeaders()` đọc dòng 3** ✅:
  ```javascript
  var headerRow = sheet
    .getRange(HEADER_ROW, 1, 1, EXPECTED_HEADERS.length)
    .getValues()[0];
  ```
  (không còn đọc `getRange(1, …)`)
- **`doGet()` trả `headerRow: 3`** ✅:
  ```javascript
  function doGet() {
    return jsonOut({
      ok: true,
      message: 'BBOTech survey endpoint V2 is alive',
      sheetName: SHEET_NAME,
      spreadsheetId: SPREADSHEET_ID,
      expectedColumns: 21,
      headerRow: HEADER_ROW   // = 3
    });
  }
  ```
- **Không** đổi `EXPECTED_HEADERS` (vẫn 21 cột, đúng thứ tự). **Không** thêm/xóa header. **Không**
  đụng mapping `rowMap` / logic Lead Score / Priority.

## 4. Deployment
- **ĐÃ deploy New version chưa?** ❌ **CHƯA** — bước này phải làm thủ công trên trình duyệt; CLI
  không thực hiện được. Bằng chứng: GET LIVE hiện tại **chưa có** `headerRow` (xem mục 5).
- **URL (mask):** `https://script.google.com/macros/s/AKfycbwgQp…mj9ZM/exec` (kết thúc `/exec`).
- **Việc user cần làm để hoàn tất:**
  1. Mở đúng Google Sheet (ID `1Nd8-…JWvfI`) → **Extensions → Apps Script**.
  2. Xóa code cũ trong `Code.gs`, dán **toàn bộ** `markdown/apps-script/Code.v2.HEADER_ROW_3.gs`.
  3. **Deploy → Manage deployments → Edit (bút chì) → Version: New version → Deploy.**
     (Chỉ **Save** sẽ KHÔNG cập nhật bản Web App đang chạy — đây là lỗi hay gặp ở Prompt 14/15.)
  4. Giữ nguyên deployment cũ → URL `/exec` không đổi → không cần sửa `.env`.
  5. Báo lại để chạy retest (mục 5–8).

## 5. GET endpoint
Test LIVE tại thời điểm báo cáo (sau khi patch repo, **trước khi** user deploy):
```json
{"ok":true,"message":"BBOTech survey endpoint V2 is alive","sheetName":"09_Response_Tracker","spreadsheetId":"1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI","expectedColumns":21}
```
- `ok:true`? ✅
- `expectedColumns:21`? ✅
- `headerRow:3`? ❌ **KHÔNG có** → xác nhận deployment **chưa chạy code mới**.

> Sau khi user Deploy New version, GET phải xuất hiện `"headerRow":3`. Nếu vẫn thiếu → chưa deploy
> đúng (mới Save, hoặc deploy nhầm project).

## 6. POST Owner
Payload Owner (Lead Score kỳ vọng = 100: LeadConsent 30 + WTP 20 + Readiness=5 20 + Interest 15 +
Budget 15), gửi LIVE:
```json
{"ok":false,"error":"Header mismatch tai cot 1: nhan \"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật\", can \"Survey ID\""}
```
- `ok`: **false** ❌
- **Lỗi:** vẫn đọc **dòng 1** (code cũ) → chưa ghi dòng. Sẽ hết lỗi sau khi deploy `HEADER_ROW=3`.

## 7. POST Guest
Payload Guest (B2C), gửi LIVE:
```json
{"ok":false,"error":"Header mismatch tai cot 1: nhan \"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật\", can \"Survey ID\""}
```
- `ok`: **false** ❌
- **Lỗi:** cùng nguyên nhân — code đang chạy chưa phải bản `HEADER_ROW=3`.

## 8. Sheet check
- **Dòng Owner mới?** ❌ Chưa (POST `ok:false`).
- **Dòng Guest mới?** ❌ Chưa (POST `ok:false`).
- Mapping cột chính **sẽ kiểm tra sau khi deploy + POST `ok:true`**:
  - **Owner:** Segment = `Chủ / Quản lý / Nhân sự khách sạn`; Role = `Chủ khách sạn`; Hotel Type =
    `Khách sạn 3 sao`; Rooms = `20-50`; Lead Score = **100**; Priority = **Hot**;
    Follow-up Status = **New** (Contact Permission = `Có`).
  - **Guest:** Segment = `Khách từng đặt / lưu trú khách sạn`; Role = **Khách hàng**;
    Priority = **Research**; Lead Score trống; Notes chứa dữ liệu B2C (TravelHistory,
    BookingChannel, ResponseTime…).

## 9. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled successfully`, các route static/SSG generate đầy đủ, không lỗi).

## 10. Những phần không đụng tới
- [x] Không sửa frontend (`src/app/components/home/survey-flow/index.tsx`).
- [x] Không đổi mapping 21 cột / `EXPECTED_HEADERS` / `rowMap`.
- [x] Không thêm/xóa cột trong Sheet.
- [x] Không xóa dòng tiêu đề trong Sheet (giữ nguyên, chỉ chỉnh code đọc dòng 3).
- [x] Không sửa Header / Hero / Why / Survey / About / Footer.
- [x] Không đổi font / màu / layout.
- [x] Không hardcode URL vào frontend (vẫn dùng `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`).
- [x] Không git commit / push.

## 11. Kết luận
**NEEDS REVIEW (BLOCKED ở bước deploy thủ công)**

| Điều kiện PASS | Trạng thái |
| --- | --- |
| 1. GET trả `headerRow:3` | ❌ (chờ deploy) |
| 2. Owner POST `ok:true` | ❌ (chờ deploy) |
| 3. Guest POST `ok:true` | ❌ (chờ deploy) |
| 4. Sheet có 2 dòng mới | ❌ (chờ deploy) |
| 5. Mapping đúng 21 cột | ✅ (code đúng, chờ verify dữ liệu) |
| 6. Type-check / build | ✅ PASS |
| 7. Không sửa ngoài scope | ✅ |

Code patch đã hoàn chỉnh và đúng; **chặn duy nhất** là bản Web App trên cloud chưa được user
Deploy New version (CLI không deploy được).

## 12. Bước tiếp theo & mục tiêu
**User làm (1 lần, trên trình duyệt):**
1. Extensions → Apps Script → dán `markdown/apps-script/Code.v2.HEADER_ROW_3.gs`.
2. **Deploy → Manage deployments → Edit → New version → Deploy** (KHÔNG chỉ Save).
3. Tự xác nhận nhanh: mở URL `/exec` trên trình duyệt, phải thấy `"headerRow":3`.
4. Báo lại — tôi sẽ chạy lại GET + POST Owner + POST Guest (curl/Invoke-RestMethod đã sẵn sàng) và
   verify 2 dòng mới + mapping 21 cột.

**Mục tiêu:** Sau deploy, GET trả `headerRow:3`, Owner+Guest POST `ok:true`, tab
`09_Response_Tracker` nhận đúng 2 dòng mới (Owner: Lead Score 100 / Priority Hot / Follow-up New;
Guest: Role Khách hàng / Priority Research) → đạt đủ 7 điều kiện PASS.
