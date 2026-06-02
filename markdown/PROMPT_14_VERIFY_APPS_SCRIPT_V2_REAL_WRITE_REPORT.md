# PROMPT 14 — BÁO CÁO VERIFY APPS SCRIPT V2 + REAL WRITE

## 1. Tóm tắt nhiệm vụ
Kiểm chứng deployment Apps Script V2 và việc ghi thật vào tab `09_Response_Tracker` của Google
Sheet gốc mới. Kết quả: **env đúng**, **GET endpoint xác nhận V2 đang chạy** (`expectedColumns:21`),
nhưng **POST Owner/Guest đều trả `ok:false` với lỗi `Header mismatch tại cột 1`**. Nguyên nhân:
**dòng 1 của sheet là dòng TIÊU ĐỀ** (`"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật"`),
nên 21 header thật không nằm ở dòng 1. Strict validation của V2 đã hoạt động đúng và **chặn ghi
lệch cột**. Không phải bug frontend, không phải lỗi mapping. Type-check + build PASS.

Kết luận: **BLOCKED** — cần sửa layout header phía Google Sheet (hoặc trỏ Apps Script đọc header
ở đúng dòng) rồi test lại.

## 2. Env endpoint
- **Có:** ✔ `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` tồn tại trong cả `.env.local` và `.env`.
- **URL (mask):** `https://script.google.com/macros/s/AKfycbwgQp…mj9ZM/exec`
  (URL này **mới** so với Prompt 12 → user đã deploy deployment mới.)
- **Kết thúc `/exec`:** ✔ Có.

## 3. GET endpoint result
- **HTTP 200**, response:
  ```json
  {"ok":true,"message":"BBOTech survey endpoint V2 is alive","sheetName":"09_Response_Tracker","spreadsheetId":"1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI","expectedColumns":21}
  ```
- `ok:true`: ✔
- `expectedColumns:21`: ✔ → **đang chạy đúng code V2**.
- `spreadsheetId` mới: ✔ `1Nd8-1RzPs6bB8s9CGU0TlQD2qmRPA4d3_xq8VgJWvfI`.
- `sheetName`: ✔ `09_Response_Tracker`.

## 4. POST Owner result
- **HTTP 200**, response:
  ```json
  {"ok":false,"error":"Header mismatch tai cot 1: nhan \"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật\", can \"Survey ID\""}
  ```
- `ok:false` — **KHÔNG ghi dòng** (strict validation chặn lại).

## 5. POST Guest result
- **HTTP 200**, response: **cùng lỗi** Header mismatch tại cột 1.
- `ok:false` — **KHÔNG ghi dòng**.

## 6. Sheet check user cần xác nhận
Hiện tại **chưa có dòng mới nào** được ghi (cả 2 POST đều `ok:false`). Vì vậy chưa thể kiểm tra
mapping cột. **Sau khi khắc phục header** (mục 8) và test lại thành công, user mở tab
`09_Response_Tracker` kiểm tra:
- **Dòng Owner:** Segment = "Chủ / Quản lý / Nhân sự khách sạn"; Role = vai trò owner (vd "Quản lý");
  Hotel Type, Rooms, Biggest Pain, Desired Solution có dữ liệu; Lead Score có số (payload mẫu
  P14 owner = 30+20+20+15+15 = **100**); Priority = **Hot**; Follow-up Status = **New**.
- **Dòng Guest:** Segment = "Khách từng đặt / lưu trú khách sạn"; Role = **Khách hàng**;
  Priority = **Research**; Lead Score trống; Notes chứa dữ liệu B2C phụ (TravelHistory,
  BookingChannel, ResponseTime...).

## 7. Validation
- `npx tsc --noEmit`: **PASS** (exit 0).
- `pnpm build`: **PASS** (`✓ Compiled`, `✓ Generating static pages (37/37)`, `✓ Exporting (2/2)`).

## 8. Root cause nếu fail
**Phân loại lỗi:** ❌ **Header mismatch** (layout sheet) — KHÔNG phải các nhóm còn lại.

| Khả năng              | Kết luận |
| --------------------- | -------- |
| Env URL sai           | ❌ Không — env đúng, `/exec`, GET trả V2. |
| Chưa deploy V2        | ❌ Không — GET trả `expectedColumns:21`, đúng spreadsheetId mới. |
| **Header mismatch**   | ✅ **ĐÚNG** — dòng 1 là tiêu đề, không phải 21 header. |
| Sai sheet name        | ❌ Không — `getSheetByName('09_Response_Tracker')` thành công (qua được bước này mới tới validate header). |
| Permission issue      | ❌ Không — script đọc được sheet và dòng 1. |
| Frontend bug          | ❌ Không — chưa chạm tới frontend; payload đúng cấu trúc. |

**Chi tiết root cause:**
- Dòng 1 của tab `09_Response_Tracker` đang chứa **tiêu đề gộp**:
  `"09. Response Tracker - Nhập Dữ Liệu Khảo Sát Thật"`.
- 21 header thật (Survey ID, Submit Date, ...) **không nằm ở dòng 1** — nhiều khả năng ở **dòng 2**.
- `validateHeaders()` của V2 đọc **dòng 1** và so khớp với `EXPECTED_HEADERS[0] = "Survey ID"` →
  lệch → trả lỗi và **không ghi** (đúng thiết kế strict, tránh ghi sai cột).

**Cách khắc phục (chọn 1):**

**Cách A — Đưa 21 header lên dòng 1 (đơn giản nhất):**
- Trong tab `09_Response_Tracker`, **xóa dòng tiêu đề** ở trên cùng (hoặc chuyển tiêu đề sang
  chỗ khác) sao cho **dòng 1 đúng 21 header** (`Survey ID` ... `Notes`).
- Không cần sửa code. Test lại POST → kỳ vọng `ok:true`.

**Cách B — Cho Apps Script đọc header ở dòng khác (giữ nguyên dòng tiêu đề):**
- Thêm hằng `HEADER_ROW` và sửa `validateHeaders()` đọc đúng dòng đó (vd dòng 2). `appendRow`
  vẫn tự thêm dữ liệu xuống dưới cùng nên không ảnh hưởng. Patch tối thiểu:
  ```javascript
  var HEADER_ROW = 2; // dòng chứa 21 header thật (dòng 1 là tiêu đề)

  function validateHeaders(sheet) {
    var lastCol = sheet.getLastColumn();
    if (lastCol < EXPECTED_HEADERS.length) {
      return { ok: false, error: 'Header mismatch: sheet co ' + lastCol + ' cot, can ' + EXPECTED_HEADERS.length };
    }
    var headerRow = sheet.getRange(HEADER_ROW, 1, 1, EXPECTED_HEADERS.length).getValues()[0];
    for (var i = 0; i < EXPECTED_HEADERS.length; i++) {
      var actual = String(headerRow[i]).trim();
      if (actual !== EXPECTED_HEADERS[i]) {
        return { ok: false, error: 'Header mismatch tai cot ' + (i + 1) + ': nhan "' + actual + '", can "' + EXPECTED_HEADERS[i] + '"' };
      }
    }
    return { ok: true };
  }
  ```
- Sau khi sửa code → **Deploy New version** → test lại.

> Khuyến nghị **Cách A** nếu không bắt buộc giữ dòng tiêu đề (đơn giản, không phải đụng code).
> Trước khi áp dụng Cách B cần **xác nhận chính xác header nằm ở dòng nào** (mở sheet xem).

## 9. File đã sửa
- **Tạo mới:** `markdown/PROMPT_14_VERIFY_APPS_SCRIPT_V2_REAL_WRITE_REPORT.md` (báo cáo này).
- **KHÔNG sửa** frontend, mapping 21 cột, code V2 (`GOOGLE_SHEETS_APPS_SCRIPT_SETUP_V2_21_COLUMNS.md`),
  hay bất kỳ file nào khác — vì lỗi nằm ở **layout dữ liệu sheet phía Google**, không phải code
  dự án. (Patch Cách B ở mục 8 chỉ là gợi ý cho user áp dụng nếu chọn giữ dòng tiêu đề.)

## 10. Những phần không đụng tới
- [x] Không sửa frontend (`survey-flow/index.tsx` giữ nguyên — không có bug frontend).
- [x] Không đổi mapping 21 cột.
- [x] Không thêm/xóa cột trong Sheet.
- [x] Không hardcode URL vào code.
- [x] Không sửa Header / Hero / Why / Survey / About / Footer.
- [x] Không đổi font / màu / layout.
- [x] Không git commit / push.

## 11. Kết luận
**BLOCKED**

- Env + deployment V2 + endpoint: **OK** (GET `expectedColumns:21`, spreadsheetId mới đúng).
- Type-check + build: **PASS**.
- **Chặn:** dòng 1 của sheet là tiêu đề, không phải 21 header → `validateHeaders` chặn ghi.
  Cần user đưa header về dòng 1 (Cách A) hoặc trỏ `HEADER_ROW` đúng dòng (Cách B), rồi test lại.
- POST Owner/Guest **chưa** đạt `ok:true` → chưa đủ điều kiện PASS (điều kiện 2, 3, 4).

## 12. Bước tiếp theo & mục tiêu
**Bước tiếp theo:**
1. User mở tab `09_Response_Tracker`, xác nhận 21 header thật đang ở dòng mấy.
2. Áp dụng **Cách A** (đưa header lên dòng 1) — hoặc **Cách B** (sửa `HEADER_ROW` + Deploy New
   version) nếu muốn giữ dòng tiêu đề.
3. Test lại POST Owner + Guest (hoặc submit qua web), kỳ vọng `ok:true`.
4. Kiểm tra tab có 2 dòng mới đúng 21 cột như mục 6.

**Mục tiêu:**
Xác nhận Apps Script V2 ghi thật được 2 dòng (Owner + Guest) vào đúng 21 cột của tab
`09_Response_Tracker`, với Lead Score/Priority/Follow-up đúng cho Owner và Role=Khách hàng /
Priority=Research cho Guest.
