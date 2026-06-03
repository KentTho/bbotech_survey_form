-- ============================================================================
-- BBOTech Survey — Neon PostgreSQL schema: survey_responses (ĐÚNG 21 CỘT)
-- ============================================================================
-- Mục tiêu: bảng survey_responses có ĐÚNG 21 cột theo yêu cầu, dùng quoted
-- identifiers vì tên cột có dấu cách và ký tự đặc biệt.
--
-- Cách chạy: mở Neon Dashboard -> SQL Editor (hoặc psql) -> dán nội dung 1
-- trong 2 OPTION bên dưới -> Run.
--
-- LƯU Ý AN TOÀN:
--   - File này KHÔNG tự chạy. User chủ động chạy trong Neon.
--   - OPTION A xoá bảng cũ (mất dữ liệu) — chỉ dùng khi bảng cũ chưa có data quan trọng.
--   - OPTION B đổi tên bảng cũ thành backup rồi tạo bảng mới — AN TOÀN, giữ lại dữ liệu cũ.
--   - Mặc định bên dưới đang bật OPTION B (an toàn). OPTION A để trong comment.
-- ============================================================================


-- ============================================================================
-- OPTION B — SAFE BACKUP MIGRATION (KHUYẾN NGHỊ, đang được bật)
-- Đổi tên bảng cũ -> backup, sau đó tạo bảng mới 21 cột.
-- ============================================================================
begin;

-- Nếu đã tồn tại bảng survey_responses (schema cũ), đổi tên để giữ lại dữ liệu.
alter table if exists survey_responses
  rename to survey_responses_backup_before_21_columns;

create table survey_responses (
  "Survey ID"          text primary key,
  "Submit Date"        timestamptz not null default now(),
  "Source"             text,
  "Segment"            text,
  "Role"               text,
  "Hotel Type"         text,
  "Rooms"              text,
  "Biggest Pain"       text,
  "Desired Solution"   text,
  "Tech Readiness 1-5" int,
  "Willingness To Pay" text,
  "Budget Range"       text,
  "Contact Permission" text,
  "Name"               text,
  "Phone"              text,
  "Hotel/Company"      text,
  "Position"           text,
  "Lead Score"         int,
  "Priority"           text,
  "Follow-up Status"   text,
  "Notes"              text
);

create index if not exists idx_survey_responses_submit_date
  on survey_responses ("Submit Date" desc);

create index if not exists idx_survey_responses_segment
  on survey_responses ("Segment");

create index if not exists idx_survey_responses_priority
  on survey_responses ("Priority");

commit;


-- ============================================================================
-- OPTION A — FRESH SETUP (DESTRUCTIVE — chỉ chạy khi chấp nhận mất dữ liệu cũ)
-- Bỏ comment toàn bộ block dưới nếu muốn xoá hẳn bảng cũ rồi tạo mới.
-- LƯU Ý: KHÔNG chạy đồng thời với OPTION B ở trên.
-- ============================================================================
-- begin;
--
-- drop table if exists survey_responses;
--
-- create table survey_responses (
--   "Survey ID"          text primary key,
--   "Submit Date"        timestamptz not null default now(),
--   "Source"             text,
--   "Segment"            text,
--   "Role"               text,
--   "Hotel Type"         text,
--   "Rooms"              text,
--   "Biggest Pain"       text,
--   "Desired Solution"   text,
--   "Tech Readiness 1-5" int,
--   "Willingness To Pay" text,
--   "Budget Range"       text,
--   "Contact Permission" text,
--   "Name"               text,
--   "Phone"              text,
--   "Hotel/Company"      text,
--   "Position"           text,
--   "Lead Score"         int,
--   "Priority"           text,
--   "Follow-up Status"   text,
--   "Notes"              text
-- );
--
-- create index if not exists idx_survey_responses_submit_date
--   on survey_responses ("Submit Date" desc);
-- create index if not exists idx_survey_responses_segment
--   on survey_responses ("Segment");
-- create index if not exists idx_survey_responses_priority
--   on survey_responses ("Priority");
--
-- commit;


-- ============================================================================
-- QUERY KIỂM TRA (chạy sau khi đã tạo bảng + có dữ liệu submit)
-- ============================================================================
-- select * from survey_responses order by "Submit Date" desc limit 20;
