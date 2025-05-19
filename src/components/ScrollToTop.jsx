import { useEffect } from "react";
import { useNavigation } from "react-router";

const ScrollToTop = () => {
  const { pathname } = useNavigation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;