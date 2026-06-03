-- ============================================================================
-- BBOTech Survey - Neon PostgreSQL schema: full question columns
-- ============================================================================
-- Muc tieu:
--   - Backup bang survey_responses hien tai bang cach rename.
--   - Tao lai survey_responses voi moi cau hoi la mot cot snake_case rieng.
--   - Tao 3 view doc de hieu cho Owner, Guest va Tracker 21 cot cu.
--
-- LUU Y AN TOAN:
--   - File nay KHONG tu chay. Chi chay thu cong trong Neon khi da xac nhan
--     DATABASE_URL dung production/project mong muon.
--   - Neu backup survey_responses_backup_before_full_question_columns da ton
--     tai, migration se dung ngay va KHONG ghi de backup.
--   - Khong drop backup va khong xoa du lieu cu.
--   - Sau khi chay schema nay, API insert 21 cot cu can duoc cap nhat mapping
--     sang cac cot snake_case moi truoc khi tiep tuc nhan submit production.
-- ============================================================================

begin;

create extension if not exists pgcrypto;

do $$
begin
  if to_regclass('public.survey_responses_backup_before_full_question_columns') is not null then
    raise exception
      'Backup table public.survey_responses_backup_before_full_question_columns already exists. Stop migration to avoid overwrite.';
  end if;

  if to_regclass('public.survey_responses') is null then
    raise exception
      'Source table public.survey_responses does not exist. Stop migration because there is no table to backup.';
  end if;
end
$$;

drop view if exists public.survey_owner_responses;
drop view if exists public.survey_guest_responses;
drop view if exists public.survey_response_tracker;

alter table public.survey_responses
  rename to survey_responses_backup_before_full_question_columns;

create table public.survey_responses (
  -- Metadata
  id uuid primary key default gen_random_uuid(),
  survey_id text unique not null,
  submit_date timestamptz not null default now(),
  source text,
  segment text,
  audience text not null check (audience in ('owner', 'guest')),
  page_url text,
  user_agent text,
  completed_at timestamptz,

  -- Owner answers
  hotel_type text,
  rooms text,
  owner_role text,
  channel text,
  pain text,
  time_cost text,
  current_tool text,
  readiness int,
  interest text,
  solution text,
  pilot text,
  wtp text,
  budget text,
  lead_consent text,

  -- Guest answers
  travel_history text,
  booking_channel text,
  criteria text,
  fanpage_zalo text,
  b2c_pain text,
  slow_reply_loss text,
  price_mismatch text,
  response_time text,
  reply_info text,
  bot_acceptance text,
  retention text,
  repeat_driver text,
  trust_factor text,
  open_insight text,

  -- Contact / lead
  name text,
  phone text,
  hotel_company text,
  position text,
  lead_score int,
  priority text,
  follow_up_status text,
  resources text,
  consent boolean,
  contact_info text,
  notes text,
  raw_answers jsonb not null default '{}'::jsonb,
  raw_payload jsonb not null default '{}'::jsonb
);

create index idx_survey_responses_full_submit_date_desc
  on public.survey_responses (submit_date desc);

create index idx_survey_responses_full_audience
  on public.survey_responses (audience);

create index idx_survey_responses_full_priority
  on public.survey_responses (priority);

create index idx_survey_responses_full_phone
  on public.survey_responses (phone);

create index idx_survey_responses_full_lead_score_desc
  on public.survey_responses (lead_score desc);

