"use client";

import { useEffect, useRef, useState } from "react";

const reasons = [
  {
    title: "Hiểu khó khăn vận hành",
    description:
      "Lắng nghe vấn đề thực tế hằng ngày của khách sạn vừa và nhỏ.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3a6 6 0 0 0-3.6 10.8c.72.54 1.1 1.1 1.1 1.7h5c0-.6.38-1.16 1.1-1.7A6 6 0 0 0 12 3Zm-2 16h4m-3 2h2"
        />
      </svg>
    ),
  },
  {
    title: "Ghi nhận nhu cầu",
    description: "Nắm đúng mong muốn của các cơ sở lưu trú quy mô nhỏ.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 4h8m-7 3h6m-9 4h12m-12 4h8m-8 4h5M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"
        />
      </svg>
    ),
  },
  {
    title: "Tìm điểm tối ưu",
    description: "Xác định khâu có thể cải thiện bằng công nghệ phù hợp.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4 17 5-5 4 3 7-8m-5 0h5v5M4 21h16"
        />
      </svg>
    ),
  },
  {
    title: "Tạo tài nguyên hữu ích",
    description:
      "Trả lại checklist và insight thiết thực cho người tham gia.",
    icon: (
      <svg
        aria-hidden="true"
        className="h-7 w-7"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 11.5 11 13l4-4m4-5H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm-3-2v4M8 2v4"
        />
      </svg>
    ),
  },
];

const cardDelays = ["0ms", "90ms", "180ms", "270ms"];

export default function Why() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="why-anchor"
      className={`why-section scroll-mt-24 bg-section dark:bg-darkmode ${
        isVisible ? "is-visible" : ""
      }`}
    >
      <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="why-animate max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Lý do tham gia
          </p>
          <h2 className="text-midnight_text dark:text-white">
            Vì sao khảo sát này quan trọng?
          </h2>
          <p className="mt-5 text-lg leading-8 text-gray">
            Khách hàng cần phản hồi nhanh hơn, khách sạn nhỏ thiếu nhân sự và
            công cụ, nhiều quy trình còn thủ công. BBOTech muốn hiểu đúng vấn đề
            trước khi đề xuất giải pháp.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason, index) => (
            <div
              key={reason.title}
              className="why-card-animate h-full"
              style={
                { "--delay": cardDelays[index] ?? "0ms" } as React.CSSProperties
              }
            >
              <article className="flex h-full flex-col rounded-lg border border-border bg-white p-6 shadow-property transition-transform duration-300 hover:-translate-y-1.5 dark:border-dark_border dark:bg-semidark">
                <div className="why-icon mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-bold text-midnight_text dark:text-white">
                  {reason.title}
                </h3>
                <p className="mt-3 leading-7 text-gray">{reason.description}</p>
              </article>
            </div>
          ))}
        </div>

        <a
          href="#surveyAnchor"
          className="why-animate mt-10 inline-flex rounded-lg bg-primary px-6 py-3 text-lg font-medium text-white transition-colors hover:bg-[#207138]"
        >
          Làm khảo sát 3 phút
        </a>
      </div>
    </section>
  );
}
