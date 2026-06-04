import Image from 'next/image';
import { getImgPath } from '@/utils/pathUtils';

const Footer = () => {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-primary/20 bg-[#071f17] dark:bg-[#071f17]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#8DC73F]/70 to-transparent" />
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-[#8DC73F]/15 blur-3xl" />

      <div className="container mx-auto flex max-w-screen-xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-[#8DC73F]/30 bg-gradient-to-br from-[#0b3a29]/90 to-[#061811]/90 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.28)] backdrop-blur">
            <Image
              src={getImgPath("/images/logo/logo-white.png")}
              alt="BBOTech"
              width={220}
              height={72}
              quality={100}
              className='h-12 w-auto max-w-[160px] object-contain sm:h-14 sm:max-w-[190px] lg:h-16 lg:max-w-[220px]'
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              BBOTech
            </p>
            <p className="mt-1 text-sm text-white/70">
              AI · Automation · TaaS
            </p>
          </div>
        </div>

        <p className="rounded-full border border-[#8DC73F]/20 bg-white/[0.08] px-4 py-2 text-sm leading-6 text-white/85 backdrop-blur md:text-right">
          © 2026 BBOTech · Khảo sát khách sạn
        </p>
      </div>
    </footer>
  );
};

export default Footer;
