import React from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trees, Sparkles } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Interior E-commerce",
    description:
      "Shop premium furniture, décor, and design accessories — all in one place.",
    icon: <ShoppingBag className="w-10 h-10 text-purple-400" />,
    link: "/ecommerce/b2c",
    buttonText: "Start Shopping",
  },
  {
    id: 2,
    title: "Landscaping Solutions",
    description:
      "Plan and execute beautiful outdoor spaces with expert design and AI-guided tools.",
    icon: <Trees className="w-10 h-10 text-green-400" />,
    link: "/landscaping",
    buttonText: "Explore Landscaping",
  },
  {
    id: 3,
    title: "AI Interior",
    description:
      "Redesign any room instantly using advanced AI visualization tools.",
    icon: <Sparkles className="w-10 h-10 text-yellow-400" />,
    link: "/aiInterior",
    buttonText: "Try AI Design",
  },
];

const Moduleboat = () => {
  return (
    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 sm:gap-6 justify-center items-center mt-4 lg:mt-0 px-4 py-2">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="w-full sm:w-80 lg:w-full xl:w-64 
          h-[350px]  /* Increased Card Height */
          flex flex-col justify-between
          p-4 sm:p-6 rounded-2xl bg-white/10 backdrop-blur-md shadow-xl 
          hover:bg-white/20 transition-all duration-300 text-white border border-white/20"
        >
          <div>
            <div className="text-3xl sm:text-4xl mb-3">{feature.icon}</div>

            <h3 className="text-xl sm:text-2xl font-semibold mb-2">
              {feature.title}
            </h3>

            <p className="text-xs sm:text-sm opacity-90">
              {feature.description}
            </p>
          </div>

          <Link
            to={feature.link}
            className="mt-4 sm:mt-5 inline-block bg-white text-[var(--color-text-dark)] font-semibold px-4 py-2 sm:px-5 sm:py-2 rounded-md hover:bg-[var(--color-hoverbtn)] hover:text-white transition text-center text-sm sm:text-base"
          >
            {feature.buttonText}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default Moduleboat;
