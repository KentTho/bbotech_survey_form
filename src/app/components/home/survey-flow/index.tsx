"use client";

import { useRef, useState } from "react";

const googleFormSrc =
  "https://docs.google.com/forms/d/e/1FAIpQLSdrsOJT_K_iHBnSb_bqGfhofMZIQoRzPIlTr7u4KgNLf9KEaw/viewform?embedded=true";

const surveyBadges = [
  "Chủ / Quản lý khách sạn",
  "Khách từng đặt phòng",
  "Có thể để lại SĐT/Email nếu muốn được liên hệ",
];

export default function SurveyFlow() {
  const [isSurveyStarted, setIsSurveyStarted] = useState(false);
  const surveyCardRef = useRef<HTMLDivElement>(null);

  const startSurvey = () => {
    setIsSurveyStarted(true);
    requestAnimationFrame(() => {
      surveyCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  return (
    <section
      id="surveyAnchor"
      className="scroll-mt-24 bg-section pt-10 pb-6 dark:bg-darkmode lg:pt-16 lg:pb-10"
    >
      <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div
          ref={surveyCardRef}
          className="mx-auto max-w-4xl rounded-[28px] border border-border bg-white p-4 shadow-property dark:border-dark_border dark:bg-semidark sm:p-6 lg:p-7"
        >
          {!isSurveyStarted ? (
            <div className="text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Khảo sát
              </p>
              <h2>Làm khảo sát 3–5 phút</h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray">
                Chọn nhóm phù hợp và hoàn thành biểu mẫu bên dưới. Câu trả lời
                sẽ giúp BBOTech hiểu rõ nhu cầu chuyển đổi số của khách sạn và
                trải nghiệm đặt phòng của khách hàng.
              </p>

              <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3">
                {surveyBadges.map((badge) => (
                  <span
                    key={badge}
                    className="rounded-full border border-border bg-herobg px-4 py-2 text-sm font-semibold text-midnight_text dark:border-dark_border dark:bg-darkmode dark:text-white"
                  >
                    {badge}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={startSurvey}
                className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[#207138]"
              >
                Bắt đầu khảo sát
              </button>
            </div>
          ) : (
            <div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                    Biểu mẫu khảo sát BBOTech
                  </p>
                  <h2>Làm khảo sát 3–5 phút</h2>
                  <p className="mt-4 max-w-3xl text-base leading-7 text-gray">
                    Vui lòng hoàn thành biểu mẫu. Nếu biểu mẫu không hiển thị,
                    bạn có thể mở bằng liên kết bên dưới.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSurveyStarted(false)}
                  className="inline-flex shrink-0 rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
                >
                  Thu gọn biểu mẫu
                </button>
              </div>

              <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-dark_border">
                <div className="h-[680px] sm:h-[620px] lg:h-[560px]">
                  <iframe
                    src={googleFormSrc}
                    title="BBOTech hotel survey form"
                    loading="lazy"
                    className="h-full w-full border-0"
                  />
                </div>
              </div>

              <a
                href={googleFormSrc}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex font-semibold text-primary underline-offset-4 hover:underline"
              >
                Mở Google Form trong tab mới
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
