"use client";

import { useState } from "react";

type Audience = "owner" | "guest";
type QuestionType = "single" | "multiple" | "scale" | "short" | "long" | "contact";

type SurveyQuestion = {
  id: string;
  category: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[];
  insight: string;
  fieldKey: string;
  conditional?: { dependsOnFieldKey: string; expectedValue: string };
};

const audienceOptions: {
  key: Audience;
  title: string;
  description: string;
  icon: "hotel" | "guest";
}[] = [
    {
      key: "owner",
      title: "Chủ / Quản lý / Nhân sự khách sạn",
      description:
        "Tôi đang vận hành, quản lý hoặc làm việc tại khách sạn, homestay, cơ sở lưu trú.",
      icon: "hotel",
    },
    {
      key: "guest",
      title: "Khách từng đặt / lưu trú khách sạn",
      description:
        "Tôi từng đặt phòng hoặc lưu trú tại khách sạn, homestay, cơ sở lưu trú.",
      icon: "guest",
    },
  ];

const ownerQuestions: SurveyQuestion[] = [
  { id: "B1", category: "Thông tin cơ bản", question: "Khách sạn/cơ sở lưu trú của anh/chị thuộc nhóm nào?", type: "single", required: true, options: ["1 sao", "2 sao", "3 sao", "Homestay", "Căn hộ dịch vụ", "Khác"], insight: "Phân loại loại hình", fieldKey: "HotelType" },
  { id: "B2", category: "Thông tin cơ bản", question: "Khách sạn có khoảng bao nhiêu phòng?", type: "single", required: true, options: ["Dưới 10", "10–30", "31–60", "Trên 60"], insight: "Quy mô vận hành", fieldKey: "Rooms" },
  { id: "B3", category: "Thông tin cơ bản", question: "Vai trò của anh/chị là gì?", type: "single", required: true, options: ["Chủ khách sạn", "Quản lý", "Lễ tân", "Marketing/Sales", "Nhân sự vận hành", "Khác"], insight: "Đánh giá quyền quyết định", fieldKey: "Role" },
  { id: "B4", category: "Kênh bán/phục vụ", question: "Khách sạn hiện nhận đặt phòng chủ yếu qua kênh nào?", type: "multiple", required: true, options: ["Facebook/Zalo", "Agoda/Booking/Traveloka", "Website riêng", "Khách quen", "Hotline", "Walk-in", "Khác"], insight: "Xác định điểm chạm cần automation", fieldKey: "Channel" },
  { id: "B5", category: "Pain point", question: "Khó khăn lớn nhất hiện tại của khách sạn là gì?", type: "multiple", required: true, options: ["Thiếu khách", "Trả lời khách chậm", "Quản lý đặt phòng thủ công", "Sai sót thông tin phòng", "Khó chăm sóc khách cũ", "Marketing chưa hiệu quả", "Nhân sự thiếu ổn định", "Không có hệ thống quản lý nội bộ", "Khác"], insight: "Top pain point", fieldKey: "Pain" },
  { id: "B6", category: "Pain point", question: "Công việc nào đang tốn nhiều thời gian nhất mỗi ngày?", type: "multiple", required: true, options: ["Trả lời tin nhắn", "Xác nhận đặt phòng", "Cập nhật tình trạng phòng", "Nhắc lịch/check-in/check-out", "Xử lý phàn nàn", "Quản lý nhân sự", "Làm content", "Báo cáo doanh thu", "Khác"], insight: "Xác định quy trình nên tự động hóa", fieldKey: "TimeCost" },
  { id: "B7", category: "Tech adoption", question: "Khách sạn hiện có dùng phần mềm/quy trình công nghệ nào không?", type: "single", required: true, options: ["Phần mềm quản lý khách sạn", "Excel/Google Sheet", "Có nhưng chưa hiệu quả", "Chưa dùng nhiều", "Không rõ"], insight: "Mức độ trưởng thành công nghệ", fieldKey: "CurrentTool" },
  { id: "B8", category: "Tech adoption", question: "Mức độ sẵn sàng dùng công nghệ mới của khách sạn?", type: "scale", required: true, options: ["1", "2", "3", "4", "5"], insight: "Readiness score", fieldKey: "Readiness" },
  { id: "B9", category: "Nhu cầu", question: "Nếu có hệ thống giúp tự động trả lời khách, ghi nhận nhu cầu, nhắc lịch, lưu thông tin và tạo báo cáo, anh/chị có quan tâm không?", type: "single", required: true, options: ["Rất quan tâm", "Có quan tâm", "Cần xem thêm", "Chưa quan tâm", "Không cần"], insight: "Interest in integrated solution", fieldKey: "Interest" },
  { id: "B10", category: "Nhu cầu", question: "Giải pháp nào khách sạn muốn có nhất?", type: "multiple", required: true, options: ["Chatbot tư vấn phòng", "Quản lý inbox", "Chăm sóc khách cũ", "Landing page/website", "Email/Zalo marketing", "Chấm công", "Ghi chú nội bộ", "Dashboard", "Thu thập đánh giá khách", "Khác"], insight: "Product opportunity", fieldKey: "Solution" },
  { id: "B11", category: "Nhu cầu", question: "Nếu được thử miễn phí một giải pháp, anh/chị muốn thử cái nào trước?", type: "short", required: false, insight: "Xác định pilot để chốt", fieldKey: "Pilot" },
  { id: "B12", category: "Chi trả", question: "Khách sạn có sẵn sàng trả phí hằng tháng cho giải pháp giúp tiết kiệm thời gian/tăng khách không?", type: "single", required: true, options: ["Có", "Có, nếu thấy hiệu quả", "Chưa chắc", "Không"], insight: "Willingness to pay", fieldKey: "WTP" },
  { id: "B13", category: "Chi trả", question: "Mức phí hợp lý mỗi tháng là bao nhiêu?", type: "single", required: true, options: ["Dưới 500.000đ", "500.000đ–1.000.000đ", "1.000.000đ–3.000.000đ", "3.000.000đ–5.000.000đ", "Trên 5.000.000đ"], insight: "Pricing range", fieldKey: "Budget" },
  { id: "B14", category: "Lead", question: "Anh/chị có muốn BBOTech liên hệ tư vấn thử nghiệm giải pháp không?", type: "single", required: true, options: ["Có", "Không"], insight: "Consent to contact", fieldKey: "LeadConsent" },
  { id: "B15", category: "Lead", question: "Thông tin liên hệ", type: "contact", required: true, conditional: { dependsOnFieldKey: "LeadConsent", expectedValue: "Có" }, insight: "Lead capture", fieldKey: "Contact" },
];

