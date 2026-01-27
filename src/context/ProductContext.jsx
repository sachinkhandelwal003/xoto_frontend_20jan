import React, { createContext,    useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      // Limit badha di hai taaki "See More" click hone par saare products turant mil jayein
      const res = await axios.get('https://xoto.ae/api/products/get-all-products?page=1&limit=100');
      if (res.data.success) {
        setProducts(res.data.data.products);
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