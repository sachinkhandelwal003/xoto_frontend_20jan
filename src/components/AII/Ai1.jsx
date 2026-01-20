import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlogContext } from "../../context/BlogContext";

// Images
import Picture from "../../assets/img/Ai.png"; // Fixed background image
import AvatarImage from "../../assets/img/img.png";

const Ai1 = () => {
  const { selectedBlogId } = useBlogContext();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedBlogId) return;

    setLoading(true);

    axios
      .get(
        `https://xoto.ae/api/blogs/get-blog-by-id?id=${selectedBlogId}`
      )
      .then((res) => {
        setBlog(res.data.data || res.data.blog || res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedBlogId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-white bg-gray-900">
        Loading Hero Section...
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="text-gray-900 w-full">
      <section
        className="
          relative
          bg-cover bg-center bg-no-repeat
          min-h-[55vh] sm:min-h-[65vh] md:min-h-[70vh] lg:min-h-[75vh]
          flex items-center
          text-white
        "
        style={{ backgroundImage: `url(${Picture})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        {/* Bottom Clipped Bars */}
        <div className="hidden lg:block absolute bottom-0 left-0 w-56 lg:w-64 h-10 lg:h-12 bg-[var(--color-body)] z-[5] clip-left-shape"></div>
        <div className="hidden lg:block absolute bottom-0 right-0 w-56 lg:w-64 h-10 lg:h-12 bg-[var(--color-body)] z-[5] clip-right-shape"></div>

        <style>{`
          .clip-left-shape {
            clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
          }
          .clip-right-shape {
            clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
          }
        `}</style>

        {/* MAIN CONTENT */}
        <div
          className="
            relative z-10
            w-full max-w-7xl mx-auto
            px-4 sm:px-6 lg:px-8
            py-12 sm:py-16 md:py-20
            flex flex-col gap-6 sm:gap-8
          "
        >
          {/* DATE */}
          <div className="text-white text-xs sm:text-sm md:text-base font-normal tracking-wide flex items-center gap-2">
            <span>{new Date(blog.createdAt).toDateString()}</span>
            <span className="opacity-60">|</span>
            <span className="opacity-90">Trending Analysis</span>
          </div>

          {/* TITLE + AUTHOR SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-16">
            {/* TITLE */}
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-tight max-w-4xl">
              {blog.title}
            </h1>

            {/* AUTHOR */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 p-[2px] flex-shrink-0">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-300">
                  <img
                    src={blog.authorImage || AvatarImage}
                    alt={blog.authorName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
                  {blog.authorName || "Silicaman"}
                </p>
                <p className="text-xs sm:text-sm md:text-base text-white/70">
                  Author
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ai1;
