import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";

import wave1 from "../../assets/img/wave/waveint2.png";
import hardScape from "../../assets/img/landscap/hardscape.png";
import other from "../../assets/img/landscap/other.png";
import softScape from "../../assets/img/landscap/softscape.png";
import swimming from "../../assets/img/landscap/swimming.png";

const Servicelandspacing = () => {
  const { t } = useTranslation("scape2");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsPerSlide, setCardsPerSlide] = useState(2);
  const [activeBtn, setActiveBtn] = useState(0);

 const services = [
  {
    title: "services.hardscape.title",
    icon: <img src={hardScape} alt="Hardscape" />,
    items: [
      "services.hardscape.items.0",
      "services.hardscape.items.1",
      "services.hardscape.items.2",
      "services.hardscape.items.3",
      "services.hardscape.items.4",
      "services.hardscape.items.5"
    ],
  },
  {
    title: "services.softscape.title",
    icon: <img src={softScape} alt="Softscape" />,
    items: [
      "services.softscape.items.0",
      "services.softscape.items.1",
      "services.softscape.items.2",
      "services.softscape.items.3",
      "services.softscape.items.4",
      "services.softscape.items.5"
    ],
  },
  {
    title: "services.pool.title",
    icon: <img src={swimming} alt="Swimming Pools" />,
    items: [
      "services.pool.items.0",
      "services.pool.items.1"
    ],
  },
  {
    title: "services.other.title",
    icon: <img src={other} alt="Other Solutions" />,
    items: [
      "services.other.items.0",
      "services.other.items.1",
      "services.other.items.2",
      "services.other.items.3",
      "services.other.items.4",
      "services.other.items.5",
      "services.other.items.6"
    ],
  },
];


  /* Responsive cards per slide */
  useEffect(() => {
    const updateCards = () => {
      setCardsPerSlide(window.innerWidth < 768 ? 1 : 2);
    };
    updateCards();
    window.addEventListener("resize", updateCards);
    return () => window.removeEventListener("resize", updateCards);
  }, []);

  const totalSlides = Math.ceil(services.length / cardsPerSlide);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % totalSlides);
  const prevSlide = () =>
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);

  return (
    <section className="relative bg-[var(--color-body)] overflow-hidden px-3 py-10 md:px-10 md:py-16">
      {/* Wave */}
      <div className="absolute bottom-[-50px] left-0 w-full z-0 overflow-hidden">
        <img
          src={wave1}
          alt="Wave"
          className="w-full scale-[1.6] md:scale-100 pointer-events-none"
        />
      </div>

      <div className="relative z-10 container mx-auto mt-4">
        <h2 className="text-center heading-dark-1 text-black">
          {t("heading")}
        </h2>

        {/* Slider */}
        <div className="relative overflow-hidden pt-10 md:pt-12 mt-5">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * (100 / totalSlides)}%)`,
              width: `${totalSlides * 100}%`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className="flex gap-4 md:gap-8"
                style={{ flex: `0 0 ${100 / totalSlides}%` }}
              >
                {services
                  .slice(
                    slideIndex * cardsPerSlide,
                    (slideIndex + 1) * cardsPerSlide
                  )
                  .map((service, idx) => (
                    <div
                      key={idx}
                      className="relative flex-1 bg-white rounded-2xl p-6 md:p-8 shadow-lg min-h-[320px] md:min-h-[400px]"
                    >
                      <div className="absolute -top-8 left-5 w-20 h-20 md:w-24 md:h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center shadow-xl">
                        {service.icon}
                      </div>

                      <div className="mt-16 md:mt-20">
                        <h3 className="text-xl md:text-3xl font-bold text-black mb-4 md:mb-6">
                          {t(service.title)}
                        </h3>

                        <ul className="space-y-2 md:space-y-3 text-gray-700 text-sm md:text-lg">
                          {service.items.map((item, i) => (
                            <li key={i} className="flex">
                              <span
                                className="mr-2 md:mr-3 font-bold text-white flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full"
                                style={{
                                  background:
                                    "linear-gradient(to right, #03A4F4 0%, #64EF0A 100%)",
                                }}
                              >
                                ✓
                              </span>
                              {t(item)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* Navigation (UNCHANGED) */}
    <div className="flex justify-center items-center mt-8 md:mt-12 gap-6">
  {/* LEFT BUTTON */}
  <button
    onClick={() => {
      prevSlide();
      setActiveBtn("left");
    }}
    onMouseLeave={() => setActiveBtn(null)}
    className={`w-12 h-12 rounded-md flex items-center justify-center transition
      ${
        activeBtn === "left"
          ? "bg-[var(--color-primary)] text-white border border-transparent"
          : "bg-white text-black border border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
      }`}
  >
    <ChevronLeft className="w-6 h-6" />
  </button>

  {/* RIGHT BUTTON */}
  <button
    onClick={() => {
      nextSlide();
      setActiveBtn("right");
    }}
    onMouseLeave={() => setActiveBtn(null)}
    className={`w-12 h-12 rounded-md flex items-center justify-center transition
      ${
        activeBtn === "right"
          ? "bg-[var(--color-primary)] text-white border border-transparent"
          : "bg-white text-black border border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
      }`}
  >
    <ChevronRight className="w-6 h-6" />
  </button>
</div>



        </div>
      </div>
    </section>
  );
};

export default Servicelandspacing;
