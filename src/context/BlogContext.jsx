import React, { createContext, useState, useContext, useCallback } from "react";
import { apiService } from "../manageApi/utils/custom.apiservice";

const BlogContext = createContext();

export const BlogProvider = ({ children }) => {
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const [currentBlog, setCurrentBlog]       = useState(null);  // ← shared data
  const [blogLoading, setBlogLoading]       = useState(false);
  const [blogError, setBlogError]           = useState(null);

  // Single fetch — all child components read from here
  const loadBlog = useCallback(async (id) => {
    if (!id) { setCurrentBlog(null); return; }
    setBlogLoading(true);
    setBlogError(null);
    try {
      const res = await apiService.get(`blogs/get-blog-by-id`, { id });
      const data = res?.data || res?.blog || res;
      setCurrentBlog(data);
    } catch (err) {
      console.error("BlogContext fetch error:", err);
      setBlogError("Failed to load blog.");
      setCurrentBlog(null);
    } finally {
      setBlogLoading(false);
    }
  }, []);

  // When selectedBlogId changes, load the blog automatically
  const selectBlog = useCallback((id) => {
    setSelectedBlogId(id);
    loadBlog(id);
  }, [loadBlog]);

  return (
    <BlogContext.Provider value={{
      selectedBlogId, setSelectedBlogId: selectBlog,
      currentBlog, blogLoading, blogError,
    }}>
      {children}
    </BlogContext.Provider>
  );
};

export const useBlogContext = () => useContext(BlogContext);