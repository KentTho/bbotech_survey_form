# PROMPT 07 - BÁO CÁO BBOTECH INTRO + PRIVACY + FOOTER

## 1. Tóm tắt nhiệm vụ

Đã thêm và chỉnh đúng ba phần cuối của landing page:

- BBOTech Intro
- Privacy note
- Footer

Font Montserrat và tone xanh lá hiện tại được giữ nguyên. Không thay đổi các section đã duyệt.

## 2. File đã đọc

- `markdown/PROMPT_01_SRC_SCAN_REPORT.md`
- `markdown/PROJECT_SRC_ARCHITECTURE_MAP.md`
- `markdown/PROMPT_02_BRAND_COLOR_SWAP_REPORT.md`
- `markdown/PROMPT_03_HEADER_NAV_LOGO_FIX_REPORT.md`
- `markdown/PROMPT_04_HERO_TEXT_UPDATE_REPORT.md`
- `markdown/PROMPT_05_WHY_SECTION_REPORT.md`
- `markdown/PROMPT_06_AUDIENCE_INCENTIVE_SURVEY_LAYOUT_REPORT.md`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/app/components/home/why/index.tsx`
- `src/app/components/layout/footer/index.tsx`
- `src/app/components/layout/header/index.tsx`
- `src/app/components/layout/header/logo/index.tsx`
- `src/utils/extendedConfig.ts`
- `src/utils/pathUtils.ts`
- `package.json`
- `tailwind.config.ts`

## 3. File đã sửa

- Tạo mới `src/app/components/home/about/index.tsx`
- Sửa `src/app/page.tsx`
- Sửa `src/app/components/layout/footer/index.tsx`
- Tạo các screenshot Prompt 07 trong `markdown`

Không sửa `src/app/globals.css` vì Tailwind class hiện có đã đủ dùng.

## 4. Footer thật đã xác định

- Footer được import trong `src/app/layout.tsx`
- Footer component thật nằm tại `src/app/components/layout/footer/index.tsx`
- Đã sửa đúng file `src/app/components/layout/footer/index.tsx`
- Không tạo Footer giả trong `src/app/page.tsx`

## 5. Component/section đã tạo

Đã tạo component:

`src/app/components/home/about/index.tsx`

Component được render ngay sau `<SurveyFlow />` trong `src/app/page.tsx`.

Anchor đã thêm:

`id="about-anchor"`

## 6. BBOTech Intro

- Anchor: `id="about-anchor"`
- Eyebrow: `Về chúng tôi`
- Title: `BBOTech là ai?`
- Description: `BBOTech cung cấp giải pháp công nghệ ứng dụng AI, Automation và TaaS, đóng vai trò như một phòng IT linh hoạt cho doanh nghiệp nhỏ.`
- Tags: `AI`, `Automation`, `TaaS`
- CTA: `Tìm hiểu BBOTech`
- CTA href: `#surveyAnchor`
- Logo: dùng asset BBOTech hiện có `/images/logo/logo.png`, không sửa public asset

## 7. Privacy note

- Title: `Thông tin của bạn được dùng để tổng hợp nghiên cứu`
- Description: `Dữ liệu khảo sát được dùng cho mục đích phân tích nhu cầu thị trường và liên hệ tư vấn chỉ khi người tham gia đồng ý. Bạn xác nhận đồng ý ngay ở bước cuối khảo sát.`
- Icon: inline SVG shield/check
- Vị trí: ngay sau card BBOTech Intro, trong component About

## 8. Footer

Footer mới gồm:

- Brandmark chữ: `BBOTech`
- Copyright: `© 2026 BBOTech · Khảo sát khách sạn Vũng Tàu`

Đã bỏ toàn bộ nội dung Footer bất động sản cũ:

- Address template
- Social link giả
- Quick Links
- Properties
- Blog bất động sản
- Popular Searches
- Phone và email template
- Newsletter
- ThemeWagon attribution

Desktop hiển thị brand bên trái và copyright bên phải. Mobile xếp dọc.

