import React from "react";
import { useTranslation } from "react-i18next";

// --- IMPORT IMAGES ---
import newWaveBg from "../../assets/img/wave/wavenew.png";
import newicon1 from "../../assets/img/icons123/newicon1.png";
import newicon2 from "../../assets/img/icons123/newicon2.png";
import newicon3 from "../../assets/img/icons123/newicon3.png";
import newicon4 from "../../assets/img/icons123/newicon4.png";
import newicon5 from "../../assets/img/icons123/newicon5.png";
import tickimg from "../../assets/img/icons123/tickimage.png";

const Seventh = () => {
  const { t } = useTranslation("mort7");

  // CRASH-PROOF HELPER: Yeh ensure karega ki features hamesha array hi rahein
  const getFeatures = (key, defaultFeatures) => {
    const translated = t(key, { returnObjects: true });
    return Array.isArray(translated) ? translated : defaultFeatures;
  };

  const portfolioData = [
    {
      title: t("cards.residential.title", "Residential\nMortgage Solutions"),
      icon: <img src={newicon1} alt="Residential Icon" className="w-9 h-9 object-contain" />,
      features: getFeatures("cards.residential.features", [
        "Home Purchase Loans",
        "Off-Plan & Ready Property Financing",
        "Non-Resident Mortgages",
        "Construction & Home Building Finance",
      ]),
    },
    {
      title: t("cards.commercial.title", "Commercial\nMortgage Solutions"),
      icon: <img src={newicon2} alt="Commercial Icon" className="w-9 h-9 object-contain" />,
      features: getFeatures("cards.commercial.features", [
        "Office & Retail Financing",
        "Hotel & Hospitality Finance",
        "Commercial Refinance",
      ]),
    },
    {
      title: t("cards.equity.title", "Pure Equity"),
      icon: <img src={newicon3} alt="Equity Icon" className="w-9 h-9 object-contain" />,
      features: getFeatures("cards.equity.features", [
        "Loan against property"
      ]),
    },
    {
      title: t("cards.buyout.title", "Buyout (Refinance)"),
      icon: <img src={newicon4} alt="Buyout Icon" className="w-9 h-9 object-contain" />,
      features: getFeatures("cards.buyout.features", [
        "Mortgage Refinancing",
        "Buyout of existing mortgage",
        "Equity release",
        "Top-Up Loans"
      ]),
    },
    {
      title: t("cards.buyoutEquity.title", "Buyout + Equity"),
      icon: <img src={newicon5} alt="Buyout Equity Icon" className="w-9 h-9 object-contain" />,
      features: getFeatures("cards.buyoutEquity.features", [
        "Debt consolidation Against Property"
      ]),
    }
  ];

  return (
    // dir="ltr" fix kar diya hai taaki kisi bhi language mein layout flip na ho
    <section 
      dir="ltr" 
      className="relative w-full py-30 bg-[var(--color-body)] overflow-hidden font-sans text-left"
    >
      
      {/* Background Waves */}
      <div className="absolute bottom-0 left-0 w-full z-0 opacity-80 pointer-events-none flex items-end translate-y-[40%] sm:translate-y-[50%] lg:translate-y-[60%]">
        <img 
          src={newWaveBg} 
          alt="background wave" 
          className="w-full object-cover" 
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <h2 
          className="text-center text-gray-900 mb-20 font-semibold text-[40px] leading-tight md:text-[60px] md:leading-[48px] tracking-[-0.03em]"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {t("heading", "Our Mortgage Product Portfolio")}
        </h2>

        {/* FIX 1: items-stretch add kiya (Height barabar karne ke liye)
            FIX 2: gap-y-12 add kiya (Taaki icon upar wale card mein na ghuse) 
        */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-12 lg:gap-y-4 xl:gap-6 mt-12 items-stretch">
          {portfolioData.map((item, index) => (
            <div 
              key={index}
              /* FIX 3: h-full add kiya and pt-10 ko pt-14 kiya taaki text aur icon me space aaye */
              className="relative bg-white rounded-2xl p-6 pt-14 shadow-[0_4px_25px_rgb(0,0,0,0.05)] border border-gray-100 flex flex-col h-full hover:-translate-y-1 transition-transform duration-300"
            >
              
              {/* Overlapping Icon Container */}
              <div className="absolute -top-6 left-6 w-14 h-14 bg-[#5C039B] rounded-full flex items-center justify-center shadow-lg  ">
                {item.icon}
              </div>

              {/* Card Title */}
              <h3 className="text-[17px] font-bold text-gray-900 mb-5 leading-tight whitespace-pre-line flex-shrink-0">
                {item.title}
              </h3>

              {/* FIX 4: flex-grow add kiya jisse list poori empty height cover kar le */}
              <ul className="space-y-3 flex-grow">
                {item.features && item.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <img 
                        src={tickimg} 
                        alt="tick" 
                        className="w-4 h-4 flex-shrink-0 mt-0.5" 
                    />
                    <span className="text-[14px] text-gray-500 font-medium leading-snug">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default Seventh;