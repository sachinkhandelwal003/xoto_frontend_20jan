import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useBlogContext } from "../../context/BlogContext";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import waveBottom from "../../assets/img/waveAi.png"; 

const Ai3 = () => {
  const navigate = useNavigate();
  const { selectedBlogId, setSelectedBlogId } = useBlogContext(); 
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    if (!selectedBlogId) return;

    // 1. Current Blog Fetch
    apiService
      .get("blogs/get-blog-by-id", { id: selectedBlogId }) 
      .then((res) => setBlog(res.data || res.blog || res))
      .catch((err) => console.error(err));
      
    // 2. All Blogs Fetch
    apiService
      .get("blogs/get-all-blogs", { limit: 10 }) 
      .then((res) => {
        // API response me array "data" key ke andar hai
        const allBlogs = res?.data?.data || res?.data || [];
        
        // Filter: Current blog hatao + Sirf 'Published' blogs rakho
        const filteredBlogs = Array.isArray(allBlogs) 
          ? allBlogs.filter((b) => b._id !== selectedBlogId && b.isPublished === true) 
          : [];
          
        setRecentBlogs(filteredBlogs.slice(0, 3)); 
      })
      .catch((err) => console.error(err));
      
  }, [selectedBlogId]);

  if (!blog) return <div className="text-center py-10">Loading Content...</div>;

  return (
    <div className="relative w-full bg-[var(--color-body)] px-4 py-16 overflow-hidden z-0">
      
      {/* BACKGROUND WAVE */}
      <img
        src={waveBottom}
        alt="Wave"
        className="
          absolute left-1/2 -translate-x-1/2 -z-10 
          bottom-0 sm:-bottom-22 md:-bottom-60 lg:-bottom-140
          w-[220%] sm:w-[170%] md:w-[150%] lg:w-[140%]
          pointer-events-none select-none opacity-95
        "
      />

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 relative z-10">
        
        {/* LEFT: CONTENT */}
        <div className="col-span-2 flex flex-col gap-8">
          <section>
            {blog.subHeading && (
              <p className="text-xl text-gray-600 mb-6">
                <span className="font-bold text-black">Subheading:  <br /></span>
                {blog.subHeading}
              </p>
            )}

            <div className="mb-4">
              <h3 className="text-xl font-bold text-black mb-3">Description:</h3>
              <div 
                className="text-gray-600 leading-relaxed prose max-w-none relative z-10" 
                dangerouslySetInnerHTML={{ __html: blog.content || blog.description }} 
              />
            </div>
          </section>

          {/* TAGS */}
          <section>
             <h3 className="text-2xl font-bold mb-4">Tags</h3>
             <ul className="list-disc pl-5 text-gray-500">
                {blog.tags?.length > 0
                  ? blog.tags.map((t, i) => <li key={i}>{t}</li>)
                  : <li>General</li>}
             </ul>
          </section>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="space-y-8">
          
          {/* SHARE CARD */}
          <div className="bg-white shadow-lg rounded-xl p-6 relative z-10">
            <h3 className="text-xl font-bold mb-4">Share</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center gap-2 bg-[#526FA3] text-white p-3 rounded-md hover:opacity-90 transition">
                <FaFacebookF /> Facebook
              </button>
              <button className="flex items-center gap-2 bg-[#46C4FF] text-white p-3 rounded-md hover:opacity-90 transition">
                <FaTwitter /> Twitter
              </button>
              <button className="flex items-center gap-2 bg-[#3C86AD] text-white p-3 rounded-md hover:opacity-90 transition">
                <FaLinkedinIn /> Linkedin
              </button>
            </div>
          </div>

          {/* NEWSLETTER CARD */}
          <div className="bg-white shadow-lg rounded-xl p-6 relative z-10">
            <h3 className="text-xl font-bold mb-4">Join our Newsletter</h3>
            <input
              type="email"
              placeholder="Email address"
              className="w-full border p-2 rounded mb-3 outline-none focus:border-[#5C039B]"
            />
            <button className="w-full bg-[#5C039B] text-white py-2 rounded font-bold hover:opacity-90 transition">
              Subscribe
            </button>
          </div>

          {/* RECENT BLOGS CARD */}
          <div className="bg-white shadow-lg rounded-xl p-6 relative z-10">
            <h3 className="text-xl font-bold mb-4">Recent Blogs</h3>
            <div className="flex flex-col gap-4">
              
              {recentBlogs.length > 0 ? (
                recentBlogs.map((item) => (
                  <div 
                    key={item._id} 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      if (setSelectedBlogId) {
                        setSelectedBlogId(item._id);
                        window.scrollTo({ top: 0, behavior: "smooth" }); 
                      }
                    }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      
                      {/* ✅ YAHAN UPDATE KIYA HAI: coverImage ya featuredImage uthayega */}
                      <img 
                        src={item.coverImage || item.featuredImage || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                      />
                      
                    </div>
                    <div>
                      {/* ✅ TITLE BHI UPDATE KIYA HAI */}
                      <h4 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-[#5C039B] transition">
                        {item.title || "Untitled Blog"}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No published blogs found.</p>
              )}

            </div>
            
            <button 
              onClick={() => navigate('/explore')} 
              className="w-full mt-5 text-[#5C039B] font-semibold text-sm hover:underline"
            >
              View All Articles →
            </button>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Ai3;