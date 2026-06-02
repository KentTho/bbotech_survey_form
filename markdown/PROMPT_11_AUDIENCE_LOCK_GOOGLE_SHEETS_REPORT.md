# PROMPT 11 — BÁO CÁO LOCK AUDIENCE + GOOGLE SHEETS PREP

## 1. Tóm tắt nhiệm vụ
Đã **khóa (lock) lựa chọn audience**: sau khi người dùng chọn "Chủ / Quản lý / Nhân sự khách sạn"
hoặc "Khách từng đặt / lưu trú khách sạn", không thể chọn lại nhóm khác trong cùng session UI.
Đồng thời đã **chuẩn bị đường đẩy dữ liệu khảo sát về Google Sheets** thông qua Apps Script
Web App URL (biến môi trường `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`), tạo tài liệu hướng dẫn
Apps Script đầy đủ, và đấu nối frontend submit theo cơ chế fire-and-forget `no-cors`.
Không tạo API route (project static export), không hardcode secret, không dùng link edit của
Google Sheet làm endpoint.

## 2. File đã đọc
- `src/app/components/home/survey-flow/index.tsx`
- `markdown/PROMPT_10_OFFICIAL_SURVEY_QUESTIONS_REPORT.md`
- `package.json`
- `next.config.mjs`
- `.env`
- `.gitignore` (kiểm tra qua liệt kê thư mục)
- (Đã tham chiếu nội dung các report Prompt 06–09 qua tóm tắt trong Prompt 10.)

## 3. File đã sửa/tạo
**Đã sửa:**
- `src/app/components/home/survey-flow/index.tsx`

**Đã tạo mới:**
- `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`
- `markdown/PROMPT_11_AUDIENCE_LOCK_GOOGLE_SHEETS_REPORT.md` (file này)
- `.env.example` (chỉ chứa key `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=`)

**KHÔNG sửa:**
- `.env` thật (vì user chưa cung cấp Apps Script Web App URL).

## 4. Audience lock
**Trước Prompt 11:**
- Hàm `selectAudience` luôn set lại `audience` mỗi lần click bất kỳ card nào, đồng thời reset
  `answers`, `step`, `resource`, `consent`, `submitted`. Người dùng có thể đổi nhóm tự do và
  việc đổi nhóm sẽ reset toàn bộ tiến trình khảo sát.

**Sau Prompt 11:**
- `selectAudience` được thêm guard `if (audience !== null) return;` ở đầu hàm. Chỉ lần chọn
  đầu tiên (khi `audience === null`) mới thực sự set state.
- Khi `audience === null`: cả 2 card đều clickable bình thường (hiệu ứng hover `-translate-y-1`).
- Khi `audience !== null`:
  - Card đã chọn giữ trạng thái selected (viền primary + ring + `aria-pressed=true`).
  - Card còn lại bị `disabled`, `aria-disabled=true`, `opacity-50`, `cursor-not-allowed`,
    bỏ hiệu ứng hover.
  - `onClick` của cả hai card đều không làm đổi `audience` (card khóa bị `disabled` nên không
    bắn event; card đã chọn gọi `selectAudience` nhưng bị guard chặn → no-op).
- **Không reset `answers` hay `step`** khi click lại card sau khi đã chọn → survey flow không bị
  reset.
- **Không** thêm nút "Đổi nhóm", **không** thêm nút "Chọn lại". Text card giữ nguyên, layout
  giữ nguyên.

**Owner lock hoạt động ra sao:** chọn "owner" → owner selected, guest card mờ + khóa; click
guest không có tác dụng; survey vẫn ở luồng B1–B15.

**Guest lock hoạt động ra sao:** chọn "guest" → guest selected, owner card mờ + khóa; click
owner không có tác dụng; survey vẫn ở luồng C1–C10.

**Có cho chọn lại không?** → **KHÔNG.** Muốn đổi nhóm phải reload trang.

## 5. Google Sheets setup
- **Spreadsheet ID:** `1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9`
- **Sheet name (tab):** `09_Response_Tracker`
- **Vì sao không dùng link edit làm endpoint:** link `docs.google.com/spreadsheets/.../edit`
  chỉ là URL giao diện chỉnh sửa, **không phải API** — không nhận được POST dữ liệu, và việc
  ghi cần quyền xác thực. Dùng nó làm endpoint là sai kỹ thuật và rủi ro bảo mật.
- **Cần Apps Script Web App URL:** phải deploy một Apps Script Web App (chạy dưới quyền chủ
  sheet) để có URL dạng `https://script.google.com/macros/s/xxxx/exec` làm endpoint thực sự.
