import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // This moves the window back to the very top (0,0)
    window.scrollTo(0, 0);
  }, [pathname]); // This triggers every time the URL changes

  return null;
};

export default ScrollToTop;
