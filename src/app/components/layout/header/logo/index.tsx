import Image from 'next/image';
import Link from 'next/link';
import { getImgPath } from '@/utils/pathUtils';

const Logo: React.FC = () => {

  return (
    <Link href="/" aria-label="BBOTech" className="flex shrink-0 items-center">
      <Image
        src={getImgPath("/images/logo/logo.png")}
        alt="BBOTech"
        width={220}
        height={72}
        quality={100}
        className='h-10 w-auto max-w-[160px] object-contain sm:max-w-[190px] lg:h-16 lg:max-w-[220px] dark:hidden'
      />
      <Image
        src={getImgPath("/images/logo/logo-white.png")}
        alt="BBOTech"
        width={220}
        height={72}
        quality={100}
        className='hidden h-10 w-auto max-w-[160px] object-contain sm:max-w-[190px] lg:h-16 lg:max-w-[220px] dark:block'
      />
    </Link>
  );
};

export default Logo;