- **File hướng dẫn đã tạo:** `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`.

## 6. Frontend submit
- **Env var dùng:** `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` (đọc qua
  `process.env.NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL`).
- **Payload (`buildSubmissionPayload()`) gồm:**
  - `responseId`: `BBO-${Date.now()}-${random6}`
  - `audience`: `"owner"` | `"guest"`
  - `audienceLabel`: tiêu đề nhóm tương ứng
  - `answers`: object câu trả lời, giữ nguyên fieldKey
  - `resources`: tài nguyên chọn ở final step
  - `consent`: boolean
  - `contact`: object `{ name, phone, hotel, role }` (nếu có)
  - `contactInfo`: email/SĐT tuỳ chọn ở final step
  - `source`: `"bbotech-vung-tau-hotel-survey"`
  - `pageUrl`: `window.location.href` (chỉ khi chạy browser)
  - `userAgent`: `navigator.userAgent` (chỉ khi chạy browser)
  - `completedAt`: ISO string
- **Submit dùng fetch/no-cors:**
  ```js
  await fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  ```
  Vì `no-cors` trả response opaque nên không đọc body — đây là fire-and-forget.
- **Khi thiếu endpoint:** set `submitError` = `"Chưa cấu hình endpoint Google Sheets. Vui lòng
  kiểm tra NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL."`, **không** chuyển sang Thank You, không
  giả vờ gửi thành công.
- **Khi có endpoint:** set `submitting=true`, POST payload, sau khi `fetch` resolve thì set
  `submitted=true` (chuyển Thanks); nếu lỗi → `submitError` = `"Không gửi được khảo sát. Vui
  lòng thử lại."`; `finally` set `submitting=false`. Nút hiển thị "Đang gửi..." và bị disable
  trong lúc gửi.

## 7. Apps Script doc
- **File doc đã tạo:** `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`.
- **Append vào:** Spreadsheet ID `1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9`, tab `09_Response_Tracker`.
- **Hành vi script:** mở đúng Spreadsheet ID → lấy sheet `09_Response_Tracker`; nếu không tồn
  tại thì `throw error`; nếu sheet trống thì tự thêm dòng header; nhận JSON payload; append 1
  row mới; trả `{ ok: true }` hoặc `{ ok: false, error: "..." }` qua
  `ContentService...MimeType.JSON`.
- **Header/cột chính:** SubmittedAt, ResponseId, Audience, AudienceLabel, Source, UserAgent,
  PageUrl, CompletedAt, Resources, Consent, ContactName, ContactPhone, ContactHotel,
  ContactRole, HotelType, Rooms, Role, Channel, Pain, TimeCost, CurrentTool, Readiness,
  Interest, Solution, Pilot, WTP, Budget, LeadConsent, TravelHistory, BookingChannel, Criteria,
  B2CPain, SlowReplyLoss, ResponseTime, BotAcceptance, Retention, Repeat, OpenInsight, RawJson.
- **Multiple choice** join bằng `; `; **object contact** tách thành 4 cột Contact*.
- **RawJson backup:** CÓ — lưu `JSON.stringify(payload)` đầy đủ.

## 8. Bảo mật / dữ liệu
- **Không** hardcode secret/private credential vào frontend.
- **Không** dùng Google Sheet edit URL trong frontend code (chỉ xuất hiện trong markdown doc).
- **Không** dùng localStorage/sessionStorage.
- **Không** console.log dữ liệu user.
- **Không** dùng axios (chỉ dùng `fetch` native).
- **Không** tạo Next.js API route (project `output: 'export'` — static export).
- Spreadsheet ID chỉ nằm trong markdown Apps Script doc, **không** nằm trong frontend.

## 9. Những phần không đụng tới
- [x] Không sửa Header.
- [x] Không sửa Hero.
- [x] Không sửa Why.
- [x] Không sửa About.
- [x] Không sửa Footer.
- [x] Không đổi font Montserrat.
- [x] Không đổi màu brand.
- [x] Không cleanup section cũ.
- [x] Không sửa data JSON.
- [x] Không sửa public assets.
- [x] Không cài package (package.json giữ nguyên).
- [x] Không git commit.
- [x] Không git push.
- [x] Không sửa `.env` thật.

## 10. Validation
- `npx tsc --noEmit`: **PASS** (exit 0, không lỗi type).
- `pnpm build`: **PASS** (build static export thành công, route `/` ~10 kB).
- Search `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL|fetch\(|axios|localStorage|sessionStorage|console\.log|09_Response_Tracker|1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9`:
  - Trong `survey-flow/index.tsx`: chỉ có `fetch(` (submit hợp lệ) + biến env. **Không** có
    axios/localStorage/sessionStorage/console.log/edit URL/Spreadsheet ID.
  - Spreadsheet ID + `09_Response_Tracker` chỉ xuất hiện trong `markdown/`.
  - Các match axios/localStorage/console.log khác là code cũ (auth, contact form, doc) **ngoài
    scope Prompt 11**, không bị đụng tới.
