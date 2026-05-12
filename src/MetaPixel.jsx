import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const MetaPixel = () => {
  const location = useLocation();

  useEffect(() => {
    if (window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null;
};

export default MetaPixel;