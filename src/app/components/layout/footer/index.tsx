import Image from 'next/image';
import { getImgPath } from '@/utils/pathUtils';

const Footer = () => {
  return (
    <footer className="relative z-10 bg-midnight_text dark:bg-semidark">
      <div className="container mx-auto flex max-w-screen-xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <Image
          src={getImgPath("/images/logo/logo.png")}
          alt="BBOTech"
          width={220}
          height={72}
          quality={100}
          className='h-12 w-auto max-w-[160px] object-contain sm:h-14 sm:max-w-[190px] lg:h-16 lg:max-w-[220px] dark:hidden'
        />
        <p className="text-sm leading-6 text-white/80 md:text-right">
          © 2026 BBOTech · Khảo sát khách sạn Vũng Tàu
        </p>
      </div>
    </footer>
  );
};

export default Footer;
