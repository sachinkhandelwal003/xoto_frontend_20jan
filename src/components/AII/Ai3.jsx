import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlogContext } from "../../context/BlogContext";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import waveBottom from "../../assets/img/waveAi.png"; // Make sure path sahi ho

const Ai3 = () => {
  const { selectedBlogId } = useBlogContext();
  const [blog, setBlog] = useState(null);

  useEffect(() => {
    if (!selectedBlogId) return;
    axios.get(`https://xoto.ae/api/blogs/get-blog-by-id?id=${selectedBlogId}`)
      .then(res => setBlog(res.data.data || res.data.blog || res.data))
      .catch(err => console.error(err));
  }, [selectedBlogId]);

  if (!blog) return <div className="text-center py-10">Loading Content...</div>;

  return (
    <div className="relative w-full bg-white px-4 py-16 overflow-hidden">
      
      {/* ========================= WAVE BG (Fixed) ========================= */}
      {/* Isme maine responsive classes wapis daal di hain */}
      <img
        src={waveBottom}
        alt="Wave"
        className="
          absolute left-1/2 -translate-x-1/2 
          bottom-0 sm:-bottom-22 md:-bottom-60 lg:-bottom-140
          w-[220%] sm:w-[170%] md:w-[150%] lg:w-[140%]
          pointer-events-none select-none opacity-95
        "
        style={{ zIndex: 5 }}
      />

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10 relative z-20">
        {/* LEFT: CONTENT */}
        <div className="col-span-2 flex flex-col gap-10">
          <section>
            <h2 className="text-3xl font-bold mb-6 text-black">{blog.title}</h2>
            {/* HTML CONTENT RENDER */}
            <div 
              className="text-gray-600 leading-relaxed prose max-w-none" 
              dangerouslySetInnerHTML={{ __html: blog.content || blog.description }} 
            />
          </section>

          {/* TAGS */}
          <section>
             <h3 className="text-2xl font-bold mb-4">Tags</h3>
             <ul className="list-disc pl-5 text-gray-500">
                {blog.tags?.length > 0 ? blog.tags.map((t, i) => <li key={i}>{t}</li>) : <li>General</li>}
             </ul>
          </section>
        </div>

        {/* RIGHT: SIDEBAR */}
        <aside className="space-y-10">
          <div className="bg-white shadow-lg rounded-xl p-6">
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

          {/* Newsletter Box (Optional - agar chahiye to rakh lena) */}
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h3 className="text-xl font-bold mb-4">Join our Newsletter</h3>
            <input type="email" placeholder="Email address" className="w-full border p-2 rounded mb-3" />
            <button className="w-full bg-[#5C039B] text-white py-2 rounded font-bold">Subscribe</button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Ai3;