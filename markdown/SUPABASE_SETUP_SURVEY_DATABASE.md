# HƯỚNG DẪN SETUP SUPABASE — DATABASE KHẢO SÁT

> Submit khảo sát chính (kể từ Prompt 18) ghi vào **Supabase** qua API route
> `/api/survey/submit` (server-side, dùng **service role key**). Google Sheets/Apps Script chỉ còn
> là kênh backup/deprecated, không phải submit chính.

---

## 1. Tạo project Supabase
1. Vào https://supabase.com → **Sign in** (hoặc Sign up).
2. **New project** → đặt tên (vd `bbotech-survey`), chọn region gần VN (Singapore), đặt Database
   Password (lưu lại).
3. Chờ project khởi tạo xong.

## 2. Lấy thông tin kết nối
Vào **Project Settings → API**:
- **Project URL** → dùng cho env `SUPABASE_URL` (vd `https://xxxxxxxx.supabase.co`).
- **service_role** secret (mục Project API keys) → dùng cho env `SUPABASE_SERVICE_ROLE_KEY`.

> ⚠️ **service_role key bỏ qua RLS, toàn quyền DB.** Chỉ đặt ở **server env** (local `.env` và
> **Vercel Environment Variables**). TUYỆT ĐỐI KHÔNG đưa vào `NEXT_PUBLIC_*` hay client component.
> KHÔNG commit vào git.

## 3. Tạo bảng `survey_responses`
Vào **SQL Editor → New query**, dán và **Run**:

```sql
create table if not exists public.survey_responses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  survey_id text,
  source text,
  segment text,
  audience text,
  role text,
  hotel_type text,
  rooms text,
  biggest_pain text,
  desired_solution text,
  tech_readiness int,
  willingness_to_pay text,
  budget_range text,
  contact_permission text,
  name text,
  phone text,
  hotel_company text,
  position text,
  lead_score int,
  priority text,
  follow_up_status text,
  notes text,
  answers jsonb,
  resources jsonb,
  contact jsonb,
  consent boolean,
  page_url text,
  user_agent text,
  completed_at timestamptz
);
```

## 4. Bật Row Level Security (RLS)
```sql
alter table public.survey_responses enable row level security;
```

- **KHÔNG tạo policy `insert` public.** API route insert bằng **service role key**, vốn **bỏ qua
  RLS**, nên không cần policy nào cho luồng ghi này.
- Việc bật RLS mà không có policy nghĩa là: client ẩn danh (anon key) **không** đọc/ghi được — chỉ
  server (service role) thao tác được. Đây là cấu hình an toàn mong muốn.
- Nếu sau này cần đọc dữ liệu từ dashboard, hãy tạo policy `select` có kiểm soát riêng (ngoài phạm
  vi prompt này).

## 5. Cấu hình Environment Variables

### 5.1. Local (`.env`, KHÔNG commit)
```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # service_role secret
```

### 5.2. Vercel (Project → Settings → Environment Variables)
Thêm cho cả **Production** và **Preview**:
| Name | Value | Lưu ý |
| --- | --- | --- |
| `SUPABASE_URL` | Project URL | server-side |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret | **server-side, KHÔNG NEXT_PUBLIC** |

> Không cần `NEXT_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL` nếu chỉ dùng Supabase.

Sau khi thêm env → **Redeploy** để biến môi trường có hiệu lực.

## 6. Kiểm tra sau deploy
1. Mở Production URL → hoàn thành 1 khảo sát Owner + 1 Guest.
2. Vào Supabase → **Table Editor → survey_responses** xem 2 dòng mới.
3. Kiểm tra mapping: Owner có `lead_score`/`priority` (Hot/Warm/Cold), `follow_up_status`; Guest
   `role = "Khách hàng"`, `priority = "Research"`, `lead_score` null.

## 7. Mapping cột (API route `/api/survey/submit`)
| Cột DB | Nguồn payload |
| --- | --- |
| `survey_id` | `responseId` |
| `source` | `source` |
| `segment` | `audienceLabel \|\| audience` |
| `audience` | `audience` (`owner`/`guest`) |
| `role` | Owner: `answers.Role` · Guest: `"Khách hàng"` |
| `hotel_type` / `rooms` | `answers.HotelType` / `answers.Rooms` |
| `biggest_pain` | Owner: `answers.Pain` · Guest: `answers.B2CPain` (join `; `) |
| `desired_solution` | Owner: `answers.Solution` · Guest: tổng hợp B2C |
| `tech_readiness` | `answers.Readiness` → int |
| `willingness_to_pay` / `budget_range` | `answers.WTP` / `answers.Budget` |
| `contact_permission` | `answers.LeadConsent \|\| (consent ? "Có" : "Không")` |
| `name`/`phone`/`hotel_company`/`position` | `contact.name/phone/hotel/role` |
| `lead_score` | Owner: tính điểm · Guest: `null` |
| `priority` | Owner: Hot/Warm/Cold · Guest: `Research` |
| `follow_up_status` | `contact_permission === "Có" ? "New" : "No follow-up"` |
| `notes` | tổng hợp PageUrl/UserAgent/CompletedAt/field phụ |
| `answers`/`resources`/`contact` | JSON gốc |
| `consent` | boolean |
| `page_url`/`user_agent`/`completed_at` | metadata |

**Lead Score (Owner):** +30 LeadConsent="Có"; +20 WTP="Có"/"Có, nếu thấy hiệu quả"; +20
Readiness 4/5; +15 Interest="Rất quan tâm"/"Có quan tâm"; +15 Budget≠"Dưới 500.000đ".