const guestQuestions: SurveyQuestion[] = [
  { id: "C1", category: "Hành vi", question: "Bạn có từng đi du lịch/lưu trú tại Vũng Tàu chưa?", type: "single", required: true, options: ["Có", "Chưa nhưng có dự định", "Chưa"], insight: "Lọc trải nghiệm liên quan", fieldKey: "TravelHistory" },
  { id: "C2", category: "Hành vi", question: "Bạn thường đặt khách sạn qua đâu?", type: "multiple", required: true, options: ["Agoda/Booking/Traveloka", "Facebook", "Google Maps", "Zalo/hotline", "Người quen", "Website khách sạn", "Khác"], insight: "Kênh tìm kiếm/đặt phòng", fieldKey: "BookingChannel" },
  { id: "C3", category: "Hành vi", question: "Khi chọn khách sạn 2–3 sao, bạn quan tâm nhất điều gì?", type: "multiple", required: true, options: ["Giá", "Vị trí", "Hình ảnh phòng", "Đánh giá khách", "Phản hồi nhanh", "Chính sách hủy/đổi", "Dịch vụ đi kèm", "Độ uy tín", "Khác"], insight: "Decision criteria", fieldKey: "Criteria" },
  { id: "C4", category: "Pain point", question: "Điều gì khiến bạn khó chịu nhất khi đặt khách sạn?", type: "multiple", required: true, options: ["Nhắn tin lâu được trả lời", "Giá không rõ", "Hình ảnh không giống thực tế", "Không biết còn phòng không", "Quy trình rườm rà", "Tư vấn thiếu thông tin", "Khó tìm dịch vụ", "Khác"], insight: "Customer pain", fieldKey: "B2CPain" },
  { id: "C5", category: "Pain point", question: "Bạn có từng bỏ qua một khách sạn vì họ phản hồi chậm không?", type: "single", required: true, options: ["Có", "Không", "Không nhớ"], insight: "Impact of response speed", fieldKey: "SlowReplyLoss" },
  { id: "C6", category: "Kỳ vọng", question: "Bạn thích khách sạn phản hồi trong bao lâu?", type: "single", required: true, options: ["Ngay lập tức", "Trong 5 phút", "Trong 15 phút", "Trong 1 giờ", "Bao lâu cũng được nếu thông tin rõ"], insight: "Service expectation", fieldKey: "ResponseTime" },
  { id: "C7", category: "Kỳ vọng", question: "Bạn có thích khách sạn có chatbot/tự động trả lời thông tin cơ bản không?", type: "single", required: true, options: ["Có, nếu đúng và nhanh", "Có thể", "Không thích", "Không quan tâm"], insight: "Chatbot acceptance", fieldKey: "BotAcceptance" },
  { id: "C8", category: "Retention", question: "Sau khi lưu trú, bạn có muốn nhận ưu đãi/quà tặng/combo cho lần sau không?", type: "single", required: true, options: ["Có", "Có nếu phù hợp", "Không"], insight: "Retention potential", fieldKey: "Retention" },
  { id: "C9", category: "Retention", question: "Điều gì khiến bạn quay lại một khách sạn cũ?", type: "multiple", required: true, options: ["Giá tốt", "Phục vụ tốt", "Phòng sạch", "Gần biển/trung tâm", "Ưu đãi khách cũ", "Đặt phòng nhanh", "Nhân viên nhớ nhu cầu", "Khác"], insight: "Repeat driver", fieldKey: "Repeat" },
  { id: "C10", category: "Mở", question: "Theo bạn, khách sạn nhỏ nên cải thiện điều gì nhất?", type: "long", required: false, insight: "Qualitative insight", fieldKey: "OpenInsight" },
];

