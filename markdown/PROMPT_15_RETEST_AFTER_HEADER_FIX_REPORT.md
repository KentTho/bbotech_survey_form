# PROMPT 15 — BÁO CÁO RETEST SAU KHI FIX HEADER SHEET

## 1. Tóm tắt nhiệm vụ
Retest việc ghi dữ liệu thật vào tab `09_Response_Tracker` sau khi (được cho là) đã fix header.
Kết quả: env đúng, GET endpoint xác nhận V2 đang chạy (`expectedColumns:21`), **nhưng POST
Owner/Guest VẪN trả `ok:false` với CÙNG lỗi `Header mismatch tại cột 1`** giống hệt Prompt 14.
→ **Bản fix header CHƯA thực sự có hiệu lực** trên sheet/deployment đang dùng. Kết luận:
**BLOCKED**. Type-check + build vẫn PASS.

## 2. Header fix đã áp dụng
- **Trên thực tế: CHƯA có hiệu lực** (cả Cách A lẫn Cách B đều chưa tác động tới hệ thống đang chạy).
- Bằng chứng từ phản hồi POST: lỗi vẫn là
  `nhan "09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật", can "Survey ID"`.
  - Code đang chạy vẫn đọc **dòng 1** → **Cách B (HEADER_ROW=2 + Deploy New version) CHƯA được
    deploy**.
  - Dòng 1 vẫn là **tiêu đề** → **Cách A (đưa 21 header lên dòng 1) CHƯA được áp dụng** (hoặc
    áp dụng trên file/sheet khác).
- **Header thật hiện vẫn KHÔNG nằm ở dòng 1** (nhiều khả năng ở dòng 2 — cần user xác nhận).

## 3. Endpoint GET
- **HTTP 200**, response:
  ```json
  {"ok":true,"message":"BBOTech survey endpoint V2 is alive","sheetName":"09_Response_Tracker","spreadsheetId":"1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI","expectedColumns":21}
  ```
- `ok:true`: ✔
- `expectedColumns:21`: ✔ (đang chạy code V2)
- `spreadsheetId` mới đúng: ✔
- URL (mask): `https://script.google.com/macros/s/AKfycbwgQp…mj9ZM/exec` (kết thúc `/exec`).

> Lưu ý: GET không phân biệt được Cách B đã deploy hay chưa (doGet luôn trả 21). Chỉ POST mới lộ
> ra việc `validateHeaders` vẫn đọc dòng 1.

## 4. Owner POST
- **HTTP 200**, response:
  ```json
  {"ok":false,"error":"Header mismatch tai cot 1: nhan \"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật\", can \"Survey ID\""}
  ```
- `ok:false` — **KHÔNG ghi dòng** (strict validation chặn).

## 5. Guest POST
- **HTTP 200**, response: **cùng lỗi** Header mismatch tại cột 1.
- `ok:false` — **KHÔNG ghi dòng**.

## 6. Sheet check
- **Chưa có dòng mới nào** được ghi (cả 2 POST `ok:false`) → chưa thể kiểm tra mapping cột.
- Sau khi fix header **thật sự có hiệu lực** và POST trả `ok:true`, mở tab `09_Response_Tracker`
  kiểm tra:
  - **Owner row:** Segment = "Chủ / Quản lý / Nhân sự khách sạn"; Role có dữ liệu; Hotel Type,
    Rooms, Biggest Pain, Desired Solution có dữ liệu; Lead Score = **100** (payload P15 owner:
    30+20+20+15+15); Priority = **Hot**; Follow-up Status = **New**.
  - **Guest row:** Segment = "Khách từng đặt / lưu trú khách sạn"; Role = **Khách hàng**;
    Priority = **Research**; Notes có dữ liệu B2C (TravelHistory, BookingChannel, ResponseTime…).

## 7. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled`, `✓ Generating static pages (37/37)`, `✓ Exporting (2/2)`).

## 8. File đã sửa
- **Tạo mới:** `markdown/PROMPT_15_RETEST_AFTER_HEADER_FIX_REPORT.md` (báo cáo này).
- **KHÔNG sửa** frontend, mapping 21 cột, code V2, hay file nào khác — lỗi nằm ở layout/deployment
  phía Google, không phải code dự án.

## 9. Những phần không đụng tới
- [x] Không sửa frontend (`survey-flow/index.tsx`) — không có bug frontend.
- [x] Không đổi mapping 21 cột.
- [x] Không thêm/xóa cột trong Sheet.
- [x] Không hardcode URL vào code.
- [x] Không sửa Header / Hero / Why / Survey / About / Footer.
- [x] Không đổi font / màu / layout.
- [x] Không git commit / push.

## 10. Kết luận
**BLOCKED**

- Env + deployment V2 + endpoint GET: **OK**.
- Type-check + build: **PASS**.
- **Chặn:** header fix chưa thực sự có hiệu lực → POST Owner/Guest vẫn `Header mismatch` →
  chưa đạt điều kiện PASS 2, 3, 4.

## 11. Bước tiếp theo & mục tiêu
**Bước tiếp theo (user cần làm CHÍNH XÁC một trong hai, rồi báo lại để retest):**

**Cách A — Đưa 21 header lên dòng 1 (đơn giản, không đụng code):**
1. Mở tab `09_Response_Tracker`.
2. **Xóa hẳn dòng tiêu đề** `"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật"` (click chuột
   phải số dòng 1 → Delete row), sao cho **dòng 1 chính là** `Survey ID | Submit Date | ... | Notes`.
3. Lưu. Không cần deploy lại. Báo lại để retest.

**Cách B — Giữ dòng tiêu đề, sửa code đọc HEADER_ROW (phải DEPLOY NEW VERSION):**
1. Mở **Extensions → Apps Script** của đúng Google Sheet mới.
2. Thêm `var HEADER_ROW = 2;` (đúng dòng chứa 21 header) và sửa `validateHeaders()` đọc
   `sheet.getRange(HEADER_ROW, 1, 1, EXPECTED_HEADERS.length)` (patch đầy đủ ở
   `PROMPT_14_VERIFY_APPS_SCRIPT_V2_REAL_WRITE_REPORT.md` mục 8).
3. **BẮT BUỘC: Deploy → Manage deployments → Edit (bút chì) → Version: New version → Deploy.**
   (Chỉ Save thôi sẽ KHÔNG cập nhật bản Web App đang chạy — đây là lỗi hay gặp.)
4. Báo lại để retest.

> Kiểm tra nhanh: trước khi báo retest, user có thể tự xác nhận header đang ở dòng nào bằng cách
> mở tab và nhìn dòng đầu tiên có chứa đúng "Survey ID".

**Mục tiêu:**
Sau khi header fix có hiệu lực, POST Owner + Guest trả `ok:true` và tab `09_Response_Tracker`
nhận đúng 2 dòng mới vào đúng 21 cột (Owner có Lead Score/Priority/Follow-up; Guest Role=Khách
hàng, Priority=Research).
