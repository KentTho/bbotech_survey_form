# PROMPT 03 — BÁO CÁO FIX HEADER / LOGO / NAVIGATION

## 1. Tóm tắt nhiệm vụ

Chỉ xử lý Header, kích thước logo và thanh điều hướng. Không sửa Hero hoặc section khác.

Kết quả:
- Logo BBOTech đã nằm gọn trong Header.
- Nav desktop đã đổi sang các mục khảo sát tiếng Việt.
- CTA chính đã đổi thành `Bắt đầu khảo sát`.
- Mobile giữ theme toggle và hamburger; CTA được đặt trong drawer để không chen vào logo.

## 2. File đã đọc

- `markdown/PROMPT_01_SRC_SCAN_REPORT.md`
- `markdown/PROJECT_SRC_ARCHITECTURE_MAP.md`
- `markdown/PROMPT_02_BRAND_COLOR_SWAP_REPORT.md`
- `src/app/components/layout/header/index.tsx`
- `src/app/components/layout/header/logo/index.tsx`
- `src/app/components/layout/header/navigation/HeaderLink.tsx`
- `src/app/components/layout/header/navigation/MobileHeaderLink.tsx`
- `src/app/components/layout/header/ThemeToggler.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/utils/extendedConfig.ts`

## 3. File đã sửa

- `src/app/components/layout/header/index.tsx`
- `src/app/components/layout/header/logo/index.tsx`

File kiểm tra giao diện đã tạo:
- `markdown/PROMPT_03_HEADER_DESKTOP.png`
- `markdown/PROMPT_03_HEADER_MOBILE.png`

Không sửa `src/app/globals.css` vì Tailwind hiện có đã đủ cho Header.

## 4. Nguyên nhân lỗi

Trong `src/app/components/layout/header/logo/index.tsx`, hai ảnh logo dùng:

```tsx
style={{ width: 'auto', height: 'auto' }}
```

Khi thay logo mới, ảnh không còn giới hạn chiều cao theo Header. Kích thước nội tại của ảnh có thể làm logo quá lớn, tràn xuống Hero và che nội dung.

Header cũ còn lấy nav từ `layoutdata.json`, render các mục cũ bằng `HeaderLink`, đồng thời hiển thị cụm `Sign In` / `Sign Up` hoặc avatar / `Sign Out`. Cụm này làm Header rối và chiếm thêm chiều ngang.

## 5. Cách xử lý

### Navigation

Nav desktop và mobile đã đổi thành:

- `Lý do tham gia` → `#why-anchor`
- `Đối tượng` → `#aud-anchor`
- `Khảo sát` → `#surveyAnchor`
- `BBOTech` → `#about-anchor`

Đã bỏ nav cũ và bỏ cụm đăng nhập khỏi Header.

### CTA

CTA chính:

- Text: `Bắt đầu khảo sát`
- Href: `#surveyAnchor`
- Màu: dùng `bg-primary` và hover `#207138` từ palette xanh BBO TECH hiện có.

### Logo

Logo vẫn dùng asset hiện có và `next/image`.

Giới hạn kích thước:

- Mobile: `h-12`, tối đa `160px`
- Tablet: `sm:h-14`, tối đa `190px`
- Desktop: `lg:h-16`, tối đa `220px`
- Giữ `w-auto object-contain`

### Mobile / Hamburger

- Nav desktop ẩn dưới breakpoint `lg`.
- Hamburger chỉ hiển thị dưới breakpoint `lg`.
- Drawer mobile giữ chiều rộng tối đa `max-w-xs`.
- CTA mobile nằm trong drawer nên không chen vào logo.
- Theme toggle được giữ lại.

### Lưu ý anchor

Các `href` trong Header đã đúng theo yêu cầu. Tuy nhiên, các section hiện tại chưa có `id` đích tương ứng. Prompt 03 không cho phép sửa Hero hoặc section khác nên chưa thêm các `id` này. Cần bổ sung trong prompt chỉnh section tiếp theo để thao tác cuộn nội trang hoạt động đầy đủ.

## 6. Những phần không đụng tới

- [x] Không sửa Hero.
- [x] Không sửa `src/app/page.tsx`.
- [x] Không sửa data.
- [x] Không sửa route.
- [x] Không sửa business logic ngoài Header.
- [x] Không sửa public assets.
- [x] Không cài package.
- [x] Không git commit.
- [x] Không git push.

## 7. Kiểm tra giao diện

- [x] Desktop Header: logo, nav, theme toggle và CTA nằm ngang, gọn.
- [x] Mobile Header: logo, theme toggle và hamburger nằm gọn; CTA chuyển vào drawer.
- [x] Logo không tràn Header.
- [x] Nav Header không vỡ dòng.
- [x] CTA hiển thị đúng nội dung và màu xanh hiện tại.
- [x] Header không che Hero.
- [x] Header không gây horizontal overflow.

Screenshot:

- `markdown/PROMPT_03_HEADER_DESKTOP.png`
- `markdown/PROMPT_03_HEADER_MOBILE.png`

## 8. Validation

### `npx tsc --noEmit`

**PASS**

Lần chạy đầu chạy song song với build nên gặp lỗi `.next/types` đang được tái tạo. Chạy lại sau build đã PASS, không có TypeScript error.

### `pnpm build`

**PASS**

Next.js compile, type validation, static page generation và export đều hoàn tất.

### `git diff --stat`

**KHÔNG CHẠY ĐƯỢC**

Thư mục project hiện tại không có metadata `.git`, nên Git trả về `Not a git repository`.

### `git diff -- src/app/components/layout/header src/app/globals.css`

**KHÔNG CHẠY ĐƯỢC**

Thư mục project hiện tại không có metadata `.git`.

### `pnpm lint`

**KHÔNG CHẠY**

Build đã compile và kiểm tra type thành công. Không cần chạy lint trong phạm vi Prompt 03.

### Kiểm tra runtime

- Build export được phục vụ qua server tĩnh có rewrite `basePath`.
- HTML trang chủ: tải thành công `HTTP 200`.
- CSS Header: tải thành công `HTTP 200`.
- Logo Header: tải thành công `HTTP 200`.
- Đã kiểm tra screenshot desktop và mobile.

Lưu ý: cổng `3000` đang bị một tiến trình dev cũ chiếm giữ và trả lỗi cache `.next`. Việc kiểm tra Prompt 03 được thực hiện độc lập bằng bản export production vừa build thành công, không can thiệp tiến trình cũ.

## 9. Kết luận

**PASS**

Header đã gọn, đúng tone xanh BBO TECH, đúng nav khảo sát tiếng Việt và không còn lỗi logo tràn. Các anchor đích cần được bổ sung khi được phép sửa section.

## 10. Bước tiếp theo & mục tiêu

**Bước tiếp theo:** Gửi screenshot Header desktop và mobile sau khi sửa; sau khi xác nhận, bổ sung anchor đích trong prompt chỉnh section tiếp theo.

**Mục tiêu:** Xác nhận Header đã gọn, đúng brand BBOTech, đúng nav khảo sát trước khi chuyển sang chỉnh Hero.
