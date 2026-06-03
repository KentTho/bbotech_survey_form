const googleFormSrc =
  "https://docs.google.com/forms/d/e/1FAIpQLSczumsyaiA3Tfz2f1VhZ_NXbQ_KAv-5EoN5i2UKLM3Ft8ZSDg/viewform?embedded=true";

export default function SurveyFlow() {
  return (
    <section
      id="surveyAnchor"
      className="scroll-mt-24 bg-section dark:bg-darkmode"
    >
      <div className="container mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Khảo sát
          </p>
          <h2>Làm khảo sát 3–5 phút</h2>
          <p className="mt-5 text-lg leading-8 text-gray">
            Vui lòng hoàn thành biểu mẫu bên dưới. Câu trả lời sẽ được BBOTech
            dùng để tổng hợp nhu cầu thị trường.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-lg border border-border bg-white shadow-property dark:border-dark_border dark:bg-semidark">
          <iframe
            src={googleFormSrc}
            title="BBOTech hotel survey form"
            loading="lazy"
            className="block h-[1800px] w-full border-0 lg:h-[1600px]"
          />
        </div>

        <p className="mt-5 text-center text-sm leading-6 text-gray">
          Nếu biểu mẫu không hiển thị,{" "}
          <a
            href={googleFormSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            bấm vào đây để mở Google Form
          </a>
          .
        </p>
      </div>
    </section>
  );
}
