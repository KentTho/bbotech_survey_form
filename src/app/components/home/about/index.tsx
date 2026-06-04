import Image from "next/image";
import Link from "next/link";
import { getImgPath } from "@/utils/pathUtils";

const tags = ["AI", "Automation", "TaaS"];

export default function About() {
  return (
    <section
      id="about-anchor"
      className="relative scroll-mt-24 overflow-hidden bg-white pt-10 pb-16 dark:bg-darkmode lg:pt-16 lg:pb-24"
    >
      <div className="pointer-events-none absolute right-0 top-12 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="container relative z-10 mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="bbo-glass overflow-hidden rounded-[28px] p-4 dark:bbo-glass-dark sm:p-6 lg:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-12">
            <div className="flex min-h-60 items-center justify-center rounded-[24px] border border-primary/10 bg-white/80 p-8 shadow-inner dark:bg-white/5">
              <Image
                src={getImgPath("/images/logo/logo.png")}
                alt="BBOTech"
                width={300}
                height={98}
                className="h-auto w-full max-w-[280px] object-contain"
              />
            </div>

            <div>
              <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur dark:bg-white/10">
                Về chúng tôi
              </p>
              <h2 className="text-midnight_text dark:text-white">
                BBOTech là ai?
              </h2>
              <p className="mt-5 text-lg leading-8 text-gray">
                BBOTech cung cấp giải pháp công nghệ ứng dụng AI, Automation và
                TaaS, đóng vai trò như một phòng IT linh hoạt cho doanh nghiệp
                nhỏ.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-sm font-semibold text-midnight_text shadow-sm backdrop-blur dark:bg-white/10 dark:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["AI ứng dụng", "Automation", "Đội ngũ linh hoạt"].map(
                  (item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-primary/10 bg-white/65 p-4 text-sm font-semibold text-midnight_text backdrop-blur dark:bg-white/5 dark:text-white"
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>

              <Link
                href="#surveyAnchor"
                className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-base font-semibold text-white shadow-[0_16px_38px_rgba(41,141,67,0.24)] transition-all hover:-translate-y-0.5 hover:bg-[#207138]"
              >
                Tìm hiểu BBOTech
              </Link>
            </div>
          </div>
        </div>

        <div className="bbo-glass mt-6 flex gap-4 rounded-[24px] p-5 dark:bbo-glass-dark sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
            <svg
              aria-hidden="true"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3 5 6v5c0 4.42 2.99 8.54 7 10 4.01-1.46 7-5.58 7-10V6l-7-3Zm-3 9 2 2 4-4"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-xl font-bold text-midnight_text dark:text-white">
              Thông tin của bạn được dùng để tổng hợp nghiên cứu
            </h3>
            <p className="mt-2 leading-7 text-gray">
              Dữ liệu khảo sát được dùng cho mục đích phân tích nhu cầu thị
              trường và liên hệ tư vấn chỉ khi người tham gia đồng ý. Bạn xác
              nhận đồng ý ngay ở bước cuối khảo sát.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