- `git diff`: **KHÔNG chạy được** vì project không có metadata `.git` (không phải git repo).

## 11. Interaction test
- [x] Owner selected → guest card khóa, không chọn lại được (logic guard + `disabled`).
- [x] Guest selected → owner card khóa, không chọn lại được.
- [x] Survey flow không reset khi click lại card sau khi đã chọn.
- [x] Single choice vẫn chỉ chọn 1 (logic Prompt 10 giữ nguyên).
- [x] Multiple choice vẫn chọn nhiều (logic Prompt 10 giữ nguyên).
- [x] Final submit khi thiếu endpoint → hiển thị lỗi "Chưa cấu hình endpoint Google Sheets...",
      không chuyển Thanks.
- [x] Nếu có endpoint thật → submit fire-and-forget, chuyển Thanks.
- [x] Không tràn layout mobile (giữ nguyên grid/spacing Prompt 10, chỉ thêm class opacity).

> Ghi chú: các mục interaction được kiểm chứng bằng đọc logic + type-check + build thành công.
> Kiểm thử click thủ công trên trình duyệt cần user chạy `pnpm dev` tại máy.

## 12. Screenshot
Yêu cầu tạo:
- `markdown/PROMPT_11_AUDIENCE_LOCK_OWNER.png` — **CHƯA tạo được**.
- `markdown/PROMPT_11_AUDIENCE_LOCK_GUEST.png` — **CHƯA tạo được**.
- `markdown/PROMPT_11_SUBMIT_ENDPOINT_MISSING.png` — **CHƯA tạo được**.
- `markdown/PROMPT_11_FINAL_STEP_READY.png` — **CHƯA tạo được**.

**Lý do:** Phiên CLI hiện tại không có công cụ khởi chạy trình duyệt headless để render và
chụp ảnh thực tế. Việc tạo ảnh giả sẽ vi phạm nguyên tắc "không fake". Đề nghị user chạy
`pnpm dev` và tự chụp 4 màn hình trên, hoặc cấp tool browser/screenshot để bổ sung sau.

## 13. Hướng dẫn user cần làm tiếp
1. Mở Google Sheet (ID `1TjiP6oB6hjx_cT06fPWvzGY0pGUPqhm9`), đảm bảo có tab `09_Response_Tracker`.
2. Vào **Extensions → Apps Script**.
3. Dán code trong `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md` (mục 4) vào `Code.gs`, Save.
4. **Deploy → New deployment → Web app**: Execute as = Me, Who has access = Anyone.
5. Copy **Web App URL** (dạng `.../exec`).
6. Dán vào `.env.local` hoặc `.env`:
   ```
   NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL=https://script.google.com/macros/s/xxxx/exec
   ```
7. Chạy lại `pnpm dev` (hoặc build lại) để biến env có hiệu lực.
8. Làm khảo sát thật → bấm "Gửi khảo sát" → kiểm tra tab `09_Response_Tracker` có dòng mới.

## 14. Kết luận
**PASS**

Đáp ứng đủ điều kiện PASS:
1. Sau khi chọn owner/guest → không chọn lại được nhóm khác. ✔
2. Survey flow không bị reset khi click lại card. ✔
3. Apps Script setup doc đã tạo. ✔
4. Frontend không dùng Google Sheet edit link làm endpoint. ✔
5. Frontend dùng env var cho Web App URL. ✔
6. Thiếu endpoint thì báo lỗi, không fake success. ✔
7. Type-check + build PASS. ✔
8. Không sửa ngoài scope. ✔
9. Report tiếng Việt đã tạo. ✔

(Lưu ý nhỏ: screenshot chưa tạo được do giới hạn công cụ — đã ghi rõ ở mục 12, không ảnh hưởng
điều kiện PASS.)

## 15. Bước tiếp theo & mục tiêu
**Bước tiếp theo:** Gửi report Prompt 11 và file `markdown/GOOGLE_SHEETS_APPS_SCRIPT_SETUP.md`
để kiểm tra; sau đó user deploy Apps Script và dán Web App URL vào env.

**Mục tiêu:** Xác nhận audience đã bị khóa sau khi chọn và frontend đã sẵn sàng gửi dữ liệu vào
Google Sheets ngay khi có Apps Script Web App URL.
