import { useTranslation } from "react-i18next";
import emailIcon from "../../assets/icons/Homeicons/email.png";
import addressIcon from "../../assets/icons/Homeicons/Career.png";
import phoneIcon from "../../assets/icons/Homeicons/phone.png";
import wave1 from "../../assets/img/wave/waveint2.png";

export default function ContactSection() {
  const { t } = useTranslation("contact1");

  return (
    <section className="relative bg-[var(--color-body)] py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* 🌊 Background Wave */}
      <div className="absolute bottom-[-110px] left-0 w-full z-0 overflow-hidden">
        <img src={wave1} alt="wave" className="w-full opacity-90" />
      </div>

      <div className="relative z-10">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-black mb-14">
          {t("heading")}
        </h2>

        {/* Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 px-6">
          
          {/* Email */}
          <div className="flex items-start gap-5">
            <div className="bg-[#5C039B] rounded-full p-4">
              <img src={emailIcon} alt="email" className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {t("email.title")}
              </h3>
              <p className="text-gray-600">
                {t("email.subtitle")}
              </p>
              <p className="text-gray-800 font-medium mt-1">
                {t("email.primary")} <br />
                {t("email.secondary")}
              </p>
              <p className="text-gray-600 text-sm">
                {t("email.note")}
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-5">
            <div className="bg-[#5C039B] rounded-full p-4">
              <img src={addressIcon} alt="address" className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {t("address.title")}
              </h3>
              <p className="text-gray-600">
                {t("address.line1")}
              </p>
              <p className="text-gray-600">
                {t("address.country")}
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-start gap-5">
            <div className="bg-[#5C039B] rounded-full p-4">
              <img src={phoneIcon} alt="phone" className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">
                {t("phone.title")}
              </h3>
              <p className="text-gray-600">
                {t("phone.number")}
              </p>
              <p className="text-gray-600 text-sm">
                {t("phone.timing")}
              </p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 sm:mt-20 flex justify-center">
          <iframe
            title="XOTIK LTD Map"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3610.5326639711025!2d55.2618832!3d25.1852532!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e5f69d0fe2e52c9%3A0x2efe28575bbe2f84!2sParkLane%20Tower%20-%20Business%20Bay%20-%20Dubai%20-%20United%20Arab%20Emirates!5e0!3m2!1sen!2sin!4v1764576845571!5m2!1sen!2sin"
            loading="lazy"
            allowFullScreen
            className="shadow-md w-[92%] sm:w-[88%] md:w-[80%] h-[300px] sm:h-[350px] md:h-[450px] lg:h-[500px]"
          />
        </div>
      </div>
    </section>
  );
}
