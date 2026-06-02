# PROMPT 05 — BÁO CÁO SECTION “LÝ DO THAM GIA”

## 1. Tóm tắt nhiệm vụ

Chỉ thêm section `Lý do tham gia` ngay sau Hero trên trang chủ.

Section mới dùng nội dung khảo sát BBOTech, giữ palette xanh hiện tại, responsive desktop/mobile và không thay đổi Header, Hero hoặc các section cũ.

## 2. File đã đọc

- `markdown/PROMPT_01_SRC_SCAN_REPORT.md`
- `markdown/PROJECT_SRC_ARCHITECTURE_MAP.md`
- `markdown/PROMPT_02_BRAND_COLOR_SWAP_REPORT.md`
- `markdown/PROMPT_03_HEADER_NAV_LOGO_FIX_REPORT.md`
- `markdown/PROMPT_04_HERO_TEXT_UPDATE_REPORT.md`
- `src/app/page.tsx`
- `src/app/components/home/property-option/index.tsx`
- `src/app/components/home/hero/index.tsx`
- `src/app/components/shared/features/index.tsx`
- `src/app/components/home/history/index.tsx`
- `src/app/components/home/info/index.tsx`
- `src/app/globals.css`
- `src/utils/extendedConfig.ts`
- `src/utils/pathUtils.ts`

## 3. File đã sửa

- `src/app/components/home/why/index.tsx` — tạo mới section Why.
- `src/app/page.tsx` — chỉ thêm import và render `<Why />` ngay sau `<Hero />`.

File screenshot đã tạo:

- `markdown/PROMPT_05_WHY_SECTION_DESKTOP.png`
- `markdown/PROMPT_05_WHY_SECTION_MOBILE.png`

## 4. Section được xử lý

Đã tạo component mới:

`src/app/components/home/why/index.tsx`

Section được render ngay sau Hero và trước `DiscoverProperties` trên trang chủ.

Không chuyển đổi `src/app/components/home/property-option/index.tsx` vì component đó còn được import tại route chi tiết bất động sản. Việc thay thế component đó sẽ gây thay đổi ngoài landing page.

`src/app/page.tsx` chỉ được sửa tối thiểu:

- Thêm `import Why from './components/home/why';`
- Thêm `<Why />` ngay sau `<Hero />`

Không đổi thứ tự các section cũ.

## 5. Nội dung đã thêm

### Section

- Id: `why-anchor`
- Eyebrow: `Lý do tham gia`
- Title: `Vì sao khảo sát này quan trọng?`
- Description: `Khách hàng cần phản hồi nhanh hơn, khách sạn nhỏ thiếu nhân sự và công cụ, nhiều quy trình còn thủ công. BBOTech muốn hiểu đúng vấn đề trước khi đề xuất giải pháp.`

### Card

1. `Hiểu khó khăn vận hành`
   - `Lắng nghe vấn đề thực tế hằng ngày của khách sạn vừa và nhỏ.`
2. `Ghi nhận nhu cầu`
   - `Nắm đúng mong muốn của các cơ sở lưu trú quy mô nhỏ.`
3. `Tìm điểm tối ưu`
   - `Xác định khâu có thể cải thiện bằng công nghệ phù hợp.`
4. `Tạo tài nguyên hữu ích`
   - `Trả lại checklist và insight thiết thực cho người tham gia.`

### CTA

- Text: `Làm khảo sát 3 phút`
- Href: `#surveyAnchor`

## 6. Icon đã dùng

- Dùng 4 inline SVG đơn giản.
- SVG dùng `stroke="currentColor"` và thuộc tính JSX hợp lệ như `strokeWidth`, `strokeLinecap`, `strokeLinejoin`.
- Không dùng emoji.
- Không dùng Font Awesome.
- Không cài package mới.

## 7. Những phần không đụng tới

- [x] Không sửa Header.
- [x] Không sửa Hero.
- [x] Không sửa ảnh.
- [x] Không sửa route.
- [x] Không sửa data.
- [x] Không sửa public assets.
- [x] Không cài package.
- [x] Không git commit.
- [x] Không git push.

## 8. Kiểm tra giao diện

- [x] Desktop section hiển thị đúng.
- [x] Mobile section hiển thị đúng.
- [x] Desktop hiển thị 4 card trên một hàng.
- [x] Mobile hiển thị card theo một cột.
- [x] 4 card không vỡ layout.
- [x] Không tràn ngang.
- [x] Tone xanh lá giữ nguyên.
- [x] Không còn nội dung bất động sản trong section Why.
- [x] Anchor `#why-anchor` hoạt động.
- [x] CTA trỏ tới `#surveyAnchor`.

Kiểm tra anchor:

- Header đã có `href="#why-anchor"`.
- Section mới có `id="why-anchor"`.
- Bản export đã được mở tại URL có fragment `#why-anchor` để xác nhận section được cuộn tới.

## 9. Validation

### `npx tsc --noEmit`

**PASS**

Không có TypeScript error.

### `pnpm build`

**PASS**

Next.js compile, type validation, static page generation và export đều hoàn tất.

### `git diff --stat`

**KHÔNG CHẠY ĐƯỢC**

Không chạy được git diff vì project không có metadata `.git`.

### `git diff -- src/app/page.tsx src/app/components/home src/app/components/shared`

**KHÔNG CHẠY ĐƯỢC**

Không chạy được git diff vì project không có metadata `.git`.

### `pnpm lint`

**KHÔNG CHẠY**

Build đã compile và kiểm tra type thành công. Không ép chạy lint trong phạm vi Prompt 05.

### Kiểm tra runtime

- Build export được phục vụ qua server tĩnh tạm có rewrite `basePath`.
- Trang chủ tải thành công với `HTTP 200`.
- HTML export có `id="why-anchor"`.
- HTML export có đúng title, 4 card và CTA.
- HTML export xác nhận section `Discover Properties` cũ vẫn nằm sau section Why.

## 10. Screenshot

- `markdown/PROMPT_05_WHY_SECTION_DESKTOP.png`
- `markdown/PROMPT_05_WHY_SECTION_MOBILE.png`

## 11. Lưu ý còn lại

- `#surveyAnchor` chưa có section đích. Section khảo sát cần được tạo ở prompt sau.
- Các section cũ bên dưới Why vẫn còn nội dung bất động sản, ví dụ `Discover Properties`. Không sửa vì ngoài phạm vi Prompt 05.
- `property-option` được giữ nguyên để không ảnh hưởng route chi tiết bất động sản đang sử dụng component này.

## 12. Kết luận

**PASS**

Section `Lý do tham gia` đã được thêm đúng sau Hero, có đủ nội dung, 4 card, CTA, anchor và responsive desktop/mobile. Header, Hero và các section cũ không bị chỉnh sửa.

## 13. Bước tiếp theo & mục tiêu

**Bước tiếp theo:** Gửi screenshot desktop/mobile và report Prompt 05 để kiểm tra.

**Mục tiêu:** Xác nhận section `Lý do tham gia` đúng nội dung, đúng anchor, đúng style trước khi chuyển sang section `Đối tượng` hoặc `Khảo sát`.
