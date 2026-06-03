# PROMPT 18 — BÁO CÁO FIX VERCEL UI + MIGRATE SUPABASE

## 1. Tóm tắt nhiệm vụ
Hai việc trong một prompt:
1. **Fix giao diện vỡ trên Vercel** (HTML có nội dung nhưng mất toàn bộ CSS/JS/ảnh).
2. **Chuyển submit khảo sát từ Google Sheets (Apps Script) sang Supabase** qua API route server-side.

Kết quả: **PASS** — đã sửa `next.config.mjs` (gỡ cấu hình GitHub Pages + static export), tạo API
route + Supabase server client + doc setup, đổi SurveyFlow submit sang `/api/survey/submit`,
type-check/build PASS, commit `01e30de` đã push lên `main`. **Không** đụng layout/brand/font/nội dung
landing page; **không** lộ service role key ra client.

## 2. Chẩn đoán lỗi Vercel mất giao diện
- **CSS/JS/images không load:** ĐÚNG — đây là lỗi **asset delivery**, không phải lỗi UI component.
- **Nguyên nhân trong `next.config.mjs` (bản cũ dành cho GitHub Pages):**
  ```js
  const basePath = process.env.NODE_ENV === 'production' ? '/property-nextjs' : '';
  output: 'export',
  basePath,                 // '/property-nextjs' ở production
  assetPrefix: basePath,    // '/property-nextjs'
  trailingSlash: true,
  ```
  - Trên **Vercel** app được serve ở **root `/`**, nhưng `basePath`/`assetPrefix = '/property-nextjs'`
    khiến mọi `<link>` CSS, script JS, ảnh trỏ tới `/property-nextjs/_next/...` → **404** → trang ra
    HTML thô không style. Đúng triệu chứng mô tả.
  - `output: 'export'` (static export) còn **chặn API route** cần cho Supabase.
- **Cách fix đã áp dụng:** gỡ `output: 'export'`, `basePath`, `assetPrefix`, `trailingSlash`, và
  `env.NEXT_PUBLIC_BASE_PATH`. Đã xác minh `src/utils/pathUtils.ts` dùng
  `process.env.NEXT_PUBLIC_BASE_PATH || ""` → khi gỡ env, hàm trả path nguyên gốc (`/images/...`)
  → đúng trên Vercel root, **ảnh không vỡ**.

## 3. File đã đọc
- `next.config.mjs`, `package.json`, `tsconfig.json`, `.env.example`
- `src/app/components/home/survey-flow/index.tsx`
- `src/utils/pathUtils.ts` (xác minh ảnh hưởng khi gỡ basePath)
- `markdown/PROMPT_17_VERCEL_NEXT_SECURITY_FIX_REPORT.md` (bối cảnh)

## 4. File đã sửa/tạo
**Sửa:**
- `next.config.mjs` — gỡ static export + basePath/assetPrefix/trailingSlash.
- `package.json`, `pnpm-lock.yaml` — thêm `@supabase/supabase-js@^2.106.2`.
- `.env.example` — thêm `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; đánh dấu Google Sheets deprecated.
- `src/app/components/home/survey-flow/index.tsx` — đổi submit sang `/api/survey/submit`.

**Tạo:**
- `src/lib/supabase/server.ts` — Supabase admin client (service role, `import "server-only"`).
- `src/app/api/survey/submit/route.ts` — API route POST → insert Supabase.
- `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md` — hướng dẫn setup + SQL bảng + RLS + env.

## 5. Next/Vercel config
- **`output: 'export'` còn không?** ❌ Đã gỡ → Vercel chạy Next.js server, API route hoạt động
  (build log hiển thị `/api/survey/submit` là `ƒ Dynamic`).
- **`basePath`/`assetPrefix`/`trailingSlash`:** đã gỡ → asset load đúng ở root.
- **Vercel Output Directory nên để gì?** **Mặc định/để trống** (KHÔNG set `out`). Build command giữ
  `pnpm build`.
- **Lưu ý GitHub Pages:** repo có `.github/workflows/deploy.yml` build static export `./out`. Sau khi
  gỡ `output: 'export'`, workflow này **sẽ không còn tạo `./out`** → nên **tắt/xoá** (Settings →
  Actions, hoặc xoá file ở một prompt riêng — ngoài scope Prompt 18). Không deploy GitHub Pages song
  song với Vercel.

## 6. Supabase setup
- **User cần làm:** tạo account/project trên supabase.com, lấy **Project URL** + **service_role key**,
  chạy SQL tạo bảng `survey_responses`, bật RLS, set env trên Vercel.
- **File hướng dẫn:** `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md` (có sẵn SQL `create table` 30 cột
  theo đúng spec + `enable row level security`).
- **Env cần set ở Vercel:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (cả Production & Preview).

## 7. API route
- **Path:** `src/app/api/survey/submit/route.ts` → endpoint `POST /api/survey/submit`
  (`runtime = "nodejs"`, `dynamic = "force-dynamic"`).
- **Validate payload cơ bản:**
  - `audience` phải là `owner` hoặc `guest` (sai → 400).
  - `responseId` tồn tại & là string (thiếu → 400).
  - `answers` phải là object (sai → 400).
  - Body không parse được JSON → 400.
- **Insert bảng:** `survey_responses`. Map đủ các cột; tính lại `lead_score`/`priority`/
  `follow_up_status` ở server theo logic tương đồng Apps Script (Owner chấm điểm Hot/Warm/Cold,
  Guest `lead_score = null`, `priority = "Research"`).
- **Trả JSON:** `{ ok: true, id }` hoặc `{ ok: false, error }`. **Không** log payload cá nhân.

## 8. SurveyFlow submit
- **Trước:** `fetch(NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL, { mode: "no-cors", ... })` (opaque, không
  đọc được kết quả).
- **Sau:** `fetch("/api/survey/submit", { method: "POST", headers: {"Content-Type":"application/json"},
  body: JSON.stringify(payload) })`, đọc JSON: `ok` → Thank You; lỗi → hiện `submitError`.
- **`no-cors` còn không?** ❌ Đã bỏ. Không dùng Google Sheets env trong submit chính. Không
  localStorage/sessionStorage. Không console.log dữ liệu.

## 9. Security
- **Service role key chỉ server-side:** `SUPABASE_SERVICE_ROLE_KEY` chỉ đọc trong
  `src/lib/supabase/server.ts` (có `import "server-only"`) và dùng trong API route. **Không** xuất
  hiện ở bất kỳ client component nào (đã verify bằng `rg`).
- **Không đưa secret vào NEXT_PUBLIC:** service role KHÔNG có prefix `NEXT_PUBLIC`.
- **Không commit env:** `.env`/`.env.local` được ignore, không staged. `.env.example` chỉ chứa
  placeholder rỗng.
- **RLS bật, không policy public insert:** chỉ service role (server) ghi được.

## 10. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** — `/api/survey/submit` = `ƒ (Dynamic) server-rendered`, các trang khác
  static/SSG bình thường, không lỗi.
- **Search check:**
  - `output: 'export'`/`assetPrefix`/`basePath` active: **không còn** (chỉ còn comment + `pathUtils`
    với default `""`).
  - `SUPABASE_SERVICE_ROLE_KEY`: chỉ ở `.env.example` (rỗng) + `src/lib/supabase/server.ts` (server).
  - `mode: "no-cors"` / `console.log` / `localStorage` / `sessionStorage` trong survey-flow + api:
    **không có**.

## 11. Git commit/push
- Commit: **`01e30de`** — `feat: migrate survey submit to Supabase`.
- Nội dung (8 file): `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `.env.example`,
  `survey-flow/index.tsx`, `src/lib/supabase/server.ts`, `src/app/api/survey/submit/route.ts`,
  `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md`.
