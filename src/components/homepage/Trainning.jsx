import image from "../../assets/img/trainning.jpg";
import { useNavigate } from "react-router-dom";

export default function ComingSoon() {
  const navigate = useNavigate();

  return (
    <div
      className="relative min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: `url(${image})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-center text-white max-w-2xl px-6 ">
        <h1 className="text-4xl md:text-5xl  mb-4 heading-light">
          Building Skills  <br /> Coming Soon
                  </h1>

        <p className="text-lg md:text-xl text-gray-200 mb-8 font-semibold">
          We're preparing focused training content exclusively for Business
          Associates & Execution Partners
        </p>

        <button
          onClick={() => navigate("/ecosystem")}
          className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          Take me back to Partner Page
        </button>
      </div>
    </div>
  );
}
