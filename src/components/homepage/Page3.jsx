import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { FiSearch } from "react-icons/fi";
import { useBlogContext } from "../../context/BlogContext"; // Context Import
import { useNavigate } from "react-router-dom"; // IMPORT NAVIGATE

// Images
import Picture from "../../assets/img/photo-1477959858617-67f85cf4f1df.png";
import DefaultBlogImg from "../../assets/img/data_Looks_3.jpg"; 
import wave2 from "../../assets/img/wave/wave2.png";
import i1 from "../../assets/icons/Homeicons/xx1.png";
import i2 from "../../assets/icons/Homeicons/xx2.png";
import i3 from "../../assets/icons/Homeicons/xx3.png";
import i4 from "../../assets/icons/Homeicons/xx4.png";

const Page3 = () => {
  const { t } = useTranslation("page3");
  const { setSelectedBlogId } = useBlogContext();
  const navigate = useNavigate(); // INITIALIZE NAVIGATE

  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 8;

  const fetchBlogs = async (currentPage, search, isLoadMore = false) => {
    setLoading(true);
    try {
      const response = await axios.get(`https://xoto.ae/api/blogs/get-all-blogs`, {
        params: { page: currentPage, limit: LIMIT, search: search }
      });

      const resData = response.data.data || response.data; 

      if (resData && Array.isArray(resData)) {
        if (isLoadMore) {
          setBlogs((prev) => [...prev, ...resData]);
        } else {
          setBlogs(resData);
        }
        setHasMore(resData.length >= LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const delayDebounceFn = setTimeout(() => {
      fetchBlogs(1, searchText, false);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchText]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, searchText, true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // --- HANDLE READ MORE CLICK ---
  const handleReadMore = (id) => {
    // 1. ID ko Context me save karo
    setSelectedBlogId(id);
    // 2. User ko '/ai' page par bhej do
    navigate("/ai");
  };
  // ------------------------------

  const categories = [
    { id: 1, title: t("categories.1"), iconPath: i4 },
    { id: 2, title: t("categories.2"), iconPath: i3 },
    { id: 3, title: t("categories.3"), iconPath: i2 },
    { id: 4, title: t("categories.4"), iconPath: i1 },
  ];

  const CategoryIcon = ({ iconPath }) => (
    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#5C039B] flex items-center justify-center shadow-lg mx-auto mb-4 p-3 ring-4 ring-purple-100">
      <img src={iconPath} alt="" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
    </div>
  );

  return (
    <div className="w-full overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="relative w-full bg-cover bg-center min-h-[500px] flex items-center justify-center text-white" style={{ backgroundImage: `url(${Picture})` }}>
        <div className="absolute inset-0 "></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-snug">{t("hero.title")}</h1>
        </div>
          <div className="absolute bottom-0 left-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-left-shape" />
      <div className="absolute bottom-0 right-0 w-72 h-12 bg-[var(--color-body)] z-[3] clip-right-shape" />

      <style>{`
        .clip-left-shape {
          clip-path: polygon(0 0, 55% 0, 100% 100%, 0% 100%);
        }
        .clip-right-shape {
          clip-path: polygon(47% 0, 100% 0, 100% 100%, 0% 100%);
        }
      `}</style>
      </section>

      {/* BLOG LIST */}
      <section className="relative py-16 px-4 md:px-8 bg-[var(--color-body)]">
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <h2 className="text-3xl md:text-5xl text-center text-black font-semibold mb-12">{t("blogs.title")}</h2>

          {/* Search Bar */}
          <div className="flex justify-center mb-10">
            <div className="relative w-full max-w-6xl">
              <input
                type="text"
                placeholder={t("search.placeholder")}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-6 pr-12 py-3 border border-gray-300 rounded-md shadow-md"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#5C039B] w-10 h-10 flex items-center justify-center rounded-md text-white">
                <FiSearch className="text-lg" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl mx-auto">
            {blogs.map((post) => (
                <div key={post._id || post.id} className="flex gap-5 p-4 bg-white rounded-xl shadow w-full">
                  <img 
                    src={post.featuredImage || DefaultBlogImg} 
                    alt={post.title} 
                    className="w-32 h-28 sm:w-40 sm:h-32 rounded-lg object-cover flex-shrink-0" 
                  />

                  <div className="flex flex-col justify-between w-full">
                    <p className="text-[#5C039B] text-lg font-medium">
                      {post.createdAt ? formatDate(post.createdAt) : t("blogs.defaultDate")}
                    </p>
                    
                    <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* --- READ MORE CLICK -> NAVIGATE TO /ai --- */}
                    <button 
                      onClick={() => handleReadMore(post._id || post.id)} 
                      className="text-[#5C039B] mt-2 text-lg font-semibold hover:text-purple-800 text-left"
                    >
                      {t("blogs.readMore")}
                    </button>
                    {/* ------------------------------------------ */}

                  </div>
                </div>
              ))}
          </div>

          {hasMore && !searchText && (
            <div className="flex justify-center mt-10">
              <button onClick={handleLoadMore} disabled={loading} className="bg-[#5C039B] text-white px-10 py-3 rounded-md shadow-md">
                {loading ? "Loading..." : t("blogs.loadMore")}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* CATEGORY SECTION */}
      {/* <section className="relative py-20 px-4 md:px-8 bg-[var(--color-body)]">000 */}
      <section className="relative py-20 pb-40 px-4 md:px-8 bg-[var(--color-body)] overflow-hidden">

    <div className="absolute -bottom-122 left-0 right-0 w-screen pointer-events-none">
  <img
    src={wave2}
    alt=""
    className="w-screen max-w-none opacity-90"
  />
</div>


        <div className="max-w-6xl mx-auto relative z-10 w-full">
          <div className="text-center">
            <h2 className="text-3xl font-semibold">{t("categories.title")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16 w-full">
            {categories.map((category) => (
              <div key={category.id} className="bg-white p-6 rounded-xl border shadow-md text-center">
                <CategoryIcon iconPath={category.iconPath} />
                <h3 className="text-lg font-semibold">{category.title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Page3;