import Image from 'next/image';
import { getImgPath } from '@/utils/pathUtils';

const Footer = () => {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-white/10 bg-midnight_text dark:bg-semidark">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />

      <div className="container mx-auto flex max-w-screen-xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur">
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

        <p className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm leading-6 text-white/80 backdrop-blur md:text-right">
          © 2026 BBOTech · Khảo sát khách sạn
        </p>
      </div>
    </footer>
  );
};

export default Footer;
