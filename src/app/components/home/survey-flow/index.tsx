"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const googleFormSrc =
  "https://docs.google.com/forms/d/e/1FAIpQLSdrsOJT_K_iHBnSb_bqGfhofMZIQoRzPIlTr7u4KgNLf9KEaw/viewform?embedded=true";

const surveyCompletionStorageKey = "bbotech_survey_completed_v1";
const fallbackRewardDelayMs = 50000;
const thankYouDetectionDelayMs = 15000;

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

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.9"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3l1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3Zm6 11 .8 2.5 2.2.8-2.2.8L18 21l-.8-2.9-2.2-.8 2.2-.8L18 14Z"
      />
    </svg>
  );
}

export default function SurveyFlow() {
  const [isSurveyStarted, setIsSurveyStarted] = useState(false);
  const [isSurveyCompleted, setIsSurveyCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasDetectedThankYou, setHasDetectedThankYou] = useState(false);
  const [canShowFallbackReward, setCanShowFallbackReward] = useState(false);

  const surveyCardRef = useRef<HTMLDivElement>(null);
  const iframeLoadCountRef = useRef(0);
  const surveyStartedAtRef = useRef<number | null>(null);
  const confettiTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fallbackRewardTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clearFallbackRewardTimer = () => {
    if (fallbackRewardTimeoutRef.current) {
      clearTimeout(fallbackRewardTimeoutRef.current);
      fallbackRewardTimeoutRef.current = null;
    }
  };

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

      clearFallbackRewardTimer();
    };
  }, []);

  const scrollSurveyIntoView = () => {
    requestAnimationFrame(() => {
      surveyCardRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const startSurvey = () => {
    setIsSurveyStarted(true);
    setHasDetectedThankYou(false);
    setCanShowFallbackReward(false);
    iframeLoadCountRef.current = 0;
    surveyStartedAtRef.current = Date.now();
    clearFallbackRewardTimer();

    fallbackRewardTimeoutRef.current = setTimeout(() => {
      setCanShowFallbackReward(true);
    }, fallbackRewardDelayMs);

    scrollSurveyIntoView();
  };

  const collapseSurvey = () => {
    setIsSurveyStarted(false);
    setHasDetectedThankYou(false);
    setCanShowFallbackReward(false);
    iframeLoadCountRef.current = 0;
    surveyStartedAtRef.current = null;
    clearFallbackRewardTimer();
  };

  const handleIframeLoad = () => {
    iframeLoadCountRef.current += 1;

    if (iframeLoadCountRef.current === 1 || !surveyStartedAtRef.current) {
      return;
    }

    const elapsedMs = Date.now() - surveyStartedAtRef.current;

    if (iframeLoadCountRef.current >= 2 && elapsedMs > thankYouDetectionDelayMs) {
      setHasDetectedThankYou(true);
      setCanShowFallbackReward(false);
    }
  };

  const completeSurvey = () => {
    setIsSurveyCompleted(true);
    setIsSurveyStarted(false);
    setHasDetectedThankYou(false);
    setCanShowFallbackReward(false);
    setShowConfetti(true);
    surveyStartedAtRef.current = null;
    iframeLoadCountRef.current = 0;
    clearFallbackRewardTimer();

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

    scrollSurveyIntoView();
  };

  return (
    <section
      id="surveyAnchor"
      className="scroll-mt-24 overflow-hidden bg-section pt-10 pb-6 dark:bg-darkmode lg:pt-16 lg:pb-10"
    >
      <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div
          ref={surveyCardRef}
          className="bbo-glass relative mx-auto max-w-4xl overflow-hidden rounded-[24px] border-primary/15 p-3 dark:bbo-glass-dark sm:rounded-[28px] sm:p-6 lg:p-7"
        >
          <div className="pointer-events-none absolute -right-16 top-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
          <div className="pointer-events-none absolute -left-20 bottom-0 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />

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

          <div className="relative z-10">
            {isSurveyCompleted ? (
              <div className="mx-auto max-w-3xl min-w-0 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
                  <CheckIcon />
                </div>
                <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  Khảo sát đã ghi nhận
                </p>
                <h2 className="text-primary">Bạn đã hoàn thành khảo sát</h2>
                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-primary/80">
                  Cảm ơn bạn đã đóng góp thông tin cho BBOTech. Phần quà/ưu đãi
                  khảo sát sẽ được gửi theo thông tin bạn đã để lại.
                </p>
                <p className="mx-auto mt-6 inline-flex max-w-full rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-center text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-white/10">
                  Bạn đã hoàn thành khảo sát trên thiết bị này.
                </p>
              </div>
            ) : !isSurveyStarted ? (
              <div className="min-w-0 text-center">
                <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur dark:bg-white/10">
                  Khảo sát 3–5 phút
                </p>
                <h2 className="text-primary">Làm khảo sát 3–5 phút</h2>
                <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-primary/80">
                  Vui lòng hoàn thành biểu mẫu bên dưới. Câu trả lời sẽ được
                  BBOTech dùng để tổng hợp nhu cầu thị trường và chuẩn bị ưu đãi
                  phù hợp.
                </p>

                <div className="mx-auto mt-6 flex max-w-3xl flex-wrap justify-center gap-3">
                  {surveyBadges.map((badge) => (
                    <span
                      key={badge}
                      className="max-w-full rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-center text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-white/10"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={startSurvey}
                  className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 sm:w-auto"
                >
                  <SparkIcon />
                  Bắt đầu khảo sát
                </button>
              </div>
            ) : (
              <div className="min-w-0">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                      Đang làm khảo sát
                    </p>
                    <h2 className="text-primary">Làm khảo sát 3–5 phút</h2>
                    <p className="mt-4 max-w-3xl text-base leading-7 text-primary/80">
                      Hoàn thành Google Form trong khung bên dưới. Sau khi form
                      chuyển sang màn hình xác nhận, nút nhận quà sẽ xuất hiện.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={collapseSurvey}
                    className="inline-flex w-full shrink-0 justify-center rounded-xl border border-primary/25 bg-white/70 px-4 py-2 text-center text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-white dark:bg-white/10 sm:w-auto"
                  >
                    Thu gọn biểu mẫu
                  </button>
                </div>

                <div className="mt-6 w-full overflow-hidden rounded-2xl border border-primary/15 bg-white shadow-sm dark:border-primary/20">
                  <div className="h-[620px] w-full sm:h-[620px] lg:h-[560px]">
                    <iframe
                      src={googleFormSrc}
                      title="BBOTech hotel survey form"
                      loading="lazy"
                      onLoad={handleIframeLoad}
                      className="h-full w-full border-0"
                    />
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <a
                    href={googleFormSrc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    Mở Google Form trong tab mới
                  </a>
                  <span className="inline-flex max-w-full rounded-full border border-primary/15 bg-white/70 px-3 py-1 text-center text-xs font-semibold text-primary dark:bg-white/10">
                    Tự phát hiện sau khi form tải lại
                  </span>
                </div>

                {hasDetectedThankYou ? (
                  <div className="mt-6 rounded-2xl border border-primary/20 bg-primary p-4 text-white shadow-lg shadow-primary/20 sm:p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/80">
                      Bạn đã gửi biểu mẫu?
                    </p>
                    <p className="mt-2 text-base leading-7 text-white/90">
                      Google Form đã chuyển sang màn hình xác nhận. Nếu bạn đã
                      gửi biểu mẫu, hãy bấm bên dưới để nhận quà khảo sát.
                    </p>
                    <button
                      type="button"
                      onClick={completeSurvey}
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 whitespace-normal rounded-xl bg-white px-5 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-white/90 sm:w-auto"
                    >
                      <SparkIcon />
                      Nhận quà khảo sát
                    </button>
                  </div>
                ) : canShowFallbackReward ? (
                  <div className="mt-6 rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
                    <p className="text-sm leading-6 text-primary/80">
                      Nếu bạn đã bấm Gửi trong Google Form nhưng chưa thấy xác
                      nhận tự động, hãy dùng nút này.
                    </p>
                    <button
                      type="button"
                      onClick={completeSurvey}
                      className="mt-4 inline-flex w-full items-center justify-center whitespace-normal rounded-xl border border-primary bg-white px-5 py-3 text-center text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white sm:w-auto"
                    >
                      Tôi đã gửi biểu mẫu — nhận quà
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
