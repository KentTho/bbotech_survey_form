# PROMPT 12 — BÁO CÁO TEST SUBMIT GOOGLE SHEETS THẬT

## 1. Tóm tắt nhiệm vụ
Kiểm thử đường đẩy dữ liệu khảo sát thật từ frontend tới Apps Script Web App rồi ghi vào tab
`09_Response_Tracker`. Đã xác nhận env có Web App URL, type-check + build PASS, dev server chạy
được, endpoint reachable và Apps Script **chạy đúng code** (trả JSON đúng format). Tuy nhiên
**ghi dữ liệu THẤT BẠI** với lỗi gốc: file đích là **Excel (.xlsx) upload lên Drive**, không
phải Google Sheet gốc, nên `SpreadsheetApp.openById()` không thao tác được.

Kết luận: **NEEDS REVIEW** — frontend + endpoint đã đấu nối đúng, nhưng phải **chuyển file đích
sang Google Sheet gốc** thì dữ liệu mới ghi được. Không sửa frontend (không có bug frontend).

## 2. Env Web App URL
- **Có:** ✔ Biến `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` tồn tại trong cả `.env.local` và `.env`.
- **Kết thúc bằng `/exec`:** ✔ Có.
- **URL (mask):** `https://script.google.com/macros/s/AKfycbwN…AOu9bMTn/exec`
- Dev server log xác nhận đã nạp: `Environments: .env.local, .env`.

## 3. File đã đọc
- `.env.local`
- `.env`
- `.env.example`
- `src/app/components/home/survey-flow/index.tsx`
- `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`
- `markdown/PROMPT_11_AUDIENCE_LOCK_GOOGLE_SHEETS_REPORT.md`

## 4. File đã sửa
- **KHÔNG sửa file nào.** Test không phát hiện bug frontend. Root cause nằm ở phía Google
  (file đích là .xlsx, không phải Google Sheet gốc) — ngoài phạm vi code frontend.

## 5. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (static export build thành công).
- `pnpm dev`: **PASS** — server Ready tại `http://localhost:3000`, homepage trả HTTP **200**.

## 6. Test Owner
- **Đã chọn owner chưa:** Có (payload `audience="owner"`, audienceLabel đúng).
- **Đã submit chưa:** Có — gửi POST thật tới endpoint với payload mô phỏng **chính xác** cấu
  trúc `buildSubmissionPayload()` (responseId, answers B1–B15 đầy đủ, B14="Có" + B15 Contact,
  resources, consent=true).
- **UI có Thanks không:** Vì frontend dùng `mode:"no-cors"`, `fetch` luôn resolve (response
  opaque) nên UI **sẽ chuyển Thanks** bất kể server ghi thành công hay không. Đây là hành vi
  đã thiết kế ở Prompt 11.
- **Phản hồi thật của endpoint (đọc qua curl):**
  `{"ok":false,"error":"Error: This operation is not supported for this document: 1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9"}`
- **Ghi chú:** Apps Script chạy tới được nhánh `catch` và trả JSON đúng format → code script
  đúng; lỗi là ở bước mở document.

## 7. Test Guest
- **Đã chọn guest chưa:** Có (payload `audience="guest"`).
- **Đã submit chưa:** Có — gửi POST thật với payload C1–C10 đầy đủ (multiple choice dạng mảng).
- **UI có Thanks không:** Tương tự Owner — no-cors nên UI chuyển Thanks.
- **Phản hồi thật:** Lần 1 trả HTTP 500 "Thời gian chạy JavaScript đã thoát đột ngột"
  (runtime hiccup tạm thời của Apps Script). **Retry** trả về cùng lỗi gốc:
  `{"ok":false,"error":"Error: This operation is not supported for this document: 1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9"}`
- **Ghi chú:** Cả Owner và Guest đều dừng ở cùng một lỗi → root cause nhất quán.

## 8. Google Sheet check
- Vì ghi thất bại, **không có dòng nào được append** vào tab `09_Response_Tracker` (kết quả
  `ok:false`). Do đó **không có test row rác** trong sheet.
- Sau khi user khắc phục (xem mục 9), cần mở tab `09_Response_Tracker` và kiểm tra các cột:
  `ResponseId`, `Audience`, `AudienceLabel`, `CompletedAt`, `RawJson`, và `HotelType` (owner)
  hoặc `TravelHistory` (guest).

## 9. Lỗi & Root cause
### Lỗi quan sát
- Endpoint trả: `{"ok":false,"error":"...This operation is not supported for this document: 1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9"}`

### Root cause
- File đích **không phải Google Sheet gốc** mà là một **file Microsoft Excel (.xlsx) được
  upload lên Google Drive**. Bằng chứng:
  1. Link gốc chứa tham số `rtpof=true&sd=true` — chữ ký đặc trưng của file Office upload.
  2. `SpreadsheetApp.openById()` chỉ làm việc với Google Sheet gốc; gặp .xlsx sẽ ném đúng lỗi
     "This operation is not supported for this document".

### Fix applied (phía code)
- **Không có** — đây **không phải bug frontend**, cũng không phải lỗi logic Apps Script. Sửa
  code không giải quyết được. Frontend giữ nguyên (đúng phạm vi: chỉ sửa frontend nếu có bug
  submit rõ ràng — ở đây không có).

### Cách khắc phục (USER cần làm — phía Google)
Chọn **một** trong hai cách:

**Cách A (khuyến nghị): Chuyển .xlsx → Google Sheet gốc**
1. Mở file trên Google Drive bằng Google Sheets.
2. Vào **File → Save as Google Sheets** (Lưu dưới dạng Google Sheets).
3. File mới sẽ có **Spreadsheet ID MỚI** (khác ID hiện tại).
4. Mở Spreadsheet mới, đảm bảo có tab tên đúng `09_Response_Tracker`.
5. Trong Apps Script, đổi `var SPREADSHEET_ID = '...';` thành **ID mới**.
6. **Deploy → Manage deployments → Edit → New version** để cập nhật bản chạy (URL `/exec`
   không đổi).
7. Submit lại và kiểm tra tab `09_Response_Tracker`.

**Cách B: Dùng Apps Script gắn (bound) trực tiếp**
1. Tạo Google Sheet gốc mới, thêm tab `09_Response_Tracker`.
2. Trong chính sheet đó, vào **Extensions → Apps Script**, dán code.
3. Thay `SpreadsheetApp.openById(...)` bằng `SpreadsheetApp.getActiveSpreadsheet()` (script
   bound chạy ngay trên sheet chứa nó).
4. Deploy Web app, copy URL `/exec` mới, dán lại vào `.env.local` / `.env`.

### Validation sau fix
- Sau khi user áp dụng Cách A hoặc B, có thể test lại bằng cách submit qua UI (mode no-cors)
  rồi kiểm tra trực tiếp tab sheet, hoặc gửi POST đọc được `{"ok":true}` qua công cụ như curl.

## 10. Những phần không đụng tới
- [x] Không sửa Header / Hero / Why / About / Footer.
- [x] Không đổi font Montserrat.
- [x] Không đổi màu brand.
- [x] Không đổi layout survey.
- [x] Không sửa logic survey (`survey-flow/index.tsx` giữ nguyên).
- [x] Không hardcode Web App URL vào code (chỉ đọc qua biến env).
- [x] Không đưa secret vào frontend.
- [x] Không dùng Google Sheet edit link làm endpoint.
- [x] Không fake success.
- [x] Không cài package.
- [x] Không git commit / push.

## 11. Kết luận
**NEEDS REVIEW**

- Frontend + endpoint env + Apps Script code: **đúng và sẵn sàng**.
- Type-check + build + dev: **PASS**.
- **Chặn duy nhất:** file đích là .xlsx (không phải Google Sheet gốc) → `openById` thất bại.
  User cần chuyển sang Google Sheet gốc (Cách A) hoặc dùng script bound (Cách B). Sau đó submit
  sẽ ghi được vào `09_Response_Tracker`.

## 12. Screenshot
**Không tạo được** screenshot (`PROMPT_12_OWNER_SUBMIT_THANKS.png`,
`PROMPT_12_GUEST_SUBMIT_THANKS.png`, `PROMPT_12_SHEET_RESULT_CHECKLIST.png`).
- **Lý do:** Phiên CLI không có công cụ điều khiển trình duyệt headless để render/chụp; và do
  ghi sheet đang thất bại nên chưa có kết quả sheet thật để chụp. Tuân thủ nguyên tắc "không
  tạo ảnh giả". Đề nghị user tự chụp sau khi khắc phục file đích.

## 13. Bước tiếp theo & mục tiêu
**Bước tiếp theo:**
1. User chuyển file đích từ .xlsx sang **Google Sheet gốc** (Cách A) hoặc dùng script bound
   (Cách B) — xem mục 9.
2. Cập nhật `SPREADSHEET_ID` (và/hoặc Web App URL) tương ứng, deploy version mới.
3. Submit lại Owner + Guest, kiểm tra tab `09_Response_Tracker` có ≥ 2 dòng mới với đủ cột
   `ResponseId / Audience / AudienceLabel / CompletedAt / RawJson / HotelType|TravelHistory`.
4. Sau khi ghi thành công: kiểm tra mapping cột và chuẩn hóa format dữ liệu nếu cần.

**Mục tiêu:**
Xác nhận web đã submit khảo sát thật vào đúng tab `09_Response_Tracker` của một Google Sheet
gốc, dữ liệu Owner/Guest map đúng cột.