create view public.survey_owner_responses as
select
  survey_id as "Survey ID",
  submit_date as "Submit Date",
  hotel_type as "Loại hình khách sạn",
  rooms as "Số phòng",
  owner_role as "Vai trò",
  channel as "Kênh nhận đặt phòng",
  pain as "Khó khăn lớn nhất",
  time_cost as "Công việc tốn thời gian nhất",
  current_tool as "Công cụ hiện tại",
  readiness as "Sẵn sàng công nghệ 1-5",
  interest as "Mức độ quan tâm",
  solution as "Giải pháp muốn có",
  pilot as "Muốn thử miễn phí",
  wtp as "Sẵn sàng trả phí",
  budget as "Mức phí hợp lý",
  lead_consent as "Đồng ý liên hệ",
  name as "Tên",
  phone as "Số điện thoại",
  hotel_company as "Khách sạn/Công ty",
  position as "Chức vụ",
  lead_score as "Lead Score",
  priority as "Priority",
  follow_up_status as "Follow-up Status",
  notes as "Notes"
from public.survey_responses
where audience = 'owner';

create view public.survey_guest_responses as
select
  survey_id as "Survey ID",
  submit_date as "Submit Date",
  travel_history as "Đã từng lưu trú Vũng Tàu",
  booking_channel as "Kênh đặt khách sạn",
  criteria as "Tiêu chí chọn khách sạn",
  fanpage_zalo as "Hay nhắn Fanpage/Zalo",
  b2c_pain as "Khó chịu khi đặt khách sạn",
  slow_reply_loss as "Bỏ qua vì phản hồi chậm",
  price_mismatch as "Gặp giá báo khác ban đầu",
  response_time as "Kỳ vọng thời gian phản hồi",
  reply_info as "Thông tin muốn được trả lời ngay",
  bot_acceptance as "Chấp nhận chatbot",
  retention as "Muốn nhận ưu đãi lần sau",
  repeat_driver as "Lý do quay lại khách sạn cũ",
  trust_factor as "Yếu tố tạo niềm tin",
  open_insight as "Góp ý cải thiện",
  case
    when consent is true then 'Có'
    when consent is false then 'Không'
    else null
  end as "Contact Permission",
  name as "Name",
  phone as "Phone",
  lead_score as "Lead Score",
  priority as "Priority",
  follow_up_status as "Follow-up Status",
  notes as "Notes"
from public.survey_responses
where audience = 'guest';

create view public.survey_response_tracker as
select
  survey_id as "Survey ID",
  submit_date as "Submit Date",
  source as "Source",
  segment as "Segment",
  case
    when audience = 'owner' then owner_role
    when audience = 'guest' then 'Khách hàng'
    else null
  end as "Role",
  hotel_type as "Hotel Type",
  rooms as "Rooms",
  case
    when audience = 'owner' then pain
    when audience = 'guest' then concat_ws(
      ' | ',
      nullif(b2c_pain, ''),
      case
        when nullif(price_mismatch, '') is not null
          then 'Giá báo sau khác ban đầu: ' || price_mismatch
        else null
      end
    )
    else null
  end as "Biggest Pain",
  case
    when audience = 'owner' then solution
    when audience = 'guest' then concat_ws(
      ' | ',
      case when nullif(criteria, '') is not null then 'Tiêu chí chọn: ' || criteria end,
      case when nullif(reply_info, '') is not null then 'Mong trả lời ngay: ' || reply_info end,
      case when nullif(response_time, '') is not null then 'Thời gian phản hồi: ' || response_time end,
      case when nullif(bot_acceptance, '') is not null then 'Chatbot: ' || bot_acceptance end,
      case when nullif(trust_factor, '') is not null then 'Tạo niềm tin: ' || trust_factor end,
      case when nullif(open_insight, '') is not null then 'Góp ý: ' || open_insight end
    )
    else null
  end as "Desired Solution",
  readiness as "Tech Readiness 1-5",
  wtp as "Willingness To Pay",
  budget as "Budget Range",
  case
    when nullif(lead_consent, '') is not null then lead_consent
    when consent is true then 'Có'
    when consent is false then 'Không'
    else null
  end as "Contact Permission",
  name as "Name",
  phone as "Phone",
  hotel_company as "Hotel/Company",
  position as "Position",
  lead_score as "Lead Score",
  priority as "Priority",
  follow_up_status as "Follow-up Status",
  notes as "Notes"
from public.survey_responses;

commit;
