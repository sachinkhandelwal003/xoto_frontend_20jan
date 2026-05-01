import React, { useState, useEffect } from "react";
import { apiService } from "../../manageApi/utils/custom.apiservice"; 
import { useBlogContext } from "../../context/BlogContext";

// Images
import Picture from "../../assets/img/Ai.png"; 
import AvatarImage from "../../assets/img/img.png";

const Ai1 = () => {
  const { selectedBlogId } = useBlogContext();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let activeId = selectedBlogId;

    if (activeId) {
      localStorage.setItem("savedBlogId", activeId);
    } else {
      activeId = localStorage.getItem("savedBlogId");
    }

    if (!activeId) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // 🚀 FIX: API URL format fixed to ensure data fetches properly
    apiService
      .get(`/blogs/get-blog-by-id?id=${activeId}`) 
      .then((res) => {
        setBlog(res.data || res.blog || res);
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

  if (!blog) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-white bg-gray-900">
        <p>No Blog Selected or Found.</p>
        <p className="text-sm opacity-70 mt-2">Please select a blog from the main list.</p>
      </div>
    );
  }

  return (
    <div className="text-gray-900 w-full bg-[var(--color-body)]"> 
      <section
        className="
          relative
          w-full
          bg-cover bg-center bg-no-repeat
          min-h-[55vh] sm:min-h-[65vh] md:min-h-[70vh] lg:min-h-[75vh]
          flex items-center
          text-white
          overflow-hidden
        "
        style={{ backgroundImage: `url(${blog.coverImage || blog.featuredImage || Picture})` }}
      >
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="absolute bottom-[-1px] left-0 w-24 sm:w-40 md:w-56 lg:w-64 h-6 sm:h-8 md:h-10 lg:h-12 bg-[var(--color-body)] z-10 clip-left-shape"></div>
        <div className="absolute bottom-[-1px] right-0 w-24 sm:w-40 md:w-56 lg:w-64 h-6 sm:h-8 md:h-10 lg:h-12 bg-[var(--color-body)] z-10 clip-right-shape"></div>

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
            relative z-20
            w-full max-w-7xl mx-auto
            px-4 sm:px-6 lg:px-8
            py-16 sm:py-20 md:py-24
            flex flex-col gap-6 sm:gap-8
          "
        >
          {/* DATE */}
          <div className="text-white/80 text-xs sm:text-sm md:text-base font-medium tracking-wide flex items-center gap-2 mb-2">
            <span>{new Date(blog.createdAt).toDateString()}</span>
            <span>|</span>
          </div>

          {/* TITLE + AUTHOR SECTION */}
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 lg:gap-16">
            {/* TITLE */}
            <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl leading-tight max-w-4xl text-white shadow-sm drop-shadow-md">
              {blog.title}
            </h1>

            {/* AUTHOR */}
            <div className="flex items-center gap-4 sm:gap-5 pb-2">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 p-[3px] flex-shrink-0 shadow-lg">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-800 border-2 border-transparent">
                  <img
                    src={blog.authorImage || AvatarImage}
                    alt={blog.authorName || "Author"}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <p className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-md">
                  {blog.authorName || "Author Name"}
                </p>
                {/* 🚀 FIX: Hardcoded "Author" hata kar API ka data daal diya hai */}
                {blog.authorDesignation && (
                  <p className="text-xs sm:text-sm text-white/80 font-medium tracking-wide">
                    {blog.authorDesignation}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Ai1;