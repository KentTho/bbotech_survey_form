# PROMPT 19 — BÁO CÁO MIGRATE STORAGE TỪ SUPABASE SANG NEON POSTGRES

## 1. Tóm tắt nhiệm vụ
Chuyển lớp lưu trữ dữ liệu khảo sát từ **Supabase** sang **Neon PostgreSQL**, **giữ nguyên** endpoint
`/api/survey/submit` và luồng submit của SurveyFlow. Gỡ hẳn dependency Supabase. Dùng env
`DATABASE_URL`. Không đụng UI/câu hỏi/audience lock; không lộ connection string ra client.

Kết quả: **PASS** — đã thay client, viết lại insert bằng SQL parameterized, gỡ `@supabase/supabase-js`,
xóa `src/lib/supabase/server.ts`, type-check/build PASS, commit `f7ec869` đã push lên `main`.

## 2. Chẩn đoán trạng thái trước migrate
- API route `src/app/api/survey/submit/route.ts` đang **insert vào Supabase** qua
  `getSupabaseAdmin().from("survey_responses").insert(row)`.
- SurveyFlow đã POST tới `/api/survey/submit` (từ Prompt 18) — **không cần sửa**.
- `.env.example` có `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` + Google Sheets deprecated.
- `next.config.mjs` đã sạch (không còn `output: 'export'`/`basePath`/`assetPrefix` — chỉ còn comment
  lịch sử).

## 3. File đã đọc
- `src/app/api/survey/submit/route.ts`, `src/lib/supabase/server.ts`
- `src/app/components/home/survey-flow/index.tsx` (xác nhận đã POST `/api/survey/submit`)
- `.env.example`, `package.json`, `next.config.mjs`
- `markdown/PROMPT_18_VERCEL_UI_SUPABASE_MIGRATION_REPORT.md`,
  `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md`

## 4. File đã sửa / tạo / xóa
**Sửa:**
- `package.json`, `pnpm-lock.yaml` — gỡ `@supabase/supabase-js`, thêm `@neondatabase/serverless`.
- `.env.example` — thêm `DATABASE_URL`; đánh dấu Supabase + Google Sheets deprecated.
- `src/app/api/survey/submit/route.ts` — đổi import sang Neon `sql`, thay insert bằng SQL
  parameterized `INSERT ... RETURNING id`. **Mapping 30 cột giữ nguyên.**
- `markdown/SUPABASE_SETUP_SURVEY_DATABASE.md` — thêm note **DEPRECATED**.

**Tạo:**
- `src/lib/neon/server.ts` — Neon client (`import "server-only"`, đọc `DATABASE_URL`, throw nếu thiếu).
- `markdown/NEON_SETUP_SURVEY_DATABASE.md` — hướng dẫn setup + SQL bảng + env.

**Xóa:**
- `src/lib/supabase/server.ts` (không còn dùng).

## 5. Dependency change
| Mục | Trước | Sau |
| --- | --- | --- |
| `@supabase/supabase-js` | `^2.106.2` | **đã gỡ** |
| `@neondatabase/serverless` | — | **`^1.1.0`** (mới) |
| Package manager | pnpm | pnpm (không đổi) |
| React / Next | không đụng | không đụng |

> Cảnh báo peer dep `next-themes` (react ^18 vs 19) là có sẵn từ trước, không liên quan migrate này.

## 6. Neon server client
- `src/lib/neon/server.ts`:
  ```ts
  import "server-only";
  import { neon } from "@neondatabase/serverless";
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL environment variable");
  }
  export const sql = neon(databaseUrl);
  ```
- `import "server-only"` đảm bảo không bị bundle vào client.
- Đọc `process.env.DATABASE_URL` (KHÔNG `NEXT_PUBLIC`).

## 7. API route
- **Path giữ nguyên:** `POST /api/survey/submit` (`runtime = "nodejs"`, `dynamic = "force-dynamic"`).
- **Validate giữ nguyên:** `audience` ∈ {owner, guest}, `responseId` là string, `answers` là object,
  body JSON hợp lệ.
- **Insert Neon:** SQL tagged-template parameter-hoá (chống injection):
  ```sql
  INSERT INTO survey_responses ( ...28 cột... ) VALUES ( ${...} ) RETURNING id
  ```
  - Cột jsonb (`answers`, `resources`, `contact`) được `JSON.stringify(...)::jsonb`.
  - `lead_score`/`priority`/`follow_up_status` vẫn tính server-side (logic tương đồng Apps Script).
- **Trả JSON:** `{ ok: true, id }` hoặc `{ ok: false, error }`. Không log payload cá nhân.

## 8. SurveyFlow submit
- **Không sửa.** Vẫn `fetch("/api/survey/submit", { method: "POST", headers: {"Content-Type":
  "application/json"}, body: JSON.stringify(payload) })`, đọc JSON, `ok` → Thank You, lỗi → hiển thị.
- Không `no-cors`, không localStorage/sessionStorage, không console.log dữ liệu.

