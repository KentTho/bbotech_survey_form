# PROMPT 16 — BÁO CÁO GITHUB PUSH + VERCEL DEPLOY

## 1. Tóm tắt nhiệm vụ
Đẩy toàn bộ project `property-nextjs-1.0.0` (BBOTech hotel survey landing page) lên GitHub repo mới
`KentTho/bbotech_survey_form`, đảm bảo **không commit secrets/env thật**, và soạn checklist deploy
lên Vercel. **Không** đụng logic survey / Apps Script / Google Sheet / UI.

Kết quả: **PASS** — type-check + build PASS, không commit secret, remote đúng, push `main` thành công.

## 2. File đã đọc/kiểm tra
- `.gitignore` (đọc + bổ sung).
- `.env` (chỉ kiểm tra **đã được ignore**, **không in giá trị**).
- `.env.example` (đọc — phát hiện chứa URL thật → thay placeholder).
- `.github/workflows/deploy.yml` (kiểm tra secret + cơ chế deploy).
- `git status`, `git remote -v`, `git diff --cached --name-only` (kiểm tra staged).

## 3. File đã sửa
- **`.gitignore`**: thêm `.env`, `.env.local`, `.env.*.local` (trước đó **chỉ có** `.env*.local`,
  thiếu `.env` trần → `.env` đang KHÔNG được ignore).
- **`.env.example`**: thay URL Apps Script **thật** (`AKfycbwNQMH…`) bằng placeholder
  `https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXX/exec` để không commit endpoint thật.
- **Không** sửa bất kỳ file UI / survey / Apps Script / mapping nào.

## 4. Git ignore / secret check
| Mục | Trạng thái |
| --- | --- |
| `.env` có bị commit không? | ❌ **KHÔNG** — đã ignore (`git check-ignore .env` → khớp), không staged |
| `.env.local` có bị commit không? | ❌ **KHÔNG** — đã ignore (file này thực tế không tồn tại trong repo) |
| `node_modules` bị commit không? | ❌ **KHÔNG** — `/node_modules` trong `.gitignore`, không staged |
| `.next` bị commit không? | ❌ **KHÔNG** — `/.next/` ignore, không staged |
| `out` bị commit không? | ❌ **KHÔNG** — `/out/` ignore, không staged |
| `.vercel` bị commit không? | ❌ **KHÔNG** — `.vercel` ignore |

`.gitignore` sau khi cập nhật đã có đủ: `node_modules`, `.next`, `out`, `.env`, `.env.local`,
`.env.*.local`, `.vercel`.

> Lưu ý bảo mật: `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` về bản chất là biến `NEXT_PUBLIC` (trình
> duyệt nhìn thấy được), **không phải secret server**. Tuy vậy vẫn KHÔNG commit `.env` thật và đã
> thay URL thật trong `.env.example` bằng placeholder để giữ vệ sinh repo. URL thật chỉ nằm trong
> `.env` (local, đã ignore) và sẽ được cấu hình lại ở **Vercel Environment Variables**.

**Quét workflow:** `.github/workflows/deploy.yml` không chứa token/secret hardcode (chỉ khai báo
`permissions: id-token: write` cho OIDC GitHub Pages).

## 5. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled successfully`, generate đầy đủ route static/SSG, không lỗi).

→ Không push bản lỗi; cả hai bước đều xanh trước khi commit.

## 6. Git remote
- `origin` ban đầu: **chưa có** → đã `git remote add origin`.
- `origin` hiện tại (fetch & push):
  `https://github.com/KentTho/bbotech_survey_form.git` ✅

## 7. Commit
- Branch: `master` → đổi tên thành `main` (`git branch -M main`).
- Commit message: `feat: build BBOTech hotel survey landing page`
- Commit hash: **`a2602e7`** (đầy đủ `a2602e7daad28ba2a36d1540f584201243c846bb`).
- Số file commit: **213** file source (loại trừ env/dep/build).

## 8. Push result
- Branch: `main`
- Lệnh: `git push -u origin main`
- Kết quả: **PASS** ✅ — `* [new branch] main -> main`, `main` track `origin/main`.
- Xác nhận đồng bộ: `HEAD` local == `origin/main` == `a2602e7`; working tree **clean**.

## 9. Vercel deploy checklist
Hướng dẫn deploy lên Vercel (làm trên dashboard `vercel.com`):

