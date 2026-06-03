# PROMPT 17 — BÁO CÁO FIX VERCEL NEXT.JS SECURITY BLOCK

## 1. Tóm tắt nhiệm vụ
Vercel build của repo `KentTho/bbotech_survey_form` **compile/export thành công** nhưng bị **chặn ở
bước security check** với cảnh báo *"Vulnerable version of Next.js detected, please update
immediately"* do project đang chạy `next@15.5.6`. Đã **nâng Next.js lên bản patched `15.5.18`** (cùng
nhánh 15.x), **dọn `package-lock.json`** để Vercel khoá đúng pnpm, validate local PASS, commit + push
lên `main`. **Không** đụng UI / survey / Apps Script / Google Sheet / env.

Kết quả: **PASS** (phần trong tầm kiểm soát của repo). Bước redeploy Vercel là thao tác cuối user xác
nhận trên dashboard.

## 2. Root cause
- Vercel **build compile PASS**, **generate static pages PASS**, **export PASS**.
- Bị **block ở bước security advisory check** của Vercel, KHÔNG phải lỗi biên dịch.
- Version cũ: **`next@15.5.6`** — nằm trong danh sách advisory bị Vercel chặn.
- Nguyên nhân resolve: `package.json` khai báo range `"next": "^15.1.1"` → lockfile resolve lên
  `15.5.6` (bản dính lỗ hổng). Cần pin/nâng lên bản đã vá `15.5.18`.

## 3. File đã đọc
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json` (xác nhận tồn tại song song)
- `.gitignore` (gián tiếp qua secret check)
- `markdown/PROMPT_16_GITHUB_VERCEL_DEPLOY_REPORT.md` (bối cảnh — đã ghi nhận cảnh báo 2 lockfile)
- (Không có file log Vercel dạng .txt/.md trong repo — dùng log mô tả trong đề bài.)

## 4. File đã sửa
- `package.json` — đổi version Next.
- `pnpm-lock.yaml` — cập nhật resolve `next@15.5.18`.
- `package-lock.json` — **đã XOÁ** (project dùng pnpm).

## 5. Dependency change
| Mục | Trước | Sau |
| --- | --- | --- |
| `next` (package.json) | `^15.1.1` (resolve 15.5.6) | `^15.5.18` (resolve **15.5.18**) |
| `react` | `^19.0.0` (19.2.0) | `^19.0.0` (19.2.0) — **không đổi** |
| `react-dom` | `^19.0.0` (19.2.0) | `^19.0.0` (19.2.0) — **không đổi** |
| Package manager | pnpm (v10.11.0) | pnpm (v10.11.0) — **không đổi** |

- Lệnh dùng: `pnpm add next@15.5.18`.
- **React / React DOM KHÔNG bị đổi** ngoài ý muốn (vẫn 19.2.0).
- `pnpm-lock.yaml` chỉ đổi 45 dòng quanh `next@15.5.6 → 15.5.18` (không kéo theo dependency lạ).
- Cảnh báo peer dep `next-themes 0.3.0` muốn `react ^16/17/18` nhưng có `react 19.2.0` là **có sẵn
  từ trước**, KHÔNG do upgrade này, và không làm build fail.
- Lưu ý: pnpm báo `16.2.7 is available` — **CỐ Ý không nâng lên Next 16** (đề bài yêu cầu giữ nhánh
  15.x, chỉ đổi Next 16 nếu 15.5.18 build fail; mà 15.5.18 build PASS).

## 6. Lockfile cleanup
- **Có xoá `package-lock.json`?** ✅ **CÓ** (`git rm package-lock.json`).
- **Vì sao:** repo đang dùng **pnpm** (có `pnpm-lock.yaml`, Vercel cũng detect pnpm). Giữ song song 2
  lockfile dễ khiến Vercel/CI chọn nhầm package manager và resolve khác nhau.
- **`pnpm-lock.yaml` còn không?** ✅ **CÒN** (giữ nguyên, đã cập nhật `next@15.5.18`).

## 7. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled successfully`, generate đầy đủ route static/SSG, export OK,
  không lỗi).

## 8. Git commit/push
- Commit: **`dea786a`** (`dea786aa4778b39d95c72ce87a085b2fccb6ccce`).
- Message: `fix: upgrade Next.js patched version for Vercel`
- Nội dung commit (đúng 3 file): xoá `package-lock.json`, sửa `package.json`, sửa `pnpm-lock.yaml`.
- Branch: `main`.
- Push: **PASS** ✅ — `a2602e7..dea786a  main -> main`; local == `origin/main` == `dea786a`.
- **Không** commit kèm report Prompt 16 (vẫn để untracked) để giữ commit fix sạch. Report Prompt 17
  này được tạo **sau commit** và hiện cũng **untracked** (chưa push) — báo để user quyết định.

## 9. Vercel redeploy instruction
1. Vì repo đã connected, **Vercel sẽ AUTO redeploy** khi có commit mới trên `main` (`dea786a`).
2. Nếu không auto: vào **Vercel → Project → Deployments → (commit mới nhất) → Redeploy**.
3. Kiểm tra build log: **KHÔNG còn dòng** *"Vulnerable version of Next.js detected"*; log phải hiển
   thị Next.js **15.5.18**.
4. Mở **Production URL** xác nhận trang load được.
5. Kiểm tra **Environment Variables**: `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` đã set đúng URL `/exec`
   thật chưa (env này KHÔNG có trong repo — phải cấu hình trên Vercel; xem Prompt 16). Sau đó submit
   thử 1 Owner + 1 Guest để xác nhận luồng ghi Google Sheet.

## 10. Những phần không đụng tới
- [x] Không sửa Header / Hero / Why / SurveyFlow / About / Footer (`src/app/components/**`).
- [x] Không sửa `src/app/page.tsx`, `src/app/layout.tsx`.
- [x] Không sửa Apps Script docs.
- [x] Không sửa Google Sheet mapping (21 cột).
- [x] Không đổi font / màu / layout.
- [x] Không commit `.env` / `.env.local`; không sửa env thật; không đụng `.env.example`.
- [x] Không tích hợp database.
- [x] Không nâng React/React DOM; không nâng Next lên 16.

## 11. Kết luận
**PASS**

| Điều kiện PASS | Trạng thái |
| --- | --- |
| 1. Next nâng lên 15.5.18 | ✅ |
| 2. Type-check PASS | ✅ |
| 3. Build PASS | ✅ |
| 4. Không commit secrets | ✅ |
| 5. Push PASS | ✅ `dea786a` |
| 6. Vercel redeploy hết security block | ⏳ chờ user redeploy xác nhận (fix đã đúng nguồn gốc) |
| 7. Report tiếng Việt | ✅ (file này) |

## 12. Bước tiếp theo & mục tiêu
**Bước tiếp theo:** Redeploy Vercel từ commit mới `dea786a` (auto hoặc thủ công), kiểm tra build log
không còn cảnh báo Next.js vulnerable và Production URL load được; xác nhận env
`NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` đã set.

**Mục tiêu:** Vercel deploy PASS, không còn bị chặn bởi Next.js vulnerable version; landing page chạy
production, luồng khảo sát ghi đúng vào Google Sheet.
