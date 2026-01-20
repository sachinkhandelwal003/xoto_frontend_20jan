import React, { createContext, useState, useContext } from "react";

// 1. Context create kiya
const BlogContext = createContext();

// 2. Provider banaya (Ye puri app ko wrap karega)
export const BlogProvider = ({ children }) => {
  // Ye variable yaad rakhega ki user ne kaunsa blog click kiya
  const [selectedBlogId, setSelectedBlogId] = useState(null);

  return (
    <BlogContext.Provider value={{ selectedBlogId, setSelectedBlogId }}>
      {children}
    </BlogContext.Provider>
  );
};

// 3. Custom Hook (Easy access ke liye)
export const useBlogContext = () => useContext(BlogContext);