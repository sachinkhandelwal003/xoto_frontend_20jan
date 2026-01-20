import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CategoryCards from "./CategoryCards";
// import AIRecommendationModal from "./AIRecommendationModal";

const Category = () => {
  const { id } = useParams();  // ✅ read ID from URL
  const [showModal, setShowModal] = useState(false);

  // Show the AI modal once on mount
  useEffect(() => {
    setShowModal(true);
  }, []);

  return (
    <>
      <CategoryCards categoryId={id} />
      {/* {showModal && <AIRecommendationModal onClose={() => setShowModal(false)} />} */}
    </>
  );
};

export default Category;
