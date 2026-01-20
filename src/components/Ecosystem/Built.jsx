import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import realImage from "../../assets/img/real.png";

// Box background images
import lefttop from "../../assets/img/home/group/lefttop.png";
import leftbottom from "../../assets/img/home/group/leftbottom.png";
import righttop from "../../assets/img/home/group/righttop.png";
import rightbottom from "../../assets/img/home/group/rightbottom.png";

// ================= ANSWER RENDERER =================
const RenderAnswer = ({ answer }) => {
  if (Array.isArray(answer)) {
    return (
      <ul className="list-disc pl-3 md:pl-5 space-y-0.5 md:space-y-1">
        {answer.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p>{answer}</p>;
};

// ================= MAIN COMPONENT =================
const StakeholderSection = () => {
  const { t } = useTranslation("stakeholders");

  const tabs = [
    "businessAssociates",
    "executionPartner",
    "strategicAlliances",
    "developers",
    "financialInstitution",
  ];

  const [activeTab, setActiveTab] = useState("businessAssociates");

  const content = t(`tabs.${activeTab}`, { returnObjects: true });

  return (
    <section className="w-full bg-white relative z-20 py-12 md:py-24 overflow-hidden">
      {/* Heading */}
      <div className="text-center mb-8 md:mb-12 px-6">
        <h2 className="text-3xl md:text-6xl font-semibold text-black">
          {t("title")}
        </h2>
        <p className="mt-2 md:mt-4 text-[#547593] text-sm md:text-lg">
          {t("subtitle")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8 px-4">
        <div
          className="flex gap-2 px-3 py-2 rounded-2xl shadow-lg max-w-full overflow-x-auto no-scrollbar"
          style={{
            background: "linear-gradient(167deg, #03A4F4 10%, #64EF0A 90%)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-xs md:text-lg whitespace-nowrap border transition-all duration-300
                ${
                  activeTab === tab
                    ? "bg-[#6F2DBD] text-white border-transparent shadow-md"
                    : "bg-transparent text-white border border-white/50"
                }
              `}
            >
              {t(`tabs.${tab}.heading`)}
            </button>
          ))}
        </div>
      </div>

      {/* Boxes */}
      <div className="relative max-w-6xl mx-auto py-5 md:py-10 px-2 md:px-4 ">
        <div className="grid grid-cols-2 gap-2 md:gap-4">

          {/* Box 1 */}
          <div
            className="h-[160px] sm:h-[220px] md:h-[260px] rounded-2xl md:rounded-3xl bg-cover bg-center shadow-lg p-3 md:p-6 text-white"
            style={{ backgroundImage: `url(${lefttop})` }}
          >
            <h1 className="text-sm md:text-4xl font-semibold mt-2 md:mt-6">
              {content.heading}
            </h1>
          </div>

          {/* Box 2 */}
          <div
            className="h-[160px] sm:h-[220px] md:h-[260px] rounded-2xl md:rounded-3xl bg-cover bg-center shadow-lg p-3 md:p-6 text-white text-right flex flex-col justify-center items-end"
            style={{ backgroundImage: `url(${righttop})` }}
          >
            <h3 className="text-sm md:text-3xl font-semibold">
              {content.qa[0].question}
            </h3>
            <div className="mt-1 md:mt-3 text-[10px] md:text-lg w-full md:w-[300px]">
              <RenderAnswer answer={content.qa[0].answer} />
            </div>
          </div>

          {/* Box 3 */}
          <div
            className="h-[160px] sm:h-[220px] md:h-[260px] rounded-2xl md:rounded-3xl bg-cover bg-center shadow-lg p-3 md:p-6 text-white"
            style={{ backgroundImage: `url(${leftbottom})` }}
          >
            <h3 className="text-sm md:text-3xl font-semibold">
              {content.qa[1].question}
            </h3>
            <div className="mt-1 md:mt-3 text-[10px] md:text-lg w-full md:w-[300px]">
              <RenderAnswer answer={content.qa[1].answer} />
            </div>
          </div>

          {/* Box 4 */}
          <div
            className="h-[160px] sm:h-[220px] md:h-[260px] rounded-2xl md:rounded-3xl bg-cover bg-center shadow-lg p-3 md:p-6 text-white text-right flex flex-col justify-center items-end"
            style={{ backgroundImage: `url(${rightbottom})` }}
          >
            <h3 className="text-sm md:text-3xl font-semibold">
              {content.qa[2].question}
            </h3>
            <div className="mt-1 md:mt-3 text-[10px] md:text-lg w-full md:w-[300px]">
              <RenderAnswer answer={content.qa[2].answer} />
            </div>
          </div>
        </div>

        {/* Center Circle */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="w-24 h-24 sm:w-40 sm:h-40 md:w-72 md:h-72 rounded-full bg-[#6F2DBD] border-2 md:border-4 border-white shadow-2xl flex items-center justify-center overflow-hidden">
            <img src={realImage} alt="Center" className="w-[70%] object-contain" />
          </div>
        </div>
      </div>

      <button className="mx-auto block mt-10 bg-[#5C039B] text-white px-6 py-3 rounded-md transition-transform active:scale-95">
        {t("cta")}
      </button>
    </section>
  );
};

export default StakeholderSection;
