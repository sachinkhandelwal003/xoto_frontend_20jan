import React, { useState, useEffect } from "react";
import { apiService } from "../../manageApi/utils/custom.apiservice"; // ✅ API SERVICE
import { useBlogContext } from "../../context/BlogContext";
import SectionImage from "../../assets/img/Image.png";

const Ai2 = () => {
  const { selectedBlogId } = useBlogContext();
  const [blogImage, setBlogImage] = useState(SectionImage);

  useEffect(() => {
    if (!selectedBlogId) return;

    apiService
      .get("blogs/get-blog-by-id", { id: selectedBlogId }) // ✅ UPDATED
      .then((res) => {
        const data = res.data || res;
        // Agar extra image hai to wo use karo, nahi to main image
        setBlogImage(data.images?.[1] || data.featuredImage || SectionImage);
      })
      .catch((err) => console.error(err));
  }, [selectedBlogId]);

  return (
    <div className="w-full bg-[var(--color-body)] py-12 px-4 flex justify-center">
      {/* 1. max-w-[1200px]: Width control ke liye
         2. h-[300px] sm:h-[400px] md:h-[500px]: Ye hai FIXED HEIGHT logic
      */}
      <div className="w-full max-w-[1200px] h-[300px] sm:h-[400px] md:h-[550px]">
        <img 
          src={blogImage} 
          alt="Detail" 
          className="
            w-full 
            h-full
            object-cover
            rounded-[20px] 
            shadow-lg
          " 
        />
      </div>
    </div>
  );
};

export default Ai2;