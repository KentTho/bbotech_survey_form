# PROMPT 13 — BÁO CÁO UPDATE SHEET MỚI + MAPPING 21 CỘT

## 1. Tóm tắt nhiệm vụ
Đã cập nhật Apps Script sang **Google Sheet gốc mới** (ID `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`)
và viết code Apps Script **V2** ghi đúng **21 cột hiện có** của tab `09_Response_Tracker`. Bỏ hoàn
toàn bộ header 39 cột cũ và cột `RawJson` riêng; backup JSON rút gọn được nhét vào cột `Notes`.
Có **strict header validation** (đọc dòng 1, so khớp 21 cột trước khi append). Không sửa frontend
(payload hiện tại đã đủ field). Type-check + build PASS.

## 2. File đã đọc
- `markdown/PROMPT_12_REAL_GOOGLE_SHEETS_SUBMIT_TEST_REPORT.md`
- `markdown/PROMPT_11_AUDIENCE_LOCK_GOOGLE_SHEETS_REPORT.md`
- `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`
- `src/app/components/home/survey-flow/index.tsx` (xác nhận cấu trúc `buildSubmissionPayload()`)

## 3. File đã sửa/tạo
**Tạo mới:**
- `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md` — hướng dẫn + code Apps Script V2.
- `markdown/PROMPT_13_NEW_SHEET_21_COLUMN_MAPPING_REPORT.md` — báo cáo này.

**Sửa (tối thiểu):**
- `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md` — thêm **banner DEPRECATED** ở đầu, trỏ sang V2;
  bản cũ (ID `.xlsx` + 39 cột) không còn là hướng dẫn active.

**KHÔNG sửa:**
- Frontend `survey-flow/index.tsx` (giữ nguyên — payload đã đủ field cho 21 cột).
- `.env` / `.env.local` / `.env.example` (giữ nguyên; Web App URL `/exec` cũ vẫn dùng được nếu
  user chỉ deploy New version trên deployment cũ).

## 4. Google Sheet mới
- **Spreadsheet ID mới:** `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`
- **Sheet name:** `09_Response_Tracker`
- **Số cột hiện tại:** **21** (cố định, không thêm/xóa/đổi).

## 5. Header strict validation
- **Có validate header:** ✔ Hàm `validateHeaders(sheet)` đọc dòng 1 (21 ô đầu), so khớp **chính
  xác** từng cột với `EXPECTED_HEADERS` (so sánh sau `.trim()`).
- **Nếu thiếu cột:** trả `{ ok:false, error:"Header mismatch: sheet co X cot, can 21" }`.
- **Nếu sai tên cột:** trả `{ ok:false, error:"Header mismatch tai cot N: nhan ..., can ..." }`.
- **Nếu sheet/tab không tồn tại:** trả `{ ok:false, error:"Khong tim thay sheet/tab: 09_Response_Tracker" }`.
- Apps Script **KHÔNG tự append header**, **KHÔNG thêm/xóa/đổi cột**. Khi header sai → **không
  ghi gì cả** (return sớm).

## 6. Mapping 21 cột

| # | Cột sheet            | Nguồn dữ liệu payload                                            | Ghi chú |
| - | -------------------- | --------------------------------------------------------------- | ------- |
| 1 | Survey ID            | `payload.responseId`                                            | `BBO-...` |
| 2 | Submit Date          | `new Date()`                                                    | Giờ server |
| 3 | Source               | `payload.source`                                                | |
| 4 | Segment              | `payload.audienceLabel \|\| payload.audience`                   | |
| 5 | Role                 | Owner: `answers.Role` · Guest: `"Khách hàng"`                   | |
| 6 | Hotel Type           | `answers.HotelType \|\| ""`                                     | Guest trống |
| 7 | Rooms                | `answers.Rooms \|\| ""`                                         | Guest trống |
| 8 | Biggest Pain         | Owner `answers.Pain` · Guest `answers.B2CPain` (array→`; `)     | |
| 9 | Desired Solution     | Owner `answers.Solution` · Guest tổng hợp Criteria/ResponseTime/BotAcceptance/OpenInsight | array→`; ` |
| 10| Tech Readiness 1-5   | `answers.Readiness \|\| ""`                                     | |
| 11| Willingness To Pay   | `answers.WTP \|\| ""`                                           | |
| 12| Budget Range         | `answers.Budget \|\| ""`                                        | |
| 13| Contact Permission   | `answers.LeadConsent \|\| (payload.consent ? "Có":"Không")`     | |
| 14| Name                 | `payload.contact.name \|\| ""`                                  | guard null |
| 15| Phone                | `payload.contact.phone \|\| ""`                                 | guard null |
| 16| Hotel/Company        | `payload.contact.hotel \|\| ""`                                 | guard null |
| 17| Position             | `payload.contact.role \|\| ""`                                  | guard null |
| 18| Lead Score           | `calculateLeadScore()`                                          | Owner tính, Guest `""` |
| 19| Priority             | `getPriority(score, audience)`                                  | Owner Hot/Warm/Cold · Guest Research |
| 20| Follow-up Status     | Permission="Có"→`New`, else `No follow-up`                      | |
| 21| Notes                | PageUrl, UserAgent, CompletedAt, Resources, Consent, ContactInfo, field phụ B2B/B2C + JSON backup rút gọn | Không có cột RawJson riêng |

## 7. Lead Score / Priority
**Lead Score (chỉ Owner; Guest = `""`):**
- `+30` nếu `LeadConsent === "Có"`
- `+20` nếu `WTP` ∈ {`"Có"`, `"Có, nếu thấy hiệu quả"`}
- `+20` nếu `Readiness` ∈ {`4`, `5`}
- `+15` nếu `Interest` ∈ {`"Rất quan tâm"`, `"Có quan tâm"`}
- `+15` nếu `Budget` có giá trị và khác `"Dưới 500.000đ"`
- Tối đa **100**.

**Priority:**
- Owner: `Hot` (≥70) · `Warm` (≥40) · `Cold` (<40).
- Guest: `Research`.

**Follow-up Status:** `Contact Permission === "Có"` → `New`; ngược lại → `No follow-up`.

## 8. Apps Script V2
- **File chứa code:** `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md` (mục 5).
- **Helper:** `val`, `joinArr`, `isOwner`, `buildDesiredSolution`, `calculateLeadScore`,
  `getPriority`, `validateHeaders`, `buildNotes`, `jsonOut`.
- **`doPost(e)`:** mở Spreadsheet ID mới → kiểm tra sheet tồn tại → **validate 21 header** →
  parse JSON từ `e.postData.contents` → build row đúng 21 cột theo `EXPECTED_HEADERS` →
  `sheet.appendRow(row)` → trả `{ ok:true }`; lỗi → `{ ok:false, error:String(err) }`.
- **`doGet()`:** trả `{ ok:true, message, sheetName, spreadsheetId, expectedColumns:21 }` để
  ping kiểm tra endpoint sống.

## 9. Frontend
- **Có sửa frontend không:** **KHÔNG.** Payload `buildSubmissionPayload()` đã chứa đủ field
  (responseId, audience, audienceLabel, answers, resources, consent, contact, contactInfo,
  source, pageUrl, userAgent, completedAt). Mọi mapping 21 cột xử lý phía Apps Script.
- **Env var vẫn dùng:** `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` (URL `/exec`). Spreadsheet ID
  **không** xuất hiện trong frontend.

## 10. Những phần không đụng tới
- [x] Không sửa Header / Hero / Why / About / Footer.
- [x] Không đổi font Montserrat / màu brand / layout.
- [x] Không sửa logic frontend (`survey-flow/index.tsx` giữ nguyên).
- [x] Không sửa `src/app/layout.tsx`, `src/app/page.tsx`.
- [x] Không sửa `public/`, `package.json`, `next.config.mjs`, `tailwind.config.ts`.
- [x] Không nhúng Spreadsheet ID vào frontend.
- [x] Không dùng Google Sheet edit link làm endpoint.
- [x] Không git commit / push.

## 11. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled successfully`, `✓ Generating static pages (37/37)`,
  `✓ Exporting (2/2)`).
- **Search** `1Nd8-...|09_Response_Tracker|Survey ID|Lead Score|RawJson|SPREADSHEET_ID` trên
  `markdown/ src/ .env.example`:
  - Chỉ khớp trong **markdown/** (V2: 29, setup cũ: 12, report P12: 13, report P11: 9).
  - **0 khớp trong `src/`** và **0 khớp trong `.env.example`** → ID mới không lọt vào frontend.
  - Trong V2, chữ `RawJson` **chỉ** xuất hiện ở câu phủ định ("KHÔNG tạo cột RawJson") → V2
    **không** tạo cột RawJson. (RawJson trong report/setup cũ là lịch sử, bỏ qua.)

## 12. Hướng dẫn user deploy lại
1. Mở Google Sheet mới (ID `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`).
2. Mở tab `09_Response_Tracker`, kiểm tra dòng 1 đúng 21 cột (đúng chính tả, dấu cách).
3. Vào **Extensions → Apps Script**.
4. Dán code V2 (trong `GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md`, mục 5), **Save**.
5. **Deploy → Manage deployments → Edit → New version → Deploy** (giữ URL `/exec` cũ) — hoặc
   New deployment nếu chưa có.
6. Copy Web App URL `/exec`.
7. Nếu URL **đổi**, cập nhật `.env.local`:
   `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=...`. Nếu chỉ tạo New version → URL không đổi.
8. Restart `pnpm dev`.
9. (Tùy chọn) ping GET URL `/exec` → kỳ vọng `{"ok":true,...,"expectedColumns":21}`.
10. Submit thử **1 Owner** + **1 Guest** qua web.
11. Mở tab `09_Response_Tracker` kiểm tra 2 dòng mới đúng 21 cột.

## 13. Kết luận
**PASS** (về phía code/tài liệu)

Đáp ứng đủ điều kiện PASS:
1. Apps Script dùng Spreadsheet ID mới `1Nd8-...`. ✔
2. Sheet name đúng `09_Response_Tracker`. ✔
3. Mapping đúng 21 cột user đưa. ✔
4. Không thêm/xóa header (strict validate, không tự append header). ✔
5. Có strict header validation. ✔
6. Không đưa Spreadsheet ID vào frontend. ✔
7. Không sửa ngoài scope. ✔
8. Type-check / build PASS. ✔
9. Report tiếng Việt đã tạo. ✔

> Lưu ý: việc ghi dữ liệu thật chỉ xác nhận được **sau khi user dán code V2 + deploy New version**
> rồi submit thử (do frontend `no-cors` không đọc được response). Bước verify cuối thuộc về user.

## 14. Bước tiếp theo & mục tiêu
**Bước tiếp theo:** User dán code Apps Script V2 vào Google Sheet mới, **Deploy New version**,
test submit Owner + Guest, kiểm tra tab `09_Response_Tracker`.

**Mục tiêu:** Ghi đúng dữ liệu vào đúng **21 cột hiện có** của tab `09_Response_Tracker`,
không thêm/xóa/sai cột; Owner có Lead Score/Priority hợp lý, Guest ghi dạng Research.
