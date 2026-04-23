import { useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import AppRoutes from "./routes/AppRoutes";
import ScrollToTop from "./components/common/ScrollToTop";

const App = () => {
  const location = useLocation();

  // Detect if we are in the admin section
  const isAdminPath = location.pathname.startsWith("/admin");

  // If it's an admin path, return AppRoutes directly.
  // The AdminLayout is already defined inside AppRoutes.jsx for those paths.
  if (isAdminPath) {
    return (
      <>
        <ScrollToTop />
        <AppRoutes />
      </>
    );
  }

  // Otherwise, use the MainLayout for customers
  return (
    <MainLayout>
      <ScrollToTop />
      <AppRoutes />
    </MainLayout>
  );
};

export default App;
