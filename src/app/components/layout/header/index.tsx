"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import Logo from "./logo";

const navigationItems = [
  { label: "Lý do tham gia", href: "#why-anchor" },
  { label: "Đối tượng", href: "#aud-anchor" },
  { label: "Khảo sát", href: "#surveyAnchor" },
  { label: "BBOTech", href: "#about-anchor" },
];

const Header: React.FC = () => {
  const pathUrl = usePathname();
  const { theme, setTheme } = useTheme();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= 80);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        navbarOpen
      ) {
        setNavbarOpen(false);
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navbarOpen]);

  return (
    <header
      className={`fixed top-0 z-50 w-full px-3 transition-all duration-300 ${
        sticky
          ? "py-3"
          : "py-4"
      }`}
    >
      <div
        className={`container mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-3 rounded-2xl px-4 transition-all duration-300 lg:h-20 lg:px-6 ${
          sticky
            ? "bbo-glass dark:bbo-glass-dark"
            : "border border-transparent bg-white/70 shadow-none backdrop-blur-md dark:bg-darkmode/50"
        }`}
      >
        <Logo />

        <nav className="hidden flex-grow items-center justify-center gap-6 lg:flex xl:gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-midnight_text/80 transition-colors hover:bg-primary/10 hover:text-primary dark:text-white/85 dark:hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="#surveyAnchor"
            className="hidden whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(41,141,67,0.26)] transition-all hover:-translate-y-0.5 hover:bg-[#207138] lg:inline-flex"
          >
            Bắt đầu khảo sát
          </Link>

          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="block rounded-xl border border-primary/10 bg-white/70 p-2 shadow-sm backdrop-blur dark:bg-darkmode/70 lg:hidden"
            aria-label="Toggle mobile menu"
            aria-expanded={navbarOpen}
          >
            <span className="block h-0.5 w-6 bg-black dark:bg-white"></span>
            <span className="mt-1.5 block h-0.5 w-6 bg-black dark:bg-white"></span>
            <span className="mt-1.5 block h-0.5 w-6 bg-black dark:bg-white"></span>
          </button>
        </div>
      </div>

      {navbarOpen && (
        <div className="fixed inset-0 z-40 bg-midnight_text/40 backdrop-blur-sm lg:hidden" />
      )}

      <div
        ref={mobileMenuRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xs transform border-l border-primary/10 bg-white/90 shadow-2xl backdrop-blur-xl transition-transform duration-300 dark:bg-darkmode/95 lg:hidden ${
          navbarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-bold text-midnight_text dark:text-white">
            Menu
          </h2>
          <button
            onClick={() => setNavbarOpen(false)}
            aria-label="Close mobile menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="dark:text-white"
            >
              <path
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <nav className="flex flex-col items-start gap-1 p-4">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full rounded-xl px-3 py-2.5 font-semibold text-midnight_text transition-colors hover:bg-primary/10 hover:text-primary dark:text-white dark:hover:bg-semidark dark:hover:text-primary"
              onClick={() => setNavbarOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#surveyAnchor"
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white shadow-[0_14px_34px_rgba(41,141,67,0.24)] transition-colors hover:bg-[#207138]"
            onClick={() => setNavbarOpen(false)}
          >
            Bắt đầu khảo sát
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
