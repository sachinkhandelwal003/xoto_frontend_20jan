import React from "react";
import xotoLogo from "../../assets/img/image_109-removebg-preview.png";
import wave1 from "../../assets/img/wave/waveint2.png";
import { useTranslation } from "react-i18next";

const Article2 = () => {
  const { t } = useTranslation("article2");

  return (
    <div>
      <section className="relative w-full bg-[var(--color-body)] min-h-screen overflow-hidden pb-32 pt-20">
        {/* Wave Background */}
        <div>
          <div className="absolute bottom-0 lg:bottom-0 left-0 w-full z-0 overflow-hidden">
            <img
              src={wave1}
              alt=""
              className="w-full min-w-[140%] -ml-[20%] scale-[1.8] lg:scale-100 lg:min-w-full lg:ml-0 pointer-events-none select-none translate-y-3"
              style={{
                height: "400px",
                transform: "translateY(-5px)",
              }}
            />
          </div>

          {/* MAIN CONTENT */}
          <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-start justify-between gap-10 relative z-10">
            {/* LEFT CONTENT */}
            <div className="max-w-[595px] w-full">
              <h2
                className="
                  font-dmSans 
                  font-semibold
                  text-[60px]
                  leading-[55px]
                  tracking-[-0.03em]
                  text-[#020202]
                  mt-[60px]
                  mb-6
                "
              >
                {t("title")}
              </h2>

              <p
                className="
                  font-dmSans 
                  font-semibold
                  text-[20px] 
                  leading-[33px] 
                  tracking-[0em]
                  text-[#547593]
                  max-w-[595px]
                  text-left
                  mt-[50px]
                "
              >
                {t("description")}
              </p>
            </div>

            {/* RIGHT SIDE CIRCLE */}
            <div className="flex justify-center lg:justify-end w-full lg:w-auto">
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: "clamp(288px,45vw,380px)",
                  height: "clamp(288px,45vw,380px)",
                  padding: "2px",
                  background: "linear-gradient(180deg,#03A4F4 0%,#64EF0A 100%)",
                  boxShadow:
                    "0px 30px 80px rgba(92,3,155,0.28), 0 12px 30px rgba(0,0,0,0.18)",
                }}
              >
                <div
                  className="rounded-full flex items-center justify-center overflow-hidden"
                  style={{
                    width: "100%",
                    height: "100%",
                    background: "#5C039B",
                    boxShadow:
                      "inset 0 -6px 18px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.08)",
                  }}
                >
                  <img
                    src={xotoLogo}
                    alt="Xoto Logo"
                    className="object-contain"
                    style={{ width: "72%", height: "72%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Article2;
