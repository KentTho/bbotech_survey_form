# HƯỚNG DẪN SETUP NEON POSTGRESQL — DATABASE KHẢO SÁT

> Submit khảo sát chính (kể từ Prompt 19) ghi vào **Neon PostgreSQL** qua API route
> `/api/survey/submit` (server-side, dùng `DATABASE_URL`). Supabase và Google Sheets đã **deprecated**,
> không còn là submit chính.

---

## 1. Tạo / mở Neon project
1. Vào https://neon.tech → đăng nhập.
2. Đã có project (theo bối cảnh). Nếu chưa: **New Project**, chọn region gần VN (Singapore).

## 2. Lấy connection string
Vào **Dashboard → project → Connection Details**:
- Chọn **Pooled connection** (khuyến nghị cho serverless/Vercel).
- Copy chuỗi dạng:
  ```
  postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/<db>?sslmode=require
  ```
- Dùng làm env **`DATABASE_URL`**.

> ⚠️ Connection string chứa mật khẩu DB. Chỉ đặt ở **server env** (local `.env` / Vercel Environment
> Variables). KHÔNG đưa vào `NEXT_PUBLIC_*`, KHÔNG hardcode, KHÔNG commit.

## 3. Tạo bảng `survey_responses`
Vào **Neon → SQL Editor**, dán và **Run**:

```sql
create table if not exists survey_responses (
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

> `gen_random_uuid()` có sẵn trên Neon (extension `pgcrypto` được bật mặc định). Nếu báo lỗi hàm,
> chạy trước: `create extension if not exists pgcrypto;`

## 4. Cấu hình Environment Variables

### 4.1. Local (`.env` hoặc `.env.local`, KHÔNG commit)
```
DATABASE_URL=postgresql://<user>:<password>@<endpoint>-pooler.<region>.aws.neon.tech/<db>?sslmode=require
```

### 4.2. Vercel (Project → Settings → Environment Variables)
| Name | Value | Lưu ý |
| --- | --- | --- |
| `DATABASE_URL` | Neon pooled connection string | server-side, **KHÔNG NEXT_PUBLIC** |

Thêm cho cả **Production** và **Preview**, sau đó **Redeploy**.

## 5. Kiểm tra sau deploy
1. Mở Production URL → hoàn thành 1 khảo sát Owner + 1 Guest.
2. Vào Neon → **SQL Editor** chạy:
   ```sql
   select survey_id, audience, role, lead_score, priority, follow_up_status, created_at
   from survey_responses
   order by created_at desc
   limit 5;
   ```
3. Mapping: Owner có `lead_score`/`priority` (Hot/Warm/Cold) + `follow_up_status`; Guest
   `role = "Khách hàng"`, `priority = "Research"`, `lead_score` null.

## 6. Mapping cột (API route `/api/survey/submit`)
Giữ nguyên mapping như khi dùng Supabase (chỉ đổi lớp lưu trữ sang Neon). Lead Score (Owner): +30
LeadConsent="Có"; +20 WTP="Có"/"Có, nếu thấy hiệu quả"; +20 Readiness 4/5; +15 Interest="Rất quan
tâm"/"Có quan tâm"; +15 Budget≠"Dưới 500.000đ". Guest: `lead_score = null`, `priority = "Research"`.
Cột `answers`/`resources`/`contact` lưu jsonb; còn lại text/int/bool/timestamptz.
