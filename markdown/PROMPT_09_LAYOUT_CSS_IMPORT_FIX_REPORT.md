# PROMPT 09 — BÁO CÁO FIX LỖI LAYOUT.TSX / GLOBALS.CSS IMPORT

## 1. Tóm tắt nhiệm vụ
Xử lý lỗi import CSS (Cannot find module './globals.css' or type declarations for side-effect import of './globals.css') trong `layout.tsx` mà không làm vỡ layout, không đổi font Montserrat, và không sửa ngoài phạm vi yêu cầu.

## 2. File đã đọc
- `src/app/layout.tsx`
- `src/app/globals.css`
- `next-env.d.ts`
- `tsconfig.json`

## 3. File đã sửa
Tạo mới file declaration:
- `src/types/css.d.ts`
  Nội dung:
  ```typescript
  declare module "*.css";
  ```

## 4. Nguyên nhân lỗi
Đây là lỗi thiếu CSS declaration (hoặc IDE stale diagnostic) vì TypeScript/IDE yêu cầu khai báo module cho các file `.css` khi import trực tiếp dưới dạng side-effect trong môi trường TypeScript strict mà Next.js environment Types (next-env.d.ts) không cover hết cho IDE. Build `pnpm build` và `npx tsc` thực tế pass nhưng IDE báo lỗi đỏ vì thiếu type definitions ở cấp project.

## 5. Cách xử lý
Tạo file `src/types/css.d.ts` với nội dung tối thiểu:
```typescript
declare module "*.css";
```
File này sẽ được `tsconfig.json` tự động include thông qua rule `**/*.ts`. Cách này giúp loại bỏ IDE diagnostic error triệt để mà không ảnh hưởng runtime hoặc file layout.tsx.

## 6. Kiểm tra Montserrat
- `Montserrat` vẫn được import từ `next/font/google`.
- `globals.css` vẫn được import bình thường.
- `<body>` vẫn dùng `montserrat.className`.
- Không đổi sang font khác.

## 7. Những phần không đụng tới
- Không sửa Header.
- Không sửa Hero.
- Không sửa Why.
- Không sửa SurveyFlow.
- Không sửa About.
- Không sửa Footer.
- Không cleanup section cũ.
- Không tích hợp Google Sheets.
- Không tạo API route.
- Không sửa data JSON.
- Không sửa public assets.
- Không cài package.
- Không git commit/push.

## 8. Validation
- `npx tsc --noEmit`: PASS (Không có lỗi).
- `pnpm build`: PASS (Build thành công).
- Search result liên quan `globals.css`, `declare module "*.css"`, `Montserrat`, `DM_Sans`:
  - `src/types/css.d.ts:1: declare module "*.css";`
  - `src/app/layout.tsx:1: import { Montserrat } from "next/font/google";`
  - `src/app/layout.tsx:2: import "./globals.css";`
  - `src/app/layout.tsx:5: const montserrat = Montserrat({ subsets: ["latin", "vietnamese"] });`
  - Không tìm thấy `DM_Sans`.
- Git diff: "Không chạy được git diff vì project không có metadata .git (hoặc lệnh git failed do Not a git repository)."

## 9. Kiểm tra giao diện
- Desktop load đúng.
- Mobile load đúng.
- Header/Hero/Survey/About/Footer còn hiển thị.
- Font Montserrat giữ nguyên.
- Không tràn ngang.
- Không vỡ layout.

## 10. Screenshot
Đã tạo thành công:
- markdown/PROMPT_09_LAYOUT_CSS_IMPORT_FIX_DESKTOP.png
- markdown/PROMPT_09_LAYOUT_CSS_IMPORT_FIX_MOBILE.png

## 11. Kết luận
PASS

## 12. Bước tiếp theo & mục tiêu
Bước tiếp theo:
Gửi report và screenshot Prompt 09 để kiểm tra lỗi layout.tsx đã hết.

Mục tiêu:
Xác nhận project không còn lỗi import CSS trong editor/build trước khi cleanup section cũ hoặc nhập bộ câu hỏi thật + Google Sheets endpoint.
