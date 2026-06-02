import Image from "next/image";
import Link from "next/link";
import { getImgPath } from "@/utils/pathUtils";

const tags = ["AI", "Automation", "TaaS"];

export default function About() {
  return (
    <section
      id="about-anchor"
      className="scroll-mt-24 bg-white dark:bg-darkmode"
    >
      <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="overflow-hidden rounded-lg border border-border bg-herobg shadow-property dark:border-dark_border dark:bg-semidark">
          <div className="grid items-center gap-8 p-6 sm:p-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12 lg:p-12">
            <div className="flex min-h-56 items-center justify-center rounded-lg border border-border bg-white p-8 dark:border-dark_border">
              <Image
                src={getImgPath("/images/logo/logo.png")}
                alt="BBOTech"
                width={300}
                height={98}
                className="h-auto w-full max-w-[280px] object-contain"
              />
            </div>

            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
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
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-midnight_text dark:border-dark_border dark:bg-darkmode dark:text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                href="#surveyAnchor"
                className="mt-8 inline-flex rounded-lg bg-primary px-6 py-3 text-base font-medium text-white transition-colors hover:bg-[#207138]"
              >
                Tìm hiểu BBOTech
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-4 rounded-lg border border-border bg-section p-5 dark:border-dark_border dark:bg-semidark sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
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
