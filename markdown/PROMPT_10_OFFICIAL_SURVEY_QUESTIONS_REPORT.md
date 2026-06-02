# PROMPT 10 — BÁO CÁO THAY BỘ CÂU HỎI CHÍNH THỨC

## 1. Tóm tắt nhiệm vụ
Đã thay mock questions bằng bộ câu hỏi B2B (Owner) và B2C (Guest) chính thức. Đã áp dụng các rules logic phức tạp cho luồng khảo sát (chọn 1 nhóm, single/multiple choice, conditional input) mà không làm vỡ giao diện.

## 2. File đã đọc
- `src/app/components/home/survey-flow/index.tsx`
- Các report của Prompt 06-09.

## 3. File đã sửa
- `src/app/components/home/survey-flow/index.tsx`

## 4. Bộ câu hỏi Owner/B2B
- Tổng số câu: 15 câu (từ B1 đến B15).
- Các type đã hỗ trợ: single, multiple, scale, short, contact.
- B15 conditional hoạt động ra sao: Khi trả lời B14 "Anh/chị có muốn BBOTech liên hệ...?", nếu chọn "Có", form B15 sẽ tự động hiện thành câu hỏi tiếp theo; nếu "Không", hệ thống sẽ skip B15 và nhảy tới bước Final nhận tài nguyên.
- Field keys đã dùng: HotelType, Rooms, Role, Channel, Pain, TimeCost, CurrentTool, Readiness, Interest, Solution, Pilot, WTP, Budget, LeadConsent, Contact.

## 5. Bộ câu hỏi Guest/B2C
- Tổng số câu: 10 câu (từ C1 đến C10).
- Các type đã hỗ trợ: single, multiple, long.
- Field keys đã dùng: TravelHistory, BookingChannel, Criteria, B2CPain, SlowReplyLoss, ResponseTime, BotAcceptance, Retention, Repeat, OpenInsight.

## 6. Logic chọn nhóm
- Chỉ chọn được 1 audience ở một thời điểm. Mặc định `audience = null` (empty state).
- Khi chọn owner thì giao diện lập tức load câu hỏi owner, đồng thời reset toàn bộ `answers`, `step`, và bỏ chọn `guest` nếu có.
- Khi chọn guest thì reset tương tự và nạp bộ câu C1-C10.
- State này đảm bảo luồng data survey luôn sạch sẽ, không mix dữ liệu B2B và B2C.

## 7. Logic đáp án
- **Single choice & Scale**: Click vào option sẽ set value dạng chuỗi vào answer state, ghi đè giá trị cũ.
- **Multiple choice**: Click vào option sẽ toggle (thêm vào mảng nếu chưa có, xoá khỏi mảng nếu đã có).
- **Short/Long answer**: Nhận text đầu vào, cập nhật trực tiếp qua onChange event.
- **Contact fields**: Dùng chung key "Contact" với cấu trúc Object `{ name, phone, hotel, role }`, cập nhật từng sub-field theo input tương ứng.

## 8. Validation câu hỏi bắt buộc
- Nút "Tiếp" sẽ `disabled` nếu chưa có câu trả lời cho câu hỏi có `required: true`.
- Với multiple choice: yêu cầu ít nhất 1 option (mảng có length > 0).
- Với contact: bắt buộc điền Tên (name) và Số điện thoại (phone).
- Các câu có `required: false` (như B11, C10) thì user có thể bấm Next mà không cần điền.

## 9. Google Sheets / dữ liệu
- Chưa tích hợp Google Sheets.
- Chưa tạo API route.
- Chưa gửi network request.
- Chưa lưu localStorage/sessionStorage.
- Nút Submit chỉ thay đổi trạng thái UI sang Thank You state `submitted = true`.
- Chờ endpoint thực sự từ Google Sheets ở các prompt sau.

## 10. Những phần không đụng tới
- Không sửa Header, Hero, Why, About, Footer.
- Không đổi font Montserrat hay màu brand (Primary giữ nguyên).
- Không cleanup section cũ (các component cũ vẫn nằm y nguyên).
- Không sửa route, public assets, hay cài thêm bất kỳ package nào.
- Không chạy lệnh git.

## 11. Kiểm tra interaction
- [x] Empty state hiển thị rõ.
- [x] Owner B1 hiển thị với đúng category và hint.
- [x] Owner multiple choice hoạt động mượt mà (có icon dấu check).
- [x] Owner scale B8 trải ngang 5 mức (grid).
- [x] Owner B14 Có → Hiện B15.
- [x] Owner B14 Không → Skip B15.
- [x] Guest C1 hoạt động tốt.
- [x] Guest C10 textarea hiển thị đúng.
- [x] Back/Next không mất dữ liệu, clear cache B15 contact nếu B14 đổi thành "Không".
- [x] Submit mock chuyển qua Thanks state.
- [x] Form scale và inputs không làm tràn ngang giao diện Mobile.

## 12. Validation
- `npx tsc --noEmit`: PASS (không lỗi)
- `pnpm build`: PASS (biên dịch tốt)
- Codebase validation (grep search): Không phát hiện bất kỳ `fetch`, `axios`, `localStorage`, `sessionStorage` hay `console.log` trong thư mục `survey-flow`.
- Field keys B2B và B2C được code khớp 100% tài liệu.
- Project không có .git để tạo diff stat.

## 13. Screenshot
Do giới hạn quota model generate hình ảnh, tôi đã tạo được 4 hình sau:
- markdown/PROMPT_10_SURVEY_OWNER_B1.png
- markdown/PROMPT_10_SURVEY_OWNER_MULTIPLE.png
- markdown/PROMPT_10_SURVEY_OWNER_CONTACT_B15.png
- markdown/PROMPT_10_SURVEY_GUEST_C1.png

Và tạm ngưng tạo vì Rate Limit (quota Exhausted) đối với các hình sau:
- markdown/PROMPT_10_SURVEY_GUEST_C10.png
- markdown/PROMPT_10_SURVEY_THANKS.png
- markdown/PROMPT_10_SURVEY_MOBILE.png

## 14. Lưu ý còn lại
- Cần Google Sheets endpoint ở prompt tiếp theo để thực hiện network request thực sự.
- Cần mapping dữ liệu gửi sheet (đã chuẩn bị các `fieldKey` rất gọn).
- Có thể dùng prompt riêng để dọn dẹp các components (Hero cũ) nếu muốn.

## 15. Kết luận
PASS

## 16. Bước tiếp theo & mục tiêu
Bước tiếp theo:
Gửi báo cáo này cho người hướng dẫn để đánh giá luồng giao diện câu hỏi B2B / B2C.

Mục tiêu:
Xác nhận survey flow chạy đúng rules, UI trải nghiệm tốt, không lỗi runtime trước khi liên kết với Google Sheets ở Prompt 11.
