import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlogContext } from "../../context/BlogContext";
import SectionImage from "../../assets/img/Image.png";

const Ai2 = () => {
  const { selectedBlogId } = useBlogContext();
  const [blogImage, setBlogImage] = useState(SectionImage);

  useEffect(() => {
    if (!selectedBlogId) return;
    axios.get(`https://xoto.ae/api/blogs/get-blog-by-id?id=${selectedBlogId}`)
      .then(res => {
         const data = res.data.data || res.data;
         // Agar extra image hai to wo use karo, nahi to main image
         setBlogImage(data.images?.[1] || data.featuredImage || SectionImage);
      })
      .catch(err => console.error(err));
  }, [selectedBlogId]);

  return (
    <div className="w-full bg-white py-12 px-4 flex justify-center">
      {/* 1. max-w-[1200px]: Width control ke liye
         2. h-[300px] sm:h-[400px] md:h-[500px]: Ye hai FIXED HEIGHT logic
      */}
      <div className="w-full max-w-[1200px] h-[300px] sm:h-[400px] md:h-[550px]">
        <img 
          src={blogImage} 
          alt="Detail" 
          className="
            w-full 
            h-full              /* Height full container jitni rahegi */
            object-cover        /* Image crop hogi par stretch nahi hogi */
            rounded-[20px] 
            shadow-lg
          " 
        />
      </div>
    </div>
  );
};

export default Ai2;