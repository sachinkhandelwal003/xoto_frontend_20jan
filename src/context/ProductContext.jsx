import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiService } from '../manageApi/utils/custom.apiservice'; // path apne project ke hisaab se adjust kar lena

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async () => {
    setLoading(true);

    try {

      const res = await apiService.get(
        "/products/get-all-products",
        {
          page: 1,
          limit: 100
        }
      );

      if (res?.success) {
        setProducts(res?.data?.products || []);
      }

    } catch (error) {
      console.error("API Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  return (
    <ProductContext.Provider value={{ products, loading, fetchAllProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);