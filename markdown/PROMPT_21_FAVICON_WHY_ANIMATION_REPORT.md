# PROMPT 21 — BÁO CÁO FAVICON + WHY ANIMATION

## 1. Tóm tắt nhiệm vụ
Xác định file quản lý Head/metadata/favicon của project, ghi rõ chỗ cần thay favicon (không tự tạo favicon giả vì user chưa cung cấp ảnh mới), và thêm hiệu ứng scroll animation nhẹ nhàng cho section Why. Không cài package, không phá layout, không commit file report.

## 2. File Head / Metadata / Favicon
- **Head/metadata nằm ở đâu**: `src/app/layout.tsx` (Root Layout, App Router). Hiện tại file này KHÔNG có `export const metadata`, không cấu hình `metadata.icons`, không dùng `<Head>` thủ công.
- **Favicon hiện tại lấy từ đâu**: `public/favicon.ico` — Next.js serve mặc định tại `/favicon.ico`. Không có file-based metadata icon nào trong `src/app/` (không tồn tại `src/app/favicon.ico`, `src/app/icon.png`, `src/app/apple-icon.png`).
- **Muốn thay favicon thì thay file nào** (ưu tiên file-based metadata của App Router):
  - Cách 1 (khuyến nghị): đặt file mới `src/app/favicon.ico` hoặc `src/app/icon.png` (và `src/app/apple-icon.png` cho iOS). Next.js tự generate `<link rel="icon">`.
  - Cách 2: thay trực tiếp ảnh `public/favicon.ico` bằng file cùng tên.
- **Trạng thái lần này**: User chưa cung cấp ảnh favicon mới nên KHÔNG đổi ảnh, KHÔNG sửa `layout.tsx`. Chỉ ghi rõ chỗ cần thay.

## 3. File đã đọc
- src/app/layout.tsx
- src/app/components/home/why/index.tsx
- src/app/globals.css
- Kiểm tra tồn tại: src/app/favicon.ico, src/app/icon.png, src/app/apple-icon.png (không có), public/favicon.ico (có)

## 4. File đã sửa
- src/app/components/home/why/index.tsx
- src/app/globals.css

(Không sửa layout.tsx, không thay favicon vì chưa có ảnh mới.)

## 5. Hiệu ứng Why đã thêm
- **Scroll trigger**: Chuyển Why thành client component (`"use client"`), dùng `useRef` + `useState` + `useEffect` với `IntersectionObserver` (threshold 0.2). Khi section vào viewport: set `isVisible = true`, gắn class `is-visible` vào root `.why-section`, rồi `unobserve` để chạy 1 lần.
- **Fade up**: Eyebrow/title/description (class `.why-animate`) và nút CTA chạy keyframe `whyFadeUp` (opacity 0 -> 1, translateY(28px) scale(0.98) -> 0/1) trong 700ms, easing cubic-bezier(0.22, 1, 0.36, 1).
- **Stagger card**: Mỗi card bọc trong `.why-card-animate` với CSS variable `--delay` lần lượt 0ms / 90ms / 180ms / 270ms qua `animation-delay: var(--delay)`.
- **Hover lift**: `<article>` giữ hover nâng nhẹ (`hover:-translate-y-1.5`). Tách entrance animation (trên wrapper `.why-card-animate`) khỏi hover transform (trên `<article>` bên trong) để `animation-fill: forwards` không phá hiệu ứng hover.
- **Icon hover scale**: icon bọc class `.why-icon`, hover card -> `transform: scale(1.08)` (transition 300ms).
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` tắt animation, đặt opacity 1, transform none -> nội dung hiển thị ngay, không hiệu ứng mạnh.
- **Chống layout shift / equal height**: wrapper `.why-card-animate h-full` + `<article>` `flex h-full flex-col` giữ chiều cao card đều như trước. CSS scope riêng bằng prefix `.why-` nên không ảnh hưởng section khác.

## 6. Validation
- `npx tsc --noEmit`: PASS (TSC_OK).
- `pnpm build`: PASS (build hoàn tất, đủ route, không lỗi).
- Search: không có `console.log`, không `localStorage`/`sessionStorage` trong Why/globals. Không đụng API/DB.
- Không cài package mới (không Framer Motion); animation thuần CSS + IntersectionObserver native.

## 7. Git commit/push
- Commit hash: `c21bf83`
- Message: `feat: add scroll animation to why section`
- Files: 2 files changed, 99 insertions(+), 14 deletions(-) — chỉ `src/app/components/home/why/index.tsx` và `src/app/globals.css`.
- Push: `e403fa4..c21bf83  main -> main` — thành công.
- **Xác nhận KHÔNG commit report md**: tất cả file `markdown/*.md` (gồm report Prompt 20 và report Prompt 21 này) vẫn untracked, không stage, không commit. Không stage .env/.env.local/node_modules/.next/out/.vercel.

## 8. Những phần không đụng tới
KHÔNG sửa: Header (`layout/header/**`), Hero (`home/hero/**`), SurveyFlow (`home/survey-flow/**`), About (`home/about/**`), Footer (`layout/footer/**`), API (`api/**`), DB/Neon/Supabase logic (`src/lib/**`), `.env`, `.env.local`, `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `public/**`, `layout.tsx`. Không đổi nội dung Why, màu brand, font Montserrat. Không emoji.

## 9. Kết luận
PASS — Đã xác định đúng file Head/favicon và chỗ thay favicon; Why có animation scroll nhẹ, bắt mắt, có stagger + hover + reduced motion; không cài package; không phá layout; type-check/build PASS; commit/push PASS; không commit report md; không sửa ngoài scope.

## 10. Bước tiếp theo & mục tiêu
- Khi có ảnh favicon mới: đặt `src/app/favicon.ico` hoặc `src/app/icon.png` (+ `apple-icon.png`) rồi build/redeploy; không cần sửa code.
- Chờ Vercel tự redeploy từ commit `c21bf83`, kiểm tra hiệu ứng Why trên mobile thật (375/390px) và desktop, đảm bảo không layout shift.
- Mục tiêu kế tiếp (tuỳ chọn): nếu muốn đồng bộ, có thể áp pattern animation tương tự cho các section khác (About) khi được yêu cầu.
