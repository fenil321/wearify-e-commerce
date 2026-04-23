import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProductDetails from "../pages/ProductDetails";
import PrivateRoutes from "./PrivateRoutes";
import Cart from "../pages/Cart";
import Dashboard from "../pages/admin/Dashboard";
import AddProduct from "../pages/admin/AddProduct";
import AdminLayout from "../layouts/AdminLayout";
import Products from "../pages/admin/Products";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Orders from "../pages/profile/Orders";
import EditProfile from "../pages/profile/EditProfile";
import Address from "../pages/profile/Address";
import Wishlist from "../pages/Wishlist";
import AdminOrders from "../pages/admin/AdminOrders";
import EditProduct from "../pages/admin/EditProduct";
import AdminUsers from "../pages/admin/AminUsers";
import Coupons from "../pages/admin/Coupon";
import Checkout from "../pages/Checkout";
import Success from "../pages/Success";
import AnimeDesign from "../pages/admin/AnimeDesigns";
import Analytics from "../pages/admin/Analytics";
import CategoryPage from "../pages/CategoryPage";
import Hero from "../components/common/Hero";
import BestSellers from "../components/common/BestSeller";
import ContactUs from "../components/common/ContactUs";
import ShippingPolicy from "../components/common/ShippingPolicy";
import ReturnsExchanges from "../components/common/ReturnsExchanges";
import FAQ from "../components/common/FAQ";
import RefundRequests from "../pages/admin/RefundRequests";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/shop/:category" element={<CategoryPage />} />

      <Route path="/contact" element={<ContactUs />} />
      <Route path="/shipping" element={<ShippingPolicy />} />
      <Route path="/returns" element={<ReturnsExchanges />} />
      <Route path="/faq" element={<FAQ />} />

      <Route path="/cart" element={<Cart />} />

      {/* User */}
      <Route element={<PrivateRoutes />}>
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      <Route element={<PrivateRoutes />}>
        <Route path="/profile/orders" element={<Orders />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/profile/address" element={<Address />} />
        <Route path="/order-success" element={<Success />} />
      </Route>

      {/* Admin */}
      <Route element={<PrivateRoutes role={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<EditProfile />} />
          <Route path="products" element={<Products />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:id" element={<EditProduct />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="anime" element={<AnimeDesign />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="refunds" element={<RefundRequests />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