Ban đầu kiểm tra asset `/images/logo/logo-white.svg` cho thấy đây vẫn là logo template `Property`, không phải logo BBOTech. Vì Prompt 07 không cho sửa public asset, Footer dùng brandmark chữ `BBOTech`.

## 9. Font Montserrat

- Montserrat vẫn được import từ `next/font/google` trong `src/app/layout.tsx`
- Font vẫn được gán trên `<body>`
- Runtime xác nhận font family: `Montserrat, "Montserrat Fallback"`
- Không đổi sang font khác

## 10. Icon

- About dùng logo asset BBOTech hiện có
- Privacy note dùng inline SVG shield/check
- Không dùng emoji
- Không cài package mới

## 11. Những phần không đụng tới

- Không sửa Header
- Không sửa Hero
- Không sửa Why
- Không sửa SurveyFlow
- Không sửa logic survey
- Không tích hợp Google Sheets
- Không tạo API route
- Không sửa route
- Không sửa data JSON
- Không sửa public assets
- Không sửa `package.json`
- Không sửa `tailwind.config.ts`
- Không git commit
- Không git push

## 12. Kiểm tra giao diện

- [x] About desktop hiển thị đúng
- [x] About mobile hiển thị đúng
- [x] Privacy note desktop/mobile đúng
- [x] Footer desktop/mobile đúng
- [x] Header link `#about-anchor` hoạt động
- [x] Anchor cuộn tới About với top settled `96px`, đúng chiều cao Header
- [x] Desktop không tràn ngang
- [x] Mobile không tràn ngang
- [x] Tone xanh lá giữ nguyên
- [x] Font Montserrat giữ nguyên
- [x] Không còn nội dung Footer bất động sản cũ

Ảnh desktop/mobile tổng hợp hai vùng chụp thật About + Privacy và Footer vì các section cũ vẫn nằm giữa About và Footer theo đúng yêu cầu giữ scope Prompt 07.

## 13. Validation

### `npx tsc --noEmit`

**PASS**

### `pnpm build`

**PASS**

Next.js compile, type validation, static page generation và export đều hoàn tất.

### Kiểm tra runtime

- Static export: `HTTP 200`
- Header link BBOTech: `#about-anchor`
- Click Header link: `true`
- URL fragment sau click: `#about-anchor`
- Anchor top sau smooth scroll: `96px`
- Desktop overflow: `false`
- Mobile overflow: `false`
- Font family: `Montserrat, "Montserrat Fallback"`
- Footer brand: `BBOTech`
- Footer text: `BBOTech | © 2026 BBOTech · Khảo sát khách sạn Vũng Tàu`
- Nội dung Footer cũ: `false`

### `git diff`

Không chạy được git diff vì project không có metadata `.git`.

### `pnpm lint`

Không ép chạy vì các prompt trước đã ghi nhận prompt ESLint của Next.js 15. Type-check và build đã PASS.

## 14. Screenshot

- `markdown/PROMPT_07_ABOUT_PRIVACY_FOOTER_DESKTOP.png`
- `markdown/PROMPT_07_ABOUT_PRIVACY_FOOTER_MOBILE.png`
- `markdown/PROMPT_07_ABOUT_ANCHOR_DESKTOP.png`
- `markdown/PROMPT_07_FOOTER_DESKTOP.png`

## 15. Lưu ý còn lại

- Các section real-estate cũ vẫn render sau About: Calculator, Features, History, Testimonials, CompanyInfo và BlogSmall
- Cần Prompt cleanup riêng nếu muốn xóa hoặc thay các section cũ
- Bộ câu hỏi thật và Google Sheets endpoint vẫn chờ user gửi sau

## 16. Kết luận

PASS

## 17. Bước tiếp theo & mục tiêu

**Bước tiếp theo:** Gửi report và screenshot Prompt 07 để kiểm tra About, Privacy và Footer.

**Mục tiêu:** Xác nhận ba phần cuối đúng brand BBOTech, đúng anchor và đúng Footer thật trước khi cleanup các section cũ hoặc nhập bộ câu hỏi thật.
