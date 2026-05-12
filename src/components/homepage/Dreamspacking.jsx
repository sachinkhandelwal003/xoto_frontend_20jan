import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import image from "../../assets/img/wave/waveint2.png";
import { MapPin } from "lucide-react";

const projects = [
  {
    title: "projects.kitchen",
    location: "projects.kitchenLocation",
    img: "https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1200",
  },
  {
    title: "projects.penthouse",
    location: "projects.penthouseLocation",
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200",
  },
  {
    title: "projects.villa",
    location: "projects.villaLocation",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200",
  },
];

export default function DreamSpacesShowcase() {
  const { t } = useTranslation("interior5");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef(null);

  const next = () => setCurrentIndex((prev) => (prev + 1) % projects.length);

  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);

  useEffect(() => {
    if (isPaused) return;
    autoSlideRef.current = setInterval(next, 2000);
    return () => clearInterval(autoSlideRef.current);
  }, [isPaused]);

  const getIndex = (offset) =>
    (currentIndex + offset + projects.length) % projects.length;

  return (
    // FIX 1: pb-32 se pb-20 (padding bottom kam ki) taaki wave theek buttons ke paas aaye
    <div className="relative overflow-hidden pb-20 sm:pb-12 bg-[var(--color-body)]">
      
      {/* Wave */}
      <div className="absolute left-0 w-full z-0 pointer-events-none select-none bottom-0 sm:-bottom-0 md:-bottom-20">
        <img src={image} alt="wave-bg" className="w-full object-cover" />
      </div>

      <div className="mx-auto pt-12 relative z-10 px-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 px-6 lg:px-10 mb-10 sm:mb-16 text-center lg:text-left items-center lg:items-start w-full">
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl heading-dark-1 font-semibold text-black max-w-xl leading-snug">
            {t("showcase.title")} <br />
            <span className="text-3xl sm:text-4xl lg:text-5xl heading-dark-1 font-semibold text-black max-w-xl leading-snug">
              {t("showcase.subtitle")}
            </span>
          </h1>

          <p
            className="
              font-medium
              text-[16px] sm:text-[24px]
              leading-snug sm:leading-[33px]
              tracking-[0]
              text-[#547593]
              max-w-[567px]
              text-center lg:text-left
              lg:ml-auto
            "
          >
            {t("showcase.description")}
          </p>
        </div>

        {/* Slider */}
        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* FIX 2: Height 350px se 300px kardi, ab image aur dabba barabar hain */}
          <div className="relative flex justify-center items-center h-[300px] sm:h-[400px]">
            {/* Left */}
            <div className="hidden md:block absolute -left-[5%] w-[350px] opacity-70 overflow-hidden">
              <img
                src={projects[getIndex(-1)].img}
                alt={t(projects[getIndex(-1)].title)}
                className="h-64 w-full object-cover rounded-r-2xl"
              />
            </div>

            {/* Main */}
            <div className="absolute w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl z-30">
              <img
                src={projects[currentIndex].img}
                alt={t(projects[currentIndex].title)}
                className="h-[300px] sm:h-[400px] w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 p-4 sm:p-6">
                <h3
                  className="
                    font-semibold
                    text-[24px] sm:text-[40px]
                    leading-tight sm:leading-[36px]
                    tracking-[0px]
                    text-white
                    text-left
                  "
                >
                  {t(projects[currentIndex].title)}
                </h3>

                <p
                  className="
                    flex items-center gap-2
                    font-medium
                    text-[16px] sm:text-[24px]
                    leading-tight sm:leading-[23px]
                    text-white
                    mt-1 sm:mt-2
                    py-2 sm:py-4
                  "
                >
                  <MapPin size={16} className="text-white shrink-0" />
                  {t(projects[currentIndex].location)}
                </p>
              </div>
            </div>

            {/* Right */}
            <div className="hidden md:block absolute -right-[5%] w-[350px] opacity-70 overflow-hidden">
              <img
                src={projects[getIndex(1)].img}
                alt={t(projects[getIndex(1)].title)}
                className="h-64 w-full object-cover rounded-l-2xl"
              />
            </div>
          </div>

          {/* Controls */}
          {/* FIX 3: Buttons ka margin top kam kiya (mt-5) taaki image ke thoda paas rahein */}
          <div className="flex justify-center gap-4 mt-5 sm:mt-8">
            <button
              onClick={prev}
              className="
                p-2 sm:p-3
                border border-[#5C039B]/20
                rounded-md
                bg-white
                text-[#5C039B]
                shadow-sm
                transition-all duration-200
                hover:bg-[#5C039B]
                hover:text-white 
                hover:shadow-md
              "
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button
              onClick={next}
              className=" 
                p-2 sm:p-3
                border border-[#5C039B]/20
                rounded-md
                bg-white
                text-[#5C039B]
                shadow-sm
                transition-all duration-200
                hover:bg-[#5C039B]
                hover:text-white
                hover:shadow-md
              "
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}