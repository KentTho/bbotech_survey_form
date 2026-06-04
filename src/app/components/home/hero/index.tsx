"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from 'react';
import { PropertyContext } from "@/context-api/PropertyContext";
import { getImgPath, getDataPath } from "@/utils/pathUtils";

const heroMascotSrc = getImgPath("/images/hero/hero-image-mascot.png");

const Hero = () => {
  const router = useRouter();
  const [propertiesData, setPropertiesData] = useState<any[]>([])
  const { properties, updateFilter } = useContext(PropertyContext)!;
  const [activeTab, setActiveTab] = useState("sell");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [location, setLocation] = useState("");
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(getDataPath('/data/propertydata.json'))
        if (!res.ok) throw new Error('Failed to fetch')

        const data = await res.json()
        setPropertiesData(data || [])
      } catch (error) {
        console.error('Error loading properties:', error)
      }
    }

    fetchData()
  }, [])

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  const handleSearchSell = () => {
    if (location.trim() === '') {
      setError('Please enter a location to search.');
      return;
    }
    setError('');
    updateFilter('location', location);
    updateFilter('tag', 'sell');
    router.push(`/properties/properties-list`);
  };

  const handleSearchBuy = () => {
    if (location.trim() === '') {
      setError('Please enter a location to search.');
      return;
    }
    setError('');
    updateFilter('location', location);
    updateFilter('tag', 'Buy');
    router.push(`/properties/properties-list`);
  };

  const suggestions = Array.from(new Set(propertiesData.map((item) => item.location)));

  const handleSelect = (value: any) => {
    setLocation(value);
    setShowSuggestions(false);
  };

  return (
    <section className="bbo-ambient dark:bbo-ambient-dark relative overflow-hidden pt-32 pb-14 dark:bg-darklight sm:pt-36 lg:pt-44 lg:pb-10">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-[#8DC73F]/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div
            className="bbo-fade-up col-span-6 flex min-w-0 flex-col items-start justify-center"
            data-aos="fade-right"
          >
            <div className="mb-8">
              <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-white/75 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-white/10">
                AI TRAVEL INSIGHT
              </p>
              <h1 className="max-w-[660px] text-[clamp(2.35rem,10vw,3.1rem)] font-bold leading-[1.14] tracking-[-0.015em] text-midnight_text dark:text-white sm:text-[clamp(2.75rem,6.5vw,3.8rem)] lg:text-[clamp(3rem,4.4vw,4.2rem)]">
                <span className="block">
                  Bạn dùng{" "}
                  <span className="bg-gradient-to-r from-primary to-[#6abf4b] bg-clip-text text-transparent">
                    AI
                  </span>{" "}
                  để
                </span>
                <span className="block">tìm khách sạn</span>
                <span className="block">như thế nào?</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray dark:text-white/80">
                Chúng tôi đang tìm hiểu cách người dùng dùng AI để lên kế
                hoạch du lịch, so sánh khách sạn và chọn nơi lưu trú phù hợp
                hơn.
              </p>
            </div>

            <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <a
                href="#surveyAnchor"
                className="inline-flex w-full justify-center rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_44px_rgba(41,141,67,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#207138] sm:w-auto"
              >
                Làm khảo sát ngay
              </a>
              <a
                href="#why-anchor"
                className="inline-flex w-full justify-center rounded-full border border-primary/20 bg-white/70 px-7 py-3.5 text-base font-semibold text-primary backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white dark:bg-white/10 sm:w-auto"
              >
                Tìm hiểu mục tiêu
              </a>
            </div>

            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {["Gợi ý phù hợp", "Tiết kiệm thời gian", "Quyết định tự tin"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-primary/15 bg-white/70 px-4 py-3 text-sm font-semibold text-midnight_text shadow-sm backdrop-blur dark:bg-white/10 dark:text-white"
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
          <div className="bbo-fade-up relative col-span-6 min-w-0 lg:min-h-[520px]">
            <div className="bbo-glass bbo-lift relative mx-auto w-full max-w-[640px] rounded-[28px] p-2 dark:bbo-glass-dark sm:p-4 lg:absolute lg:right-0 lg:top-8">
              <div className="overflow-hidden rounded-[22px] border border-primary/10 bg-white/75 p-1 sm:p-2">
                <Image
                  src={heroMascotSrc}
                  alt="BBOTech mascot survey assistant"
                  width={1672}
                  height={941}
                  className="h-auto max-h-[320px] w-full object-contain sm:max-h-[380px] lg:max-h-none"
                  priority
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 720px, 640px"
                />
              </div>
            </div>
            <div className="bbo-glass relative mx-auto mt-4 w-full max-w-sm rounded-2xl p-4 dark:bbo-glass-dark sm:p-5 lg:absolute lg:bottom-10 lg:left-2 lg:mx-0 lg:mt-0 lg:w-64">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Hành trình AI
              </p>
              <p className="mt-2 text-lg font-bold text-midnight_text dark:text-white">
                Hỏi AI, so sánh nhanh, chọn khách sạn phù hợp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
