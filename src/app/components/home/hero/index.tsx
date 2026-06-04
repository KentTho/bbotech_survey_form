"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext } from 'react';
import { PropertyContext } from "@/context-api/PropertyContext";
import { getImgPath, getDataPath } from "@/utils/pathUtils";

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
    <section className="bbo-ambient dark:bbo-ambient-dark relative overflow-hidden pt-36 pb-14 dark:bg-darklight lg:pt-44 lg:pb-10">
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-20 h-80 w-80 rounded-full bg-[#8DC73F]/15 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 md:max-w-screen-md lg:max-w-screen-xl">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div
            className="bbo-fade-up col-span-6 flex flex-col items-start justify-center"
            data-aos="fade-right"
          >
            <div className="mb-8">
              <p className="mb-4 inline-flex rounded-full border border-primary/20 bg-white/75 px-4 py-2 text-sm font-semibold text-primary shadow-sm backdrop-blur dark:bg-white/10">
                BBOTech · Nghiên cứu thị trường khách sạn
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-[1.08] text-midnight_text dark:text-white md:text-[58px]">
                KHẢO SÁT NHU CẦU{" "}
                <span className="bg-gradient-to-r from-primary to-[#6abf4b] bg-clip-text text-transparent">
                  CHUYỂN ĐỔI SỐ
                </span>{" "}
                KHÁCH SẠN
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray dark:text-white/80">
                BBOTech đang thực hiện khảo sát ngắn để tìm hiểu khó khăn thực
                tế trong vận hành, đặt phòng, chăm sóc khách hàng và marketing
                của khách sạn vừa và nhỏ.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <a
                href="#surveyAnchor"
                className="inline-flex rounded-full bg-primary px-7 py-3.5 text-base font-semibold text-white shadow-[0_18px_44px_rgba(41,141,67,0.28)] transition-all hover:-translate-y-0.5 hover:bg-[#207138]"
              >
                Bắt đầu khảo sát
              </a>
              <a
                href="#why-anchor"
                className="inline-flex rounded-full border border-primary/20 bg-white/70 px-7 py-3.5 text-base font-semibold text-primary backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white dark:bg-white/10"
              >
                Xem lý do tham gia
              </a>
            </div>

            <div className="mt-8 grid w-full max-w-xl grid-cols-1 gap-3 sm:grid-cols-3">
              {["3–5 phút", "2 nhóm trả lời", "Dùng cho nghiên cứu"].map(
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
          <div className="relative col-span-6 hidden min-h-[520px] lg:block">
            <div className="bbo-glass bbo-lift absolute right-0 top-8 w-[520px] rounded-[32px] p-5 dark:bbo-glass-dark">
              <div className="rounded-[24px] bg-gradient-to-br from-primary/10 to-[#8DC73F]/10 p-4">
                <Image
                  src={getImgPath("/images/hero/hero-image.png")}
                  alt="BBOTech survey visual"
                  width={760}
                  height={520}
                  style={{ width: "100%", height: "auto" }}
                  priority
                />
              </div>
            </div>
            <div className="bbo-glass absolute bottom-10 left-2 w-64 rounded-2xl p-5 dark:bbo-glass-dark">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                Insight nhanh
              </p>
              <p className="mt-2 text-lg font-bold text-midnight_text dark:text-white">
                Hiểu đúng nhu cầu trước khi xây giải pháp
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