1. **Vercel → Add New… → Project**.
2. **Import Git Repository** → chọn `KentTho/bbotech_survey_form` (kết nối GitHub account nếu chưa).
3. **Framework Preset:** Next.js (Vercel tự nhận diện).
4. **Build & Output Settings:**
   - Install Command: `pnpm install` (repo có `pnpm-lock.yaml`; Vercel auto-detect pnpm).
   - Build Command: `pnpm build` (hoặc để mặc định `next build`).
   - Output: để mặc định (Vercel xử lý Next.js).
   > ⚠️ Repo hiện có **cả `package-lock.json` lẫn `pnpm-lock.yaml`**. Nếu Vercel chọn nhầm package
   > manager, hãy đặt Install Command tường minh `pnpm install` hoặc xoá `package-lock.json` ở một
   > prompt dọn dẹp riêng (KHÔNG xử lý trong Prompt 16).
5. **Environment Variables** (Settings → Environment Variables), thêm cho cả Production/Preview:
   - `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` = URL `/exec` thật của Apps Script Web App đang dùng
     (lấy từ `.env` local — KHÔNG có trong repo). Đây là biến frontend cần để submit khảo sát.
6. **Deploy** → chờ build xanh → mở Production URL, submit thử 1 Owner + 1 Guest để xác nhận luồng
   ghi Google Sheet vẫn chạy.

> **Nếu sau này chuyển sang database** (thay Google Sheet): **chưa** triển khai database ở Prompt 16.
> Việc đó cần một **Prompt DB riêng** (chọn DB, schema, API route, env `DATABASE_URL`/secret server,
> migrate). Khi đó mới thêm biến môi trường tương ứng vào Vercel.

> **Lưu ý GitHub Actions:** repo có sẵn `.github/workflows/deploy.yml` deploy lên **GitHub Pages**
> (static export `./out`, trigger khi push `main`, dùng `npm ci`). Đây là kênh deploy **song song,
> độc lập** với Vercel. Nếu chỉ muốn dùng Vercel, có thể tắt/xoá workflow này ở một prompt riêng
> (ngoài phạm vi Prompt 16). GitHub Pages là static nên submit khảo sát vẫn hoạt động vì frontend
> gọi thẳng Apps Script qua biến `NEXT_PUBLIC_...` (cần build-time env nếu dùng kênh này).

## 10. Những phần không đụng tới
- [x] Không commit `.env` / `.env.local` / token / secret / credentials.
- [x] Không commit `node_modules` / `.next` / `out` / `.vercel`.
- [x] Không sửa Header / Hero / Why / Survey / About / Footer.
- [x] Không đổi font / màu / layout.
- [x] Không sửa Apps Script (chỉ là file markdown hướng dẫn, không đụng ở prompt này).
- [x] Không tích hợp database.
- [x] Không sửa Google Sheet logic / mapping 21 cột.
- [x] Chỉ xử lý: GitHub push + dọn secret trong `.gitignore`/`.env.example` + Vercel checklist.

## 11. Kết luận
**PASS**

| Điều kiện PASS | Trạng thái |
| --- | --- |
| 1. Type-check / build PASS | ✅ |
| 2. Không commit secrets | ✅ (`.env` ignore, `.env.example` placeholder) |
| 3. Git remote đúng | ✅ `KentTho/bbotech_survey_form.git` |
| 4. Push lên GitHub PASS | ✅ `main` @ `a2602e7` |
| 5. Report tiếng Việt tạo xong | ✅ (file này) |

## 12. Bước tiếp theo & mục tiêu
**Bước tiếp theo (user):**
1. Vào Vercel → Import `KentTho/bbotech_survey_form` → set env
   `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` (URL `/exec` thật) → Deploy.
2. Sau deploy, submit thử Owner + Guest trên Production URL để xác nhận ghi Google Sheet.
3. (Tách prompt riêng nếu cần) Hoàn tất **Prompt 15B**: deploy Apps Script `HEADER_ROW=3` để POST
   trả `ok:true` (hiện endpoint vẫn chặn `Header mismatch` cho tới khi deploy bản mới).
4. (Tuỳ chọn, prompt dọn dẹp riêng) Quyết định giữ 1 trong 2 kênh deploy (Vercel **hoặc** GitHub
   Pages) và thống nhất 1 lockfile (pnpm).

**Mục tiêu:** Project đã ở trên GitHub, sẵn sàng import vào Vercel; sau khi cấu hình env và deploy,
landing page chạy production và luồng khảo sát ghi đúng vào Google Sheet.
