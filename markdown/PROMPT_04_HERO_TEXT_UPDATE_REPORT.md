# PROMPT 04 — BÁO CÁO SỬA TEXT HERO

## 1. Tóm tắt nhiệm vụ

Chỉ cập nhật nội dung text trong Hero hiện tại để chuyển từ nội dung bất động sản sang khảo sát nhu cầu chuyển đổi số cho khách sạn 2–3 sao tại Vũng Tàu.

Ảnh tòa nhà, layout Hero, grid, spacing chính, palette xanh BBO TECH và Header được giữ nguyên.

## 2. File đã đọc

- `markdown/PROMPT_01_SRC_SCAN_REPORT.md`
- `markdown/PROJECT_SRC_ARCHITECTURE_MAP.md`
- `markdown/PROMPT_02_BRAND_COLOR_SWAP_REPORT.md`
- `markdown/PROMPT_03_HEADER_NAV_LOGO_FIX_REPORT.md`
- `src/app/page.tsx`
- `src/app/components/home/hero/index.tsx`
- `src/app/globals.css`
- `src/utils/extendedConfig.ts`
- `src/utils/pathUtils.ts`

Không cần sửa hoặc đọc sâu `src/app/components/home/calculator/index.tsx` vì toàn bộ text đang hiển thị trong Hero nằm ngay trong `src/app/components/home/hero/index.tsx`.

## 3. File đã sửa

- `src/app/components/home/hero/index.tsx`

File screenshot đã tạo:

- `markdown/PROMPT_04_HERO_DESKTOP.png`
- `markdown/PROMPT_04_HERO_MOBILE.png`

## 4. Text cũ đã thay

| Text cũ | Text mới | File | Ghi chú |
|---|---|---|---|
| Không có eyebrow | `BBOTech · Nghiên cứu thị trường khách sạn Vũng Tàu` | `src/app/components/home/hero/index.tsx` | Thêm text nhỏ trong khối title hiện có |
| `Find Your Best Real Estate` | `Khảo sát nhu cầu chuyển đổi số cho khách sạn 2–3 sao tại Vũng Tàu` | `src/app/components/home/hero/index.tsx` | Highlight cụm `chuyển đổi số` bằng palette hiện có |
| Không có sub text | `BBOTech đang thực hiện khảo sát ngắn để tìm hiểu khó khăn thực tế trong vận hành, đặt phòng, chăm sóc khách hàng và marketing của khách sạn vừa và nhỏ.` | `src/app/components/home/hero/index.tsx` | Thêm trong khối title hiện có |
| `Sell` | `Vận hành` | `src/app/components/home/hero/index.tsx` | Chỉ đổi label tab |
| `Buy` | `Marketing` | `src/app/components/home/hero/index.tsx` | Chỉ đổi label tab |
| `Search Location` | `Khách sạn của bạn đang gặp khó khăn gì?` | `src/app/components/home/hero/index.tsx` | Đổi placeholder ở cả hai tab |
| `Search` | `Bắt đầu khảo sát` | `src/app/components/home/hero/index.tsx` | CTA dùng `href="#surveyAnchor"` |
| `Advance Search` | `5–6 câu hỏi` | `src/app/components/home/hero/index.tsx` | Dùng vị trí nút phụ hiện có để hiển thị meta text |
| `4.9/5 - from 658 reviews` | `Chỉ 3–5 phút · Dữ liệu chỉ dùng để tổng hợp nghiên cứu` | `src/app/components/home/hero/index.tsx` | Thay review text bằng meta và trust text |

## 5. Cách xử lý

### Title

Đã đổi thành:

`Khảo sát nhu cầu chuyển đổi số cho khách sạn 2–3 sao tại Vũng Tàu`

Cụm `chuyển đổi số` được highlight bằng class `text-primary` thuộc palette xanh hiện tại.

### Sub text

Đã thêm sub text khảo sát trong khối title hiện có:

`BBOTech đang thực hiện khảo sát ngắn để tìm hiểu khó khăn thực tế trong vận hành, đặt phòng, chăm sóc khách hàng và marketing của khách sạn vừa và nhỏ.`

### CTA

- CTA chính: `Bắt đầu khảo sát`
- Href: `#surveyAnchor`
- CTA phụ: `5–6 câu hỏi`
- Href CTA phụ: `#surveyAnchor`

