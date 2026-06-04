"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const googleFormSrc =
  "https://docs.google.com/forms/d/e/1FAIpQLSdrsOJT_K_iHBnSb_bqGfhofMZIQoRzPIlTr7u4KgNLf9KEaw/viewform?embedded=true";

const surveyCompletionStorageKey = "bbotech_survey_completed_v1";

const confettiColors = ["#298D43", "#8DC73F", "#F7D65A", "#FFFFFF"];

const confettiPieces = Array.from({ length: 32 }, (_, index) => ({
  id: index,
  x: `${8 + ((index * 29) % 84)}%`,
  delay: `${(index % 8) * 0.06}s`,
  duration: `${1.6 + (index % 5) * 0.12}s`,
  rotate: `${(index * 47) % 360}deg`,
  size: `${6 + (index % 4) * 2}px`,
  drift: `${((index % 7) - 3) * 18}px`,
  color: confettiColors[index % confettiColors.length],
}));

type ConfettiStyle = CSSProperties & {
  "--x": string;
  "--delay": string;
  "--duration": string;
  "--rotate": string;
  "--size": string;
  "--drift": string;
  "--color": string;
};

const surveyBadges = [
  "Chủ / Quản lý khách sạn",
  "Khách từng đặt phòng",
  "Có thể để lại SĐT/Email nếu muốn được liên hệ",
];

export default function SurveyFlow() {
  const [isSurveyStarted, setIsSurveyStarted] = useState(false);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const surveyCardRef = useRef<HTMLDivElement>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      if (window.localStorage.getItem(surveyCompletionStorageKey) === "true") {
        setIsSurveyCompleted(true);
        setIsSurveyStarted(false);
      }
    } catch {
      // Ignore storage access errors so private browsing does not break the survey.
    }

    return () => {
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  const startSurvey = () => {
    setIsSurveyStarted(true);
    requestAnimationFrame(() => {
      surveyCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const completeSurvey = () => {
    setIsSurveyCompleted(true);
    setIsSurveyStarted(false);
    setShowConfetti(true);

    try {
      window.localStorage.setItem(surveyCompletionStorageKey, "true");
    } catch {
      // Completion still works for this session if localStorage is unavailable.
    }

    if (confettiTimeoutRef.current) {
      clearTimeout(confettiTimeoutRef.current);
    }

    confettiTimeoutRef.current = setTimeout(() => {
      setShowConfetti(false);
    }, 2400);

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
          className="relative mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-border bg-white p-4 shadow-property dark:border-dark_border dark:bg-semidark sm:p-6 lg:p-7"
        >
          {showConfetti ? (
            <div className="bbotech-confetti-layer" aria-hidden="true">
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="bbotech-confetti-piece"
                  style={
                    {
                      "--x": piece.x,
                      "--delay": piece.delay,
                      "--duration": piece.duration,
                      "--rotate": piece.rotate,
                      "--size": piece.size,
                      "--drift": piece.drift,
                      "--color": piece.color,
                    } as ConfettiStyle
                  }
                />
              ))}
            </div>
          ) : null}

          {isSurveyCompleted ? (
            <div className="relative z-10 text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                Khảo sát đã ghi nhận
              </p>
              <h2>Bạn đã hoàn thành khảo sát</h2>
              <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-gray">
                Cảm ơn bạn đã đóng góp thông tin cho BBOTech. Câu trả lời của
                bạn đã được ghi nhận qua Google Form.
              </p>
              <p className="mx-auto mt-5 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                Bạn đã hoàn thành khảo sát trên thiết bị này.
              </p>
            </div>
          ) : !isSurveyStarted ? (
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

              <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
                <p className="text-sm leading-6 text-gray">
                  Bấm nút này sau khi bạn đã gửi biểu mẫu Google Form.
                </p>
                <button
                  type="button"
                  onClick={completeSurvey}
                  className="mt-4 inline-flex shrink-0 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90 sm:mt-0"
                >
                  Tôi đã hoàn thành khảo sát
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
