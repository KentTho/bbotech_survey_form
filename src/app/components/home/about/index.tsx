import Image from "next/image";
import Link from "next/link";
import { getImgPath } from "@/utils/pathUtils";

const tags = ["AI ứng dụng", "Automation", "TaaS"];

const checklist = [
  "Tối ưu vận hành",
  "Tự động hoá quy trình",
  "Tăng tốc phản hồi khách hàng",
];

const workflowCards = [
  {
    title: "Lắng nghe",
    description: "Thu thập nhu cầu thực tế từ khách sạn và khách đặt phòng.",
  },
  {
    title: "Phân tích",
    description: "Tìm điểm nghẽn trong vận hành, phản hồi và chăm sóc khách.",
  },
  {
    title: "Đề xuất",
    description: "Xây giải pháp AI, Automation và TaaS vừa đủ cho đội ngũ nhỏ.",
  },
];

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function About() {
  return (
    <section
      id="about-anchor"
      className="relative scroll-mt-24 overflow-hidden bg-white pt-10 pb-16 dark:bg-darkmode lg:pt-16 lg:pb-24"
    >
      <div className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-12 h-80 w-80 rounded-full bg-primary/12 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="bbo-glass overflow-hidden rounded-[24px] p-4 dark:bbo-glass-dark sm:rounded-[32px] sm:p-6 lg:p-8">
          <div className="grid items-center gap-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-10">
            <div className="min-w-0">
              <p className="mb-3 inline-flex rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary backdrop-blur dark:bg-white/10">
                Về chúng tôi
              </p>
              <h2 className="max-w-2xl text-primary">
                BBOTech là ai?
              </h2>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-primary/80">
                BBOTech cung cấp giải pháp công nghệ ứng dụng AI, Automation và
                TaaS, đóng vai trò như một phòng IT linh hoạt cho doanh nghiệp
                nhỏ.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-primary/15 bg-white/75 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-white/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {checklist.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm font-semibold text-primary backdrop-blur dark:bg-white/5"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                      <CheckIcon />
                    </span>
                    {item}
                  </div>
                ))}
              </div>

              <Link
                href="#surveyAnchor"
                className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-base font-semibold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Tìm hiểu BBOTech
              </Link>
            </div>

            <div className="relative min-w-0">
              <div className="pointer-events-none absolute inset-8 rounded-full bg-primary/15 blur-3xl" />
              <div className="relative overflow-hidden rounded-[24px] border border-primary/15 bg-primary p-4 shadow-xl shadow-primary/20 sm:rounded-[28px] sm:p-5">
                <div className="rounded-[20px] border border-white/10 bg-white/[0.08] p-4 backdrop-blur sm:rounded-[22px] sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                    <Image
                      src={getImgPath("/images/logo/logo-white.png")}
                      alt="BBOTech"
                      width={220}
                      height={72}
                      quality={100}
                      className="h-10 w-auto max-w-[145px] object-contain sm:h-12 sm:max-w-[180px]"
                    />
                    <span className="rounded-full border border-white/30 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Workflow
                    </span>
                  </div>

                  <div className="mt-6 space-y-3">
                    {workflowCards.map((card, index) => (
                      <article
                        key={card.title}
                        className="rounded-2xl border border-primary/10 bg-white p-4 text-primary shadow-sm backdrop-blur"
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                            {index + 1}
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-primary">
                              {card.title}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-primary/75">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bbo-glass mt-6 flex flex-col gap-4 rounded-[24px] p-5 dark:bbo-glass-dark sm:flex-row sm:p-6">
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
            <h3 className="text-xl font-bold text-primary">
              Thông tin của bạn được dùng để tổng hợp nghiên cứu
            </h3>
            <p className="mt-2 leading-7 text-primary/80">
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
