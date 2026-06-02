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
      className={`fixed top-0 z-50 w-full transition-all ${
        sticky
          ? "bg-white shadow-lg dark:bg-semidark dark:shadow-darkmd"
          : "bg-transparent shadow-none"
      }`}
    >
      <div className="container mx-auto flex h-24 max-w-screen-xl items-center justify-between gap-3 px-4">
        <Logo />

        <nav className="hidden flex-grow items-center justify-center gap-6 lg:flex xl:gap-8">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap py-3 text-base font-normal text-midnight_text transition-colors hover:text-primary dark:text-white dark:hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {/* <button
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center text-body-color duration-300 dark:text-white"
          >
            <svg
              viewBox="0 0 16 16"
              className={`hidden h-6 w-6 dark:block ${
                !sticky && pathUrl === "/" ? "text-white" : ""
              }`}
            >
              <path
                d="M4.50663 3.2267L3.30663 2.03337L2.36663 2.97337L3.55996 4.1667L4.50663 3.2267ZM2.66663 7.00003H0.666626V8.33337H2.66663V7.00003ZM8.66663 0.366699H7.33329V2.33337H8.66663V0.366699V0.366699ZM13.6333 2.97337L12.6933 2.03337L11.5 3.2267L12.44 4.1667L13.6333 2.97337ZM11.4933 12.1067L12.6866 13.3067L13.6266 12.3667L12.4266 11.1734L11.4933 12.1067ZM13.3333 7.00003V8.33337H15.3333V7.00003H13.3333ZM7.99996 3.6667C5.79329 3.6667 3.99996 5.46003 3.99996 7.6667C3.99996 9.87337 5.79329 11.6667 7.99996 11.6667C10.2066 11.6667 12 9.87337 12 7.6667C12 5.46003 10.2066 3.6667 7.99996 3.6667ZM7.33329 14.9667H8.66663V13H7.33329V14.9667ZM2.36663 12.36L3.30663 13.3L4.49996 12.1L3.55996 11.16L2.36663 12.36Z"
                fill="#FFFFFF"
              />
            </svg>
            <svg
              viewBox="0 0 23 23"
              className={`h-8 w-8 text-dark dark:hidden ${
                !sticky && pathUrl === "/" ? "text-white" : ""
              }`}
            >
              <path d="M16.6111 15.855C17.591 15.1394 18.3151 14.1979 18.7723 13.1623C16.4824 13.4065 14.1342 12.4631 12.6795 10.4711C11.2248 8.47905 11.0409 5.95516 11.9705 3.84818C10.8449 3.9685 9.72768 4.37162 8.74781 5.08719C5.7759 7.25747 5.12529 11.4308 7.29558 14.4028C9.46586 17.3747 13.6392 18.0253 16.6111 15.855Z" />
            </svg>
          </button> */}

          <Link
            href="#surveyAnchor"
            className="hidden whitespace-nowrap rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#207138] lg:inline-flex"
          >
            Bắt đầu khảo sát
          </Link>

          <button
            onClick={() => setNavbarOpen(!navbarOpen)}
            className="block rounded-lg p-2 lg:hidden"
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
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden" />
      )}

      <div
        ref={mobileMenuRef}
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-xs transform bg-white shadow-lg transition-transform duration-300 dark:bg-darkmode lg:hidden ${
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
              className="w-full rounded-md px-3 py-2 text-midnight_text transition-colors hover:bg-section hover:text-primary dark:text-white dark:hover:bg-semidark dark:hover:text-primary"
              onClick={() => setNavbarOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="#surveyAnchor"
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-center font-medium text-white transition-colors hover:bg-[#207138]"
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