const incentiveItems = [
  "Checklist tối ưu trải nghiệm khách sạn",
  "Bản tóm tắt insight khảo sát",
  "Tư vấn sơ bộ nếu phù hợp",
];

const sidebarItems = [
  "Checklist tối ưu trải nghiệm khách sạn",
  "Bản tóm tắt insight khảo sát ngành lưu trú",
  "Tư vấn sơ bộ miễn phí nếu phù hợp",
];

const buttonBase =
  "rounded-lg border px-4 py-3 text-left transition-colors duration-200";

function AudienceIcon({ type }: { type: "hotel" | "guest" }) {
  if (type === "hotel") {
    return (
      <svg
        aria-hidden="true"
        className="h-8 w-8"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16M8 7h2m3 0h1m-6 4h2m3 0h1m-6 4h2m3 0h1m3-6h1a2 2 0 0 1 2 2v10M2 21h20"
        />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className="h-8 w-8"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 21v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1m7-9a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm13 9v-1a4 4 0 0 0-3-3.87m-4-11.26a4 4 0 0 1 0 7.75"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5 12 4 4L19 6"
      />
    </svg>
  );
}

export default function SurveyFlow() {
  const [audience, setAudience] = useState<Audience | null>(null);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [resource, setResource] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const baseQuestions =
    audience === "owner"
      ? ownerQuestions
      : audience === "guest"
        ? guestQuestions
        : [];

  const visibleQuestions = baseQuestions.filter(q => {
    if (!q.conditional) return true;
    return answers[q.conditional.dependsOnFieldKey] === q.conditional.expectedValue;
  });

  const isFinalStep = audience !== null && step === visibleQuestions.length;
  const currentQuestion = visibleQuestions[step];

  const selectAudience = (key: Audience) => {
    // Audience lock: once a group is chosen, it cannot be changed in the same
    // session. Clicking either card afterwards is a no-op and never resets the
    // survey flow (answers/step are preserved).
    if (audience !== null) return;
    setAudience(key);
    setStep(0);
    setAnswers({});
    setResource("");
    setContactInfo("");
    setConsent(false);
    setSubmitted(false);
  };

  const handleSingleSelect = (key: string, value: string) => {
    setAnswers((prev) => {
      const newAnswers = { ...prev, [key]: value };
      // Clear conditional downstream if a conditional upstream changed
      if (key === "LeadConsent" && value === "Không") {
        delete newAnswers["Contact"];
      }
      return newAnswers;
    });
  };

  const handleMultipleSelect = (key: string, value: string) => {
    setAnswers((prev) => {
      const currentArr = Array.isArray(prev[key]) ? prev[key] : [];
      if (currentArr.includes(value)) {
        return { ...prev, [key]: currentArr.filter((item: string) => item !== value) };
      }
      return { ...prev, [key]: [...currentArr, value] };
    });
  };

  const handleTextChange = (key: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (field: string, value: string) => {
    setAnswers((prev) => {
      const currentContact = prev["Contact"] || {};
      return { ...prev, ["Contact"]: { ...currentContact, [field]: value } };
    });
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 0));
  };

  const validateCurrentQuestion = () => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true;

    const val = answers[currentQuestion.fieldKey];
    if (currentQuestion.type === "multiple") {
      return Array.isArray(val) && val.length > 0;
    }
    if (currentQuestion.type === "contact") {
      return val && val.name && val.phone;
    }
    return val !== undefined && val !== "" && val !== null;
  };

  const goNext = () => {
    if (validateCurrentQuestion()) {
      setStep((current) => current + 1);
    }
  };

  const buildSubmissionPayload = () => {
    const audienceLabel =
      audienceOptions.find((option) => option.key === audience)?.title ?? "";
    const isBrowser = typeof window !== "undefined";
    const randomSuffix = Math.random().toString(36).slice(2, 8);

    return {
      responseId: `BBO-${Date.now()}-${randomSuffix}`,
      audience,
      audienceLabel,
      answers,
      resources: resource,
      consent,
      contact: answers["Contact"] ?? null,
      contactInfo,
      source: "bbotech-vung-tau-hotel-survey",
      pageUrl: isBrowser ? window.location.href : "",
      userAgent: isBrowser ? navigator.userAgent : "",
      completedAt: new Date().toISOString(),
    };
  };

  const handleSubmitSurvey = async () => {
    if (!resource || !consent) return;

    setSubmitError("");
    setSubmitting(true);

    try {
      const payload = buildSubmissionPayload();
      // Submit chính qua API route nội bộ → Supabase (server-side, dùng service role).
      // Không dùng no-cors: cần đọc được JSON response để biết thành công/thất bại.
      const res = await fetch("/api/survey/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);

      if (res.ok && result?.ok) {
        setSubmitted(true);
      } else {
        setSubmitError(
          result?.error
            ? "Không gửi được khảo sát: " + result.error
            : "Không gửi được khảo sát. Vui lòng thử lại.",
        );
      }
    } catch {
      setSubmitError("Không gửi được khảo sát. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const reopenFinalStep = (selectedResource: string) => {
    setResource(selectedResource);
    setSubmitted(false);
    setStep(visibleQuestions.length);
  };

  const getHint = (type: QuestionType) => {
    switch (type) {
      case "single": return "Chọn 1 đáp án.";
      case "multiple": return "Chọn một hoặc nhiều đáp án phù hợp.";
      case "scale": return "Chọn mức phù hợp nhất.";
      case "short":
      case "long": return "Có thể bỏ qua nếu chưa có câu trả lời.";
      default: return "";
    }
  };

  return (
    <>


      <section className="bg-herobg dark:bg-darklight">
        <div className="container mx-auto grid gap-8 px-4 md:max-w-screen-md lg:max-w-screen-xl lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Phần thưởng
            </p>
            <h2>Hoàn thành khảo sát để nhận tài nguyên miễn phí từ BBOTech</h2>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-gray">
              Người tham gia có thể nhận checklist tối ưu trải nghiệm khách sạn, bản tóm tắt insight hoặc tư vấn sơ bộ miễn phí nếu phù hợp.
            </p>
            <p className="mt-4 font-medium text-midnight_text dark:text-white">
              Bạn sẽ chọn tài nguyên muốn nhận ở bước cuối khảo sát.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-white p-6 shadow-property dark:border-dark_border dark:bg-semidark">
            <div className="space-y-4">
              {incentiveItems.map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 text-midnight_text dark:text-white"
                >
                  <span className="mt-0.5 text-primary">
                    <CheckIcon />
                  </span>
                  <span className="leading-7">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section
        id="aud-anchor"
        className="scroll-mt-24 bg-white dark:bg-darkmode"
      >
        <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Đối tượng
            </p>
            <h2>Bạn thuộc nhóm nào?</h2>
            <p className="mt-5 text-lg leading-8 text-gray">
              Chọn nhóm phù hợp để chúng tôi hỏi đúng những câu liên quan đến bạn.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-2">
            {audienceOptions.map((option) => {
              const selected = audience === option.key;
              const locked = audience !== null;
              // Card không được chọn sẽ bị khóa khi đã chọn nhóm khác.
              const isDisabled = locked && !selected;

              return (
                <button
                  key={option.key}
                  type="button"
                  data-audience={option.key}
                  aria-pressed={selected}
                  aria-disabled={isDisabled}
                  disabled={isDisabled}
                  onClick={() => selectAudience(option.key)}
                  className={`rounded-lg border p-6 text-left shadow-property transition-all duration-300 ${selected
                      ? "border-primary bg-herobg ring-2 ring-primary/20 dark:bg-semidark"
                      : isDisabled
                        ? "cursor-not-allowed border-border bg-white opacity-50 dark:border-dark_border dark:bg-semidark"
                        : "border-border bg-white hover:-translate-y-1 dark:border-dark_border dark:bg-semidark"
                    }`}
                >
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AudienceIcon type={option.icon} />
                  </div>
                  <h3 className="text-xl font-bold text-midnight_text dark:text-white">
                    {option.title}
                  </h3>
                  <p className="mt-3 leading-7 text-gray">
                    {option.description}
                  </p>
                  <span className="mt-5 inline-flex text-sm font-semibold text-primary">
                    {selected ? "Đã chọn" : "Chọn nhóm này"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section
        id="surveyAnchor"
        className="scroll-mt-24 bg-section dark:bg-darkmode"
      >
        <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              Khảo sát
            </p>
            <h2>Làm khảo sát 3–5 phút</h2>
            <p className="mt-5 text-lg leading-8 text-gray">
              Mỗi lần một câu hỏi — trả lời xong câu này mới hiện câu kế. Nhẹ nhàng và nhanh gọn.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-lg border border-border bg-white p-6 shadow-property dark:border-dark_border dark:bg-semidark sm:p-8">
              {!audience && (
                <div data-survey-state="empty">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                    Chọn đối tượng
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-midnight_text dark:text-white">
                    Vui lòng chọn nhóm của bạn trước khi bắt đầu
                  </h3>
                  <p className="mt-4 leading-7 text-gray">
                    Chúng tôi cần biết bạn là Chủ / Quản lý / Nhân sự khách sạn hay Khách từng đặt / lưu trú để hỏi đúng câu liên quan.
                  </p>
                  <a
                    href="#aud-anchor"
                    className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-[#207138]"
                  >
                    Chọn nhóm của tôi
                  </a>
                </div>
              )}

              {audience && submitted && (
                <div data-survey-state="thanks">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                    Hoàn tất
                  </p>
                  <h3 className="mt-3 text-2xl font-bold text-midnight_text dark:text-white">
                    Cảm ơn bạn đã hoàn thành khảo sát
                  </h3>
                  <p className="mt-4 leading-7 text-gray">
                    BBOTech sẽ tổng hợp dữ liệu và gửi tài nguyên / báo cáo insight cho người đăng ký nhận. Nếu bạn là khách sạn và muốn được tư vấn, đội ngũ sẽ liên hệ lại.
                  </p>
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => reopenFinalStep("Checklist tối ưu trải nghiệm khách sạn")}
                      className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-[#207138]"
                    >
                      Nhận checklist
                    </button>
                    <button
                      type="button"
                      onClick={() => reopenFinalStep("Tư vấn sơ bộ nếu phù hợp")}
                      className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                    >
                      Đăng ký tư vấn
                    </button>
                  </div>
                  <p className="mt-5 text-sm text-gray">
                    Theo dõi thêm tại Fanpage BBOTech
                  </p>
                </div>
              )}

              {audience && !submitted && (
                <>
                  <div className="mb-7 flex gap-2" aria-label="Tiến độ khảo sát">
                    {Array.from({ length: visibleQuestions.length + 1 }).map(
                      (_, index) => (
                        <span
                          key={index}
                          className={`h-2 flex-1 rounded-full ${index <= step ? "bg-primary" : "bg-herobg"
                            }`}
                        />
                      ),
                    )}
                  </div>

                  {!isFinalStep && currentQuestion && (
                    <div data-survey-state={`${audience}-question-${step + 1}`}>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                        {currentQuestion.category}
                      </p>
                      <p className="mt-2 text-sm text-gray">
                        Câu {step + 1} / {audience === "guest" ? "10" : visibleQuestions.length}
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-midnight_text dark:text-white">
                        {currentQuestion.question}
                      </h3>

                      {getHint(currentQuestion.type) && (
                        <p className="mt-2 text-sm italic text-gray">
                          {getHint(currentQuestion.type)}
                        </p>
                      )}

                      {/* Single / Scale Options */}
                      {(currentQuestion.type === "single" || currentQuestion.type === "scale") && (
                        <div className={`mt-6 grid gap-3 ${currentQuestion.type === "scale" ? "grid-cols-5" : ""}`}>
                          {currentQuestion.options?.map((option) => {
                            const selected = answers[currentQuestion.fieldKey] === option;
                            return (
                              <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => handleSingleSelect(currentQuestion.fieldKey, option)}
                                className={`${buttonBase} ${currentQuestion.type === "scale" ? "text-center px-0" : ""} ${selected
                                    ? "border-primary bg-herobg text-midnight_text dark:bg-darklight dark:text-white"
                                    : "border-border text-gray hover:border-primary hover:text-midnight_text dark:border-dark_border dark:hover:text-white"
                                  }`}
                              >
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Multiple Options */}
                      {currentQuestion.type === "multiple" && (
                        <div className="mt-6 grid gap-3">
                          {currentQuestion.options?.map((option) => {
                            const selectedArr = answers[currentQuestion.fieldKey] || [];
                            const selected = selectedArr.includes(option);
                            return (
                              <button
                                key={option}
                                type="button"
                                aria-pressed={selected}
                                onClick={() => handleMultipleSelect(currentQuestion.fieldKey, option)}
                                className={`${buttonBase} ${selected
                                    ? "border-primary bg-herobg text-midnight_text dark:bg-darklight dark:text-white"
                                    : "border-border text-gray hover:border-primary hover:text-midnight_text dark:border-dark_border dark:hover:text-white"
                                  }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-5 w-5 items-center justify-center rounded border ${selected ? "bg-primary border-primary" : "border-border"}`}>
                                    {selected && (
                                      <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    )}
                                  </div>
                                  <span>{option}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Short Answer */}
                      {currentQuestion.type === "short" && (
                        <div className="mt-6">
                          <input
                            type="text"
                            value={answers[currentQuestion.fieldKey] || ""}
                            onChange={(e) => handleTextChange(currentQuestion.fieldKey, e.target.value)}
                            placeholder="Nhập câu trả lời..."
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                        </div>
                      )}

                      {/* Long Answer */}
                      {currentQuestion.type === "long" && (
                        <div className="mt-6">
                          <textarea
                            rows={4}
                            value={answers[currentQuestion.fieldKey] || ""}
                            onChange={(e) => handleTextChange(currentQuestion.fieldKey, e.target.value)}
                            placeholder="Nhập câu trả lời chi tiết..."
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                        </div>
                      )}

                      {/* Contact Fields */}
                      {currentQuestion.type === "contact" && (
                        <div className="mt-6 grid gap-4">
                          <input
                            type="text"
                            value={answers["Contact"]?.name || ""}
                            onChange={(e) => handleContactChange("name", e.target.value)}
                            placeholder="Tên của bạn (*)"
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                          <input
                            type="tel"
                            value={answers["Contact"]?.phone || ""}
                            onChange={(e) => handleContactChange("phone", e.target.value)}
                            placeholder="Số điện thoại (*)"
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                          <input
                            type="text"
                            value={answers["Contact"]?.hotel || ""}
                            onChange={(e) => handleContactChange("hotel", e.target.value)}
                            placeholder="Tên khách sạn"
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                          <input
                            type="text"
                            value={answers["Contact"]?.role || ""}
                            onChange={(e) => handleContactChange("role", e.target.value)}
                            placeholder="Chức vụ"
                            className="w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                          />
                        </div>
                      )}

                      <div className="mt-7 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          data-survey-action="back"
                          onClick={goBack}
                          disabled={step === 0}
                          className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:border-lightgray disabled:text-gray disabled:hover:bg-transparent"
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          data-survey-action="next"
                          onClick={goNext}
                          disabled={!validateCurrentQuestion()}
                          className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-[#207138] disabled:cursor-not-allowed disabled:bg-lightgray disabled:text-gray"
                        >
                          Tiếp
                        </button>
                      </div>
                    </div>
                  )}

                  {isFinalStep && (
                    <div data-survey-state={`${audience}-final`}>
                      <p className="text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                        Bước cuối
                      </p>
                      <h3 className="mt-3 text-2xl font-bold text-midnight_text dark:text-white">
                        Gần xong rồi! Chọn tài nguyên và xác nhận.
                      </h3>

                      <div className="mt-6 grid gap-3">
                        {incentiveItems.map((item) => (
                          <label
                            key={item}
                            className={`${buttonBase} flex cursor-pointer items-start gap-3 ${resource === item
                                ? "border-primary bg-herobg text-midnight_text dark:bg-darklight dark:text-white"
                                : "border-border text-gray dark:border-dark_border"
                              }`}
                          >
                            <input
                              type="radio"
                              name="resource"
                              value={item}
                              checked={resource === item}
                              onChange={(event) =>
                                setResource(event.target.value)
                              }
                              className="mt-1 accent-primary"
                            />
                            <span>{item}</span>
                          </label>
                        ))}
                      </div>

                      <label className="mt-6 block font-medium text-midnight_text dark:text-white">
                        Email / SĐT để nhận tài nguyên (tuỳ chọn)
                        <input
                          type="text"
                          value={contactInfo}
                          onChange={(event) => setContactInfo(event.target.value)}
                          placeholder="email@khachsan.vn · hoặc số điện thoại / Zalo"
                          className="mt-2 block w-full rounded-lg border border-border px-4 py-3 text-midnight_text outline-none focus:border-primary dark:border-dark_border dark:bg-darkmode dark:text-white dark:focus:border-primary"
                        />
                      </label>

                      <label className="mt-5 flex cursor-pointer items-start gap-3 leading-7 text-gray">
                        <input
                          type="checkbox"
                          checked={consent}
                          onChange={(event) => setConsent(event.target.checked)}
                          className="mt-1.5 accent-primary"
                        />
                        <span>
                          Tôi đồng ý cho BBOTech dùng dữ liệu để phân tích và liên hệ tư vấn nếu phù hợp. Thông tin chỉ dùng để tổng hợp nghiên cứu.
                        </span>
                      </label>

                      <div className="mt-7 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          data-survey-action="back"
                          onClick={goBack}
                          className="rounded-lg border border-primary px-5 py-3 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                        >
                          Quay lại
                        </button>
                        <button
                          type="button"
                          data-survey-action="submit"
                          onClick={handleSubmitSurvey}
                          disabled={!resource || !consent || submitting}
                          className="rounded-lg bg-primary px-5 py-3 font-semibold text-white transition-colors hover:bg-[#207138] disabled:cursor-not-allowed disabled:bg-lightgray disabled:text-gray"
                        >
                          {submitting ? "Đang gửi..." : "Gửi khảo sát"}
                        </button>
                      </div>

                      {submitError && (
                        <p
                          role="alert"
                          data-survey-error="submit"
                          className="mt-3 text-sm font-medium text-red-500"
                        >
                          {submitError}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <aside className="rounded-lg border border-border bg-white p-6 shadow-property dark:border-dark_border dark:bg-semidark">
              <h3 className="text-xl font-bold text-midnight_text dark:text-white">
                Bạn sẽ nhận được
              </h3>
              <div className="mt-5 space-y-4">
                {sidebarItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-gray">
                    <span className="mt-0.5 text-primary">
                      <CheckIcon />
                    </span>
                    <span className="leading-7">{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-6 border-t border-border pt-5 text-sm font-semibold text-midnight_text dark:border-dark_border dark:text-white">
                Mất khoảng 3–5 phút · {audience === "owner" ? "14–15" : "10"} câu
              </p>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
