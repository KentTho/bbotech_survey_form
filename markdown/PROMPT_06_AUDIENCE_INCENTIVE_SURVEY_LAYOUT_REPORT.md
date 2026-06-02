# PROMPT 06 - BÁO CÁO AUDIENCE + INCENTIVE + SURVEY LAYOUT

## 1. Tóm tắt nhiệm vụ

Đã bổ sung khối chọn nhóm người dùng, khối incentive và survey mockup cho landing page. Survey hoạt động hoàn toàn ở phía client, chưa kết nối API, Google Sheets hay lưu trữ dữ liệu.

## 2. File đã đọc

- `C:\Users\Tho\.codex\attachments\09c5643a-c72c-4d76-86f9-3ac33e663c48\pasted-text.txt`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/utils/extendedConfig.ts`
- `package.json`
- `tailwind.config.ts`
- Danh sách component trong `src/app/components/home` và `src/app/components/shared`
- Các report Prompt 01 đến Prompt 05 và architecture map trong `markdown`

## 3. File đã sửa

- Tạo mới `src/app/components/home/survey-flow/index.tsx`
- Sửa `src/app/page.tsx`
- Sửa `src/app/layout.tsx`
- Tạo các screenshot trong `markdown`

## 4. Component/section đã tạo

Tạo component `SurveyFlow` gồm ba khối:

- Audience Select
- Incentive
- Survey Layout

Component được render ngay sau `<Why />` trong `src/app/page.tsx`.

## 5. Font Montserrat

Đã thay `DM_Sans` bằng `Montserrat` từ `next/font/google` trong `src/app/layout.tsx`.

Font được gán trên `<body>`, vì vậy áp dụng cho toàn bộ landing page và các route dùng chung layout.

## 6. Audience Select

- Anchor: `id="aud-anchor"`
- Có hai lựa chọn: chủ nhà và khách thuê
- Mỗi card có icon SVG inline, mô tả ngắn và trạng thái selected rõ ràng
- Khi đổi audience, survey reset về câu hỏi đầu của nhóm mới

## 7. Incentive

- Bố cục hai cột trên desktop, xếp dọc trên mobile
- Có danh sách lợi ích và SVG inline
- Không thêm ảnh ngoài, icon library hay emoji

## 8. Survey Layout

- Anchor: `id="surveyAnchor"`
- Hiển thị từng câu hỏi một
- Có progress bar, lựa chọn câu trả lời, nút quay lại và tiếp tục
- Có sidebar hướng dẫn
- Bước cuối gồm lựa chọn tài liệu, thông tin liên hệ tùy chọn và checkbox đồng ý
- Submit mockup chỉ chuyển sang trạng thái cảm ơn
- Có CTA nhận checklist và đăng ký tư vấn trong trạng thái cảm ơn

## 9. Google Sheets / dữ liệu

Chưa có kết nối Google Sheets, API, storage hay request network.

Đã thêm TODO trong component:

```tsx
// TODO: Replace mock questions with final questionnaire from user.
// TODO: Connect submit handler to Google Sheets endpoint after receiving URL.
```

## 10. Icon

Tất cả icon mới đều là SVG inline. Không thêm package icon và không dùng emoji.

## 11. Những phần không đụng tới

- Không sửa Header, Hero và Why
- Không sửa public assets, context, data, route khác, `globals.css`, `tailwind.config.ts` hay package dependencies
- Các section cũ sau survey vẫn được giữ lại theo scope
- `<DiscoverProperties />` đã bị comment trước khi thực hiện Prompt 06; thay đổi đó được giữ nguyên

## 12. Kiểm tra giao diện

Đã kiểm tra screenshot desktop và mobile:

- Desktop: Audience, Incentive và Survey hiển thị đúng thứ tự, khoảng cách rõ ràng
- Mobile: các khối xếp dọc, không tràn ngang
- Owner, guest và thanks state hiển thị đúng nội dung
- Các section cũ vẫn tiếp tục hiển thị bên dưới survey

## 13. Kiểm tra interaction

Đã chạy luồng tương tác trên trình duyệt:

- Trạng thái ban đầu: `empty`
- Chọn chủ nhà: `owner-question-1`
- Chọn đáp án, next: `owner-question-2`
- Back: quay lại `owner-question-1`
- Đi đến bước cuối: `owner-final`
- Chọn tài liệu, đồng ý và submit mockup: `thanks`
- Chọn khách thuê: `guest-question-1`
- Chọn đáp án guest: selected state hoạt động
- Mobile overflow: `false`

## 14. Validation

- `npx tsc --noEmit`: PASS
- `pnpm build`: PASS
- Kiểm tra static output `/property-nextjs/`: PASS
- Kiểm tra anchor `aud-anchor`, `surveyAnchor` và font Montserrat trong output: PASS
- Tìm `fetch`, `axios`, `localStorage`, `sessionStorage`, `XMLHttpRequest` trong SurveyFlow: không có kết quả

Trong quá trình test có một lần build bị `EBUSY` vì static test server đang giữ thư mục `out`. Sau khi dừng test server và build lại sạch, lệnh `pnpm build` đã PASS đầy đủ.

Workspace không có `.git`, vì vậy không thể dùng `git diff` để đối chiếu.

## 15. Screenshot

- `markdown/PROMPT_06_AUDIENCE_SURVEY_DESKTOP.png`
- `markdown/PROMPT_06_AUDIENCE_SURVEY_MOBILE.png`
- `markdown/PROMPT_06_SURVEY_OWNER_STATE.png`
- `markdown/PROMPT_06_SURVEY_GUEST_STATE.png`
- `markdown/PROMPT_06_SURVEY_THANKS_STATE.png`

## 16. Lưu ý còn lại

- Bộ câu hỏi hiện tại là mockup và cần thay bằng questionnaire chính thức
- Cần URL endpoint Google Sheets trước khi kết nối submit thật
- Các section real-estate cũ bên dưới survey nằm ngoài scope Prompt 06 nên được giữ nguyên

## 17. Kết luận

PASS

## 18. Bước tiếp theo & mục tiêu

Nhận bộ câu hỏi chính thức và endpoint Google Sheets, sau đó kết nối submit thật mà không thay đổi bố cục đã duyệt.
