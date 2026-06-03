# PROMPT 20 — BÁO CÁO GIẢM CHIỀU CAO HEADER MOBILE

## 1. Tóm tắt nhiệm vụ
Giảm chiều cao Header trên mobile từ khoảng 96px xuống khoảng 64px, giữ nguyên layout desktop. Chỉ chỉnh kích thước (height/padding/logo), không redesign, không đổi nav/logo/màu/font.

## 2. Root cause
- File `src/app/components/layout/header/index.tsx` (dòng 56): container header dùng class cố định `h-24` (= 96px) cho **mọi** breakpoint, không có biến thể responsive. Vì vậy mobile cao đúng 96px.
- File `src/app/components/layout/header/logo/index.tsx`: logo mobile dùng `h-12` (= 48px), khá lớn, góp phần làm header trông cao và đầy.

## 3. File đã đọc
- src/app/components/layout/header/index.tsx
- src/app/components/layout/header/logo/index.tsx

(Header không import ThemeToggler riêng — chỉ có nút hamburger 3 gạch và CTA. Không có theme toggle tách rời trong header hiện tại.)

## 4. File đã sửa
- src/app/components/layout/header/index.tsx
- src/app/components/layout/header/logo/index.tsx

## 5. Thay đổi đã áp dụng
- **Mobile header height/padding**:
  - `h-24` -> `h-16 lg:h-24`
  - Mobile/tablet: `h-16` = 64px. Desktop (lg, >=1024px nơi nav xuất hiện): giữ nguyên `lg:h-24` = 96px.
- **Mobile logo size**:
  - `h-12 ... sm:h-14 ... lg:h-16` -> `h-10 ... lg:h-16`
  - Mobile/tablet: `h-10` = 40px (trong khoảng yêu cầu 36–44px), `object-contain` giữ nguyên nên không méo.
  - Desktop: `lg:h-16` = 64px, giữ nguyên như cũ.
  - Đã bỏ `sm:h-14` (56px) vì 56px gần lấp đầy header 64px ở dải tablet; giờ logo 40px gọn trong header 64px.
- **Hamburger / theme toggle**: KHÔNG đổi. Nút hamburger vẫn `p-2`, ba thanh `w-6`, vùng bấm thoải mái. CTA desktop giữ nguyên.
- **Desktop có bị ảnh hưởng không**: Không. Tại breakpoint `lg` header vẫn `h-24` (96px) và logo vẫn `h-16` (64px) — đúng như trước.

## 6. Kiểm tra responsive
- **Mobile 375px / 390px**: header `h-16` = 64px, logo 40px nằm gọn, hamburger bên phải dễ bấm. Không overflow ngang.
- **Desktop 1440px**: header `h-24` = 96px, nav + CTA giữ nguyên bố cục cũ.
- **Không overflow**: container vẫn `max-w-screen-xl px-4`, không thêm phần tử gây tràn.
- **Hero không bị che**: header là `fixed`, việc giảm chiều cao không tạo khoảng trắng lớn và không che Hero (không sửa Hero).

## 7. Validation
- `npx tsc --noEmit`: PASS (TSC_OK).
- `pnpm build`: PASS (build hoàn tất, sinh đủ route, không lỗi).

## 8. Screenshot
- Không có tool chụp màn hình tự động trong môi trường này. Không tạo ảnh giả.
- Các file `PROMPT_20_HEADER_MOBILE_AFTER.png` / `PROMPT_20_HEADER_DESKTOP_AFTER.png` KHÔNG được tạo.

## 9. Git commit/push
- Commit hash: `e403fa4`
- Message: `fix: reduce mobile header height`
- Files: 2 files changed, 3 insertions(+), 29 deletions(-)
- Push: `f7ec869..e403fa4  main -> main` — thành công.
- Không stage/commit: .env, .env.local, node_modules, .next, out, .vercel.
- Report này untracked (chưa commit) để giữ commit runtime sạch.

## 10. Những phần không đụng tới
Xác nhận KHÔNG sửa: Hero, Why, SurveyFlow, About, Footer, API route (`src/app/api/**`), logic Neon/Supabase/Google Sheets (`src/lib/**`), `next.config.mjs`, `package.json`, `pnpm-lock.yaml`, `.env`, `.env.local`, `public/**`, `globals.css`. Không thêm package, không dùng emoji, không đổi nav text/href/logo asset/màu brand/font Montserrat.

## 11. Kết luận
PASS — Header mobile giảm còn ~64px, logo gọn không méo, hamburger/CTA bấm tốt, desktop giữ nguyên, type-check + build PASS, commit/push thành công, không sửa ngoài scope.

## 12. Bước tiếp theo & mục tiêu
- Chờ Vercel tự redeploy từ commit `e403fa4` trên `main`.
- Sau deploy: kiểm tra thực tế trên mobile thật (375px/390px) xác nhận header gọn ~64px và Hero hiển thị đúng.
- Mục tiêu kế tiếp (tuỳ chọn): rà soát spacing đầu trang Hero nếu muốn tinh chỉnh thêm khoảng cách dưới header trên mobile.