## 9. Env
- **Local:** cần `DATABASE_URL` trong `.env` hoặc `.env.local` (đã ignore, không commit).
- **Vercel:** cần Environment Variable `DATABASE_URL` (Production + Preview).
- **KHÔNG** dùng `NEXT_PUBLIC_DATABASE_URL`; **KHÔNG** hardcode connection string; **KHÔNG** commit
  `.env`/`.env.local`.
- `.env.example` chỉ chứa `DATABASE_URL=` (rỗng) + ghi chú Supabase/Google Sheets deprecated.

## 10. Security
- `DATABASE_URL` chỉ đọc ở `src/lib/neon/server.ts` (server-only) → dùng trong API route. **Không**
  xuất hiện ở client component (verify bằng `rg`).
- Không `NEXT_PUBLIC` cho connection string. Không hardcode. Không commit env.
- Insert dùng parameter-hoá (an toàn injection).

## 11. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** — `/api/survey/submit` = `ƒ (Dynamic)`, các trang khác static/SSG, không lỗi.
- **Search check:**
  - `supabase`/`@supabase` trong `src`/`package.json`: **không còn**.
  - `DATABASE_URL`/`@neondatabase`: chỉ ở `package.json`, `.env.example`, `src/lib/neon/server.ts`
    (server).
  - `NEXT_PUBLIC_DATABASE_URL`: **không có**.
  - `next.config.mjs`: không còn `output:'export'`/`basePath`/`assetPrefix` active (chỉ comment).
  - `no-cors`/`console.log`/`localStorage`/`sessionStorage` trong survey-flow/api: **không có** (match
    duy nhất là dòng comment "Không dùng no-cors").

## 12. Git commit/push
- Commit: **`f7ec869`** — `feat: migrate survey storage from Supabase to Neon Postgres`.
- Nội dung (8 thay đổi): sửa `package.json`/`pnpm-lock.yaml`/`.env.example`/`route.ts`/
  `SUPABASE_SETUP...md`; thêm `src/lib/neon/server.ts` + `NEON_SETUP...md`; **xóa**
  `src/lib/supabase/server.ts`.
- Branch: `main`. Push: **PASS** ✅ `01e30de..f7ec869`; local == `origin/main` == `f7ec869`.
- Report Prompt 16/17/18/19 để **untracked** (giữ commit runtime sạch).

## 13. Vercel deploy instruction
1. Vercel **auto redeploy** từ commit mới `f7ec869`.
2. **Settings → Environment Variables** (Production + Preview): thêm **`DATABASE_URL`** = Neon pooled
   connection string. **Xóa/không cần** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
3. **Output Directory:** mặc định/trống (KHÔNG static export). Build: `pnpm build`.
4. Chạy SQL tạo bảng `survey_responses` trên Neon theo `markdown/NEON_SETUP_SURVEY_DATABASE.md`.
5. **Redeploy** → mở Production URL: giao diện đầy đủ; submit thử Owner + Guest → kiểm tra bảng Neon
   có 2 dòng mới.

## 14. Những phần không đụng tới
- [x] Không sửa Header/Hero/Why/Audience/Incentive/About/Footer; không `page.tsx`/`layout.tsx`/
      `public/**`/data JSON.
- [x] Không đổi font Montserrat; không đổi màu brand.
- [x] Không xóa câu hỏi survey; không xóa audience lock; không sửa SurveyFlow (đã trỏ đúng endpoint).
- [x] Không dùng localStorage/sessionStorage; không console.log dữ liệu user.
- [x] Không commit `.env`/`.env.local`; không đưa `DATABASE_URL` vào client; không
      `NEXT_PUBLIC_DATABASE_URL`; không hardcode connection string.
- [x] Không sửa `next.config.mjs` thành static export lại; không quay lại Google Sheets/Apps Script.

## 15. Kết luận
**PASS**

| Điều kiện | Trạng thái |
| --- | --- |
| Thay Supabase client bằng Neon | ✅ |
| Giữ endpoint `/api/survey/submit` | ✅ |
| Giữ SurveyFlow submit | ✅ |
| SQL setup bảng cho Neon | ✅ (doc) |
| Dùng env `DATABASE_URL` | ✅ |
| Gỡ dependency Supabase | ✅ |
| Không vỡ giao diện | ✅ (build clean, không đụng UI) |
| Type-check/build PASS | ✅ |
| Commit/push PASS | ✅ `f7ec869` |

## 16. Bước tiếp theo & mục tiêu
**Bước tiếp theo (user):**
1. Chạy SQL tạo bảng `survey_responses` trên Neon (theo `NEON_SETUP_SURVEY_DATABASE.md`).
2. Set `DATABASE_URL` trên Vercel → **Redeploy**; bỏ env Supabase nếu còn.
3. Submit thử Owner + Guest trên Production URL → kiểm tra dòng mới trong Neon.
4. (Tuỳ chọn) Tắt workflow GitHub Pages `deploy.yml` (ngoài scope) để tránh Action fail.

**Mục tiêu:** Khảo sát ghi trực tiếp vào **Neon PostgreSQL** qua API route bảo mật (`DATABASE_URL` chỉ
server-side), giao diện giữ nguyên, không còn phụ thuộc Supabase/Google Sheets.