- Branch: `main`. Push: **PASS** ✅ `dea786a..01e30de`; local == `origin/main` == `01e30de`.
- Report Prompt 16/17/18 vẫn để **untracked** (không làm bẩn commit runtime).

## 12. Vercel deploy instruction
1. Vercel **auto redeploy** từ commit mới `01e30de` (repo đã connected).
2. **Settings → Environment Variables** (Production + Preview):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side, KHÔNG NEXT_PUBLIC)
   - Không cần `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` (đã bỏ Google Sheet khỏi submit chính).
3. **Output Directory:** để **mặc định/trống** (không set `out`). Build: `pnpm build`.
4. Trước/sau redeploy: chạy SQL tạo bảng `survey_responses` + bật RLS theo
   `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md`.
5. **Redeploy** → mở Production URL: giao diện đã có CSS/ảnh đầy đủ; submit thử Owner + Guest → kiểm
   tra Supabase Table Editor có 2 dòng mới.

## 13. Những phần không đụng tới
- [x] Không redesign; không đổi layout Header/Hero/Why/Audience/Incentive/About/Footer.
- [x] Không đổi màu brand; không đổi font Montserrat.
- [x] Không xóa câu hỏi survey; không xóa audience lock (logic giữ nguyên).
- [x] Không dùng localStorage/sessionStorage; không console.log dữ liệu user.
- [x] Không commit `.env`/`.env.local`; không hardcode service role vào frontend; không đưa secret
      vào NEXT_PUBLIC.
- [x] Không sửa `src/app/components/layout/header/**`, `home/hero/**`, `home/why/**`, `home/about/**`,
      `layout/footer/**`, `page.tsx`, `layout.tsx`, `public/**`, data JSON.
- [x] Không tiếp tục Apps Script trong submit chính (chỉ đánh dấu deprecated trong `.env.example`/doc).

## 14. Kết luận
**PASS**

| Điều kiện PASS | Trạng thái |
| --- | --- |
| 1. Vercel UI fix bằng config hợp lý | ✅ (gỡ basePath/assetPrefix/export) |
| 2. Static export không chặn API route | ✅ (`/api/...` = Dynamic) |
| 3. Supabase setup doc | ✅ |
| 4. API route `/api/survey/submit` | ✅ |
| 5. SurveyFlow submit qua API route | ✅ |
| 6. Service role key không vào frontend | ✅ |
| 7. Type-check/build PASS | ✅ |
| 8. Không sửa layout ngoài scope | ✅ |
| 9. Commit/push PASS | ✅ `01e30de` |

## 15. Bước tiếp theo & mục tiêu
**Bước tiếp theo (user):**
1. Tạo Supabase project + chạy SQL bảng `survey_responses` + bật RLS (theo doc).
2. Set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` trên Vercel → **Redeploy**.
3. Kiểm tra Production URL: **giao diện hiển thị đầy đủ CSS/ảnh** (đã hết lỗi vỡ), submit Owner +
   Guest và xác nhận dòng mới trong Supabase.
4. (Tuỳ chọn, ngoài scope) Tắt workflow GitHub Pages `deploy.yml` để tránh Action fail vì không còn
   `./out`.

**Mục tiêu:** Vercel hiển thị landing page đúng giao diện gốc (không vỡ CSS) và khảo sát ghi trực tiếp
vào Supabase qua API route bảo mật (service role chỉ server-side).