Hai phần tử hành động được đổi từ `button` sang anchor để có đúng `href` theo yêu cầu nhưng giữ nguyên class hiển thị và vị trí layout.

### Search / Form / Tab

- Tab `Sell` → `Vận hành`
- Tab `Buy` → `Marketing`
- Placeholder → `Khách sạn của bạn đang gặp khó khăn gì?`

State tab và input suggestions được giữ nguyên. Không refactor business logic cũ vì ngoài phạm vi Prompt 04.

### Trust / Review

Icon star có sẵn được giữ nguyên để không phá layout.

Dòng review cũ đổi thành:

`Chỉ 3–5 phút · Dữ liệu chỉ dùng để tổng hợp nghiên cứu`

### Ảnh Hero

Giữ nguyên:

```tsx
src={getImgPath("/images/hero/hero-image.png")}
```

Không đổi wrapper, width, height hoặc object-fit.

## 6. Những phần không đụng tới

- [x] Không sửa Header.
- [x] Không sửa ảnh Hero.
- [x] Không sửa layout Hero lớn.
- [x] Không sửa section bên dưới.
- [x] Không sửa route.
- [x] Không sửa data.
- [x] Không sửa public assets.
- [x] Không cài package.
- [x] Không git commit.
- [x] Không git push.

## 7. Kiểm tra giao diện

- [x] Desktop Hero hiển thị đúng text mới.
- [x] Mobile Hero hiển thị đúng text mới.
- [x] Không tràn ngang.
- [x] Header không che Hero.
- [x] Ảnh Hero vẫn còn trên desktop.
- [x] Tone màu xanh lá vẫn giữ nguyên.
- [x] Không còn text bất động sản chính trong Hero.

## 8. Validation

### `npx tsc --noEmit`

**PASS**

Không có TypeScript error.

### `pnpm build`

**PASS**

Next.js compile, type validation, static page generation và export đều hoàn tất.

### `git diff --stat`

**KHÔNG CHẠY ĐƯỢC**

Không chạy được git diff vì project không có metadata `.git`.

### `git diff -- src/app/components/home/hero src/app/components/home/calculator src/app/page.tsx`

**KHÔNG CHẠY ĐƯỢC**

Không chạy được git diff vì project không có metadata `.git`.

### `pnpm lint`

**KHÔNG CHẠY**

Build đã compile và kiểm tra type thành công. Không ép chạy lint trong phạm vi Prompt 04.

### Kiểm tra runtime

- Build export được phục vụ qua server tĩnh tạm có rewrite `basePath`.
- Trang chủ tải thành công với `HTTP 200`.
- HTML export có title, eyebrow, sub text, CTA, meta, trust text và ảnh Hero hiện tại.
- HTML export không còn title `Find Your Best Real Estate`.
- Đã kiểm tra screenshot desktop và mobile sau khi chờ AOS animation hoàn tất.

## 9. Screenshot

- `markdown/PROMPT_04_HERO_DESKTOP.png`
- `markdown/PROMPT_04_HERO_MOBILE.png`

## 10. Lưu ý còn lại

- `#surveyAnchor` chưa có section đích vì Prompt 04 không cho phép tạo survey section mới. Anchor cần được bổ sung ở prompt section tiếp theo.
- Một số text bất động sản vẫn còn trong các section bên dưới Hero. Không sửa vì ngoài phạm vi Prompt 04.
- Logic hỗ trợ tìm kiếm bất động sản cũ vẫn còn trong Hero nhưng CTA hiển thị đã chuyển sang anchor khảo sát. Không refactor sâu vì Prompt 04 chỉ yêu cầu cập nhật Hero text và CTA.

## 11. Kết luận

**PASS**

Hero đã chuyển sang nội dung khảo sát BBOTech, ảnh và layout hiện tại được giữ nguyên, Header không bị sửa, build và type-check đều PASS.

## 12. Bước tiếp theo & mục tiêu

**Bước tiếp theo:** Gửi screenshot Hero desktop/mobile và report Prompt 04 để kiểm tra.

**Mục tiêu:** Xác nhận Hero đã đúng nội dung khảo sát BBOTech trước khi chuyển sang section `Lý do tham gia` hoặc bổ sung các anchor section.
