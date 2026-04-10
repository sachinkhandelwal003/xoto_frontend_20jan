import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import { apiService } from "../../manageApi/utils/custom.apiservice";
import { useBlogContext } from "../../context/BlogContext";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const Ai3 = () => {
  const navigate = useNavigate();
  const { selectedBlogId, setSelectedBlogId } = useBlogContext(); 
  const [blog, setBlog] = useState(null);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 LocalStorage trick
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

    // 1. Current Blog Fetch
    apiService
      .get("blogs/get-blog-by-id", { id: activeId }) 
      .then((res) => {
        setBlog(res.data || res.blog || res);
      })
      .catch((err) => {
        console.error("Error fetching current blog:", err);
      })
      .finally(() => setLoading(false));
      
    // 2. All Blogs Fetch (For Sidebar - EXACT API PARAMS ADDED)
    apiService
      .get("blogs/get-all-blogs", { 
        isPublished: true, 
        page: 1, 
        limit: 8, 
        search: "" 
      }) 
      .then((res) => {
        // Flexible data extraction
        let allBlogs = [];
        if (Array.isArray(res)) allBlogs = res;
        else if (res?.data && Array.isArray(res.data)) allBlogs = res.data;
        else if (res?.data?.data && Array.isArray(res.data.data)) allBlogs = res.data.data;
        else if (res?.blogs && Array.isArray(res.blogs)) allBlogs = res.blogs;
        else if (res?.data?.blogs && Array.isArray(res.data.blogs)) allBlogs = res.data.blogs;

        // Backend is already sending only published ones, so we just remove the currently open blog
        const filteredBlogs = allBlogs.filter(
          (b) => String(b._id || b.id) !== String(activeId)
        );
          
        setRecentBlogs(filteredBlogs.slice(0, 3)); // Taking top 3 for sidebar
      })
      .catch((err) => console.error("Error fetching recent blogs:", err));
      
  }, [selectedBlogId]);

  if (loading) {
    return <div className="text-center py-10 text-xl font-medium">Loading Content...</div>;
  }

  if (!blog) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold mb-2">No Blog Selected</h2>
        <p className="text-gray-500">Please go back and select a blog to read.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[var(--color-body)] px-4 py-16 overflow-hidden z-0">
      
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
             <ul className="flex flex-wrap gap-2 text-gray-500">
                {blog.tags?.length > 0
                  ? blog.tags.map((t, i) => (
                      <li key={i} className="bg-white border px-3 py-1 rounded-full text-sm">
                        {t}
                      </li>
                    ))
                  : <li className="bg-white border px-3 py-1 rounded-full text-sm">General</li>}
             </ul>
          </section>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="space-y-8">
          
          {/* SHARE CARD */}
          <div className="bg-white shadow-lg rounded-xl p-6 relative z-10">
            <h3 className="text-xl font-bold mb-4">Share</h3>
            <div className="flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 bg-[#526FA3] text-white p-3 rounded-md hover:opacity-90 transition">
                <FaFacebookF /> Facebook
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#46C4FF] text-white p-3 rounded-md hover:opacity-90 transition">
                <FaTwitter /> Twitter
              </button>
              <button className="flex items-center justify-center gap-2 bg-[#3C86AD] text-white p-3 rounded-md hover:opacity-90 transition">
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
                    key={item._id || item.id} 
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => {
                      if (setSelectedBlogId) {
                        const clickedId = item._id || item.id;
                        setSelectedBlogId(clickedId);
                        localStorage.setItem("savedBlogId", clickedId);
                        window.scrollTo({ top: 0, behavior: "smooth" }); 
                      }
                    }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.coverImage || item.featuredImage || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300" 
                      />
                    </div>
                    <div>
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
              onClick={() => navigate('/Blogs')} 
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