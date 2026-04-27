import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ================= LAYOUTS =================
import MainLayout from "./components/layout/MainLayout";
import AuthLayout from "./components/layout/AuthLayout";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOTP from "./pages/VerifyResetOTP";
import ResetPassword from "./pages/ResetPassword";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout"; // ✅ ADDED
import CheckoutSummary from "./pages/CheckoutSummary";


// ================= BANNERS =================
import CreateBanner from "./pages/admin/CreateBanner";
import CreateSideBanner from "./pages/admin/CreateSideBanner";
import UpdateBanner from "./pages/admin/UpdateBanner";
import BannerList from "./pages/admin/BannerList";

// ================= ROUTE GUARDS =================
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import CartGuardRoute from "./components/CartGuardRoute";
import PaymentSuccess from "./pages/PaymentSuccess";

// ================= CUSTOMER DASHBOARD =================
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import Profile from "./pages/dashboard/Profile";


// ================= ADMIN DASHBOARD =================
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCreateCategory from "./pages/admin/Categories/AdminCreateCategory";
import CategoriesList from "./pages/admin/Categories/CategoriesList";
import UpdateCategory from "./pages/admin/Categories/UpdateCategory";
import DeleteCategory from "./pages/admin/Categories/DeleteCategory";
import AdminCreateProduct from "./pages/admin/Products/AdminCreateProduct";
import AdminProductList from "./pages/admin/Products/AdminProductList";
import AdminUpdateProduct from "./pages/admin/Products/AdminUpdateProduct";


// ================= PRODUCT DETAILS =================
import ProductDetails from "./pages/admin/Products/ProductDetails";

// ================= CONTEXT =================
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>

          {/* ================= STORE / MAIN PAGES ================= */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:slug" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />

            {/* ✅ CHECKOUT ROUTE (PROTECTED) */}
            <Route
  path="/checkout"
  element={
    <ProtectedRoute>
      <CartGuardRoute>
        <Checkout />
      </CartGuardRoute>
    </ProtectedRoute>
  }
/>

<Route
  path="/checkout-summary"
  element={
    <ProtectedRoute>
      <CartGuardRoute>
        <CheckoutSummary />
      </CartGuardRoute>
    </ProtectedRoute>
  }
/>
          
          </Route>

          

          {/* ================= AUTH PAGES ================= */}
          <Route element={<AuthLayout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-reset-otp" element={<VerifyResetOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Route>

          {/* ================= CUSTOMER DASHBOARD ================= */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Profile />} />
          </Route>

          {/* ================= ADMIN DASHBOARD ================= */}
          <Route
  path="/admin"
  element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }
>
  <Route index element={<AdminDashboard />} />

  {/* Categories */}
  <Route path="categories/create" element={<AdminCreateCategory />} />
  <Route path="categories" element={<CategoriesList />} />
  <Route path="categories/update/:categoryId" element={<UpdateCategory />} />
  <Route path="categories/delete/:categoryId" element={<DeleteCategory />} />

  {/* Products */}
  <Route path="products/create" element={<AdminCreateProduct />} />
  <Route path="products" element={<AdminProductList />} />
  <Route path="products/update/:productId" element={<AdminUpdateProduct />} />

  {/* 🔥 FIXED BANNERS ROUTE */}
  <Route path="banners/create" element={<CreateBanner />} />
  <Route path="side-banners/create" element={<CreateSideBanner />} />
  <Route path="banners/update/:bannerId" element={<UpdateBanner />} />
  <Route path="banners" element={<BannerList />} />

</Route>

          <Route
  path="/payment-success"
  element={
    <ProtectedRoute>
      <PaymentSuccess />
    </ProtectedRoute>
  }
/>

        </Routes>
      </Router>
    </CartProvider>
  );
}

export default App;