import { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import bgTestimonial from "../../assets/img/bgimage.png";

export default function TestimonialsSection() {
  const { t } = useTranslation("buy6");
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;

    const cardWidth =
      scrollContainerRef.current.firstChild?.offsetWidth || 320;

    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -(cardWidth + 24) : cardWidth + 24,
      behavior: "smooth",
    });
  };

  const testimonials = t("items", { returnObjects: true });

  return (
    <section
      className="relative overflow-hidden bg-cover bg-center bg-no-repeat py-20 px-4 sm:px-8 lg:px-16"
      style={{ backgroundImage: `url(${bgTestimonial})` }}
    >
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* ================= Heading ================= */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl text-center mb-12 text-white font-bold">
          {t("heading")}
        </h2>

        {/* ================= Cards ================= */}
        <div className="relative w-full">
          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory py-4"
          >
            {testimonials.map((item, index) => (
              <div
                key={index}
                className="flex-none w-64 sm:w-72 md:w-80 snap-center"
              >
                <div
                  className="h-full min-h-[520px] bg-white rounded-3xl shadow-xl p-8
                  flex flex-col items-center text-center
                  transition-transform duration-300 hover:scale-[1.03]"
                >
                  {/* Avatar */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-full object-cover ring-4 ring-purple-100 mb-4"
                  />

                  {/* Title (Fixed Height) */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 h-[48px] flex items-center justify-center">
                    {t(item.title)}
                  </h3>

                  {/* Description (Flexible Height) */}
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 flex-grow">
                    {item.text}
                  </p>

                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < 4
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Gradient Divider */}
                  <div className="flex justify-center mb-4">
                    <div className="h-[4px] w-[213px] rounded-full bg-gradient-to-r from-[#03A4F4] to-[#64EF0A]" />
                  </div>

                  {/* Footer (Always Bottom) */}
                  <div className="pt-2 w-full">
                    <p className="font-semibold text-gray-900">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================= Navigation ================= */}
        <div className="flex justify-center gap-3 mt-10">
          <button
            onClick={() => scroll("left")}
            className="p-3 rounded-sm bg-white transition
            hover:bg-[var(--color-primary)] hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="p-3 rounded-sm bg-white transition
            hover:bg-[var(--color-primary)] hover:text-white"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
