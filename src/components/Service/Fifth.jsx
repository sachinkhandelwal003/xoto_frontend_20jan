import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useTranslation } from "react-i18next";
import image from "../../assets/img/wave/wave2.png";

export default function TestimonialsSection() {
  const { t } = useTranslation("interior6");
  const scrollRef = useRef(null);
  const [activeBtn, setActiveBtn] = useState(0);

  // ✅ ALL CARDS (none removed)
const testimonials = [
  {
    title: "cards.title1",
    text: "cards.text",
    name: "names.shubham",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title1",
    text: "cards.text",
    name: "names.punit",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title2",
    text: "cards.text",
    name: "names.harsh",
    location: "locations.bangalore",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title1",
    text: "cards.text",
    name: "names.shubham",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title3",
    text: "cards.text",
    name: "names.jaiMathur",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title3",
    text: "cards.text",
    name: "names.madhur",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title3",
    text: "cards.text",
    name: "names.avn",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  },
  {
    title: "cards.title3",
    text: "cards.text",
    name: "names.sam",
    location: "locations.pune",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
  }
];


  const slide = (dir) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.firstChild.offsetWidth + 24; // gap
    scrollRef.current.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 w-full flex flex-col items-center pt-12 md:pt-16">
      <div className="relative w-full z-10 px-4 sm:px-10 md:px-20">

        {/* HEADING */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-center card-heading-1">
          {t("heading")}
        </h2>

        {/* SCROLL AREA */}
        <div className="mt-5 relative flex items-center">
          <div
            ref={scrollRef}
            className="flex overflow-x-scroll gap-4 sm:gap-6 snap-x snap-mandatory scroll-smooth w-full scrollbar-hide"
          >
            {testimonials.map((item, i) => (
              <div
                key={i}
                className="
                  snap-start
                  bg-white
                  flex-none
                  w-[260px] sm:w-[300px] md:w-[320px]   /* ✅ FIXED WIDTH */
                  min-h-[380px]                         /* ✅ FIXED HEIGHT */
                  rounded-2xl
                  p-6
                  text-center
                  shadow-[0_4px_15px_rgba(92,3,155,0.2)]
                  hover:shadow-[0_8px_25px_rgba(92,3,155,0.3)]
                  hover:-translate-y-2
                  transition-transform
                "
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-full mx-auto mb-4"
                />

                <h3 className="font-semibold text-gray-900">
                  {t(item.title)}
                </h3>

                <p className="text-sm text-[#547593] mt-2 leading-relaxed">
                  {t(item.text)}
                </p>

                <div className="flex justify-center gap-1 my-3">
                  {[...Array(5)].map((_, j) => (
                    <Star
                      key={j}
                      className={`w-4 h-4 ${
                        j < 4
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                  
                 <div className="flex justify-center py-3 mt-1 mb-4">
  <div className="h-[4px] w-[213px] rounded-full bg-gradient-to-r from-[#03A4F4] to-[#64EF0A]" />
</div>



                <p className="font-medium text-gray-900">{t(item.name)}</p>
                <p className="text-sm text-gray-500">{t(item.location)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTONS – UNCHANGED */}
       <div className="flex justify-center gap-3 sm:gap-6 mt-6 sm:mt-8 md:mt-12 mb-4 z-10 relative">
  <button
    onClick={() => {
      slide(-1);
      setActiveBtn("left");
    }}
    onMouseLeave={() => setActiveBtn(null)}
    className={`p-3 rounded-sm border transition
      ${
        activeBtn === "left"
          ? "bg-[var(--color-primary)] text-white border-transparent"
          : "bg-white border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
      }`}
  >
    <ChevronLeft className="w-5 sm:w-7 h-5 sm:h-7" />
  </button>

  <button
    onClick={() => {
      slide(1);
      setActiveBtn("right");
    }}
    onMouseLeave={() => setActiveBtn(null)}
    className={`p-3 rounded-sm border transition
      ${
        activeBtn === "right"
          ? "bg-[var(--color-primary)] text-white border-transparent"
          : "bg-white border-gray-300 hover:bg-[var(--color-primary)] hover:text-white"
      }`}
  >
    <ChevronRight className="w-5 sm:w-7 h-5 sm:h-7" />
  </button>
</div>

      </div>
    {/* WAVE */}
      <div className="absolute left-0 w-full z-0 -bottom-110">
        <img src={image} alt="wave-bg" className="w-full object-cover" />
      </div>
    </section>
  );
}