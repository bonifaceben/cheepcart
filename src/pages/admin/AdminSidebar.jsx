import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaTags, // Category icon
  FaCaretDown, // Dropdown icon
} from "react-icons/fa";

export default function AdminSidebar({ toggleSidebar }) {
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false); // Dropdown state for categories
  const [isProductsOpen, setIsProductsOpen] = useState(false); // Dropdown state for products

  const toggleCategories = () => {
    setIsCategoriesOpen(!isCategoriesOpen); // Toggle state for categories
  };

  const toggleProducts = () => {
    setIsProductsOpen(!isProductsOpen); // Toggle state for products
  };

  return (
    <div className="sidebar-menu">
      <NavLink to="/admin" onClick={toggleSidebar}>
        <FaTachometerAlt /> <span>Dashboard</span>
      </NavLink>

      {/* Products Dropdown */}
      <div className="sidebar-products">
        <button onClick={toggleProducts} className="dropdown-btn">
          <FaBox /> <span>Products</span> <FaCaretDown />
        </button>
        {isProductsOpen && (
          <div className="dropdown-menu">
            <NavLink to="/admin/products" onClick={toggleSidebar}>
              All Products
            </NavLink>
            <NavLink to="/admin/products/create" onClick={toggleSidebar}>
              Add Product
            </NavLink>
          </div>
        )}
      </div>

      <NavLink to="/admin/orders" onClick={toggleSidebar}>
        <FaShoppingCart /> <span>Orders</span>
      </NavLink>

      <NavLink to="/admin/customers" onClick={toggleSidebar}>
        <FaUsers /> <span>Customers</span>
      </NavLink>

      <NavLink to="/admin/analytics" onClick={toggleSidebar}>
        <FaChartLine /> <span>Analytics</span>
      </NavLink>

      {/* Categories Dropdown */}
      <div className="sidebar-category">
        <button onClick={toggleCategories} className="dropdown-btn">
          <FaTags /> <span>Categories</span> <FaCaretDown />
        </button>
        {isCategoriesOpen && (
          <div className="dropdown-menu">
            <NavLink to="/admin/categories" onClick={toggleSidebar}>
              All Categories
            </NavLink>
            <NavLink to="/admin/categories/create" onClick={toggleSidebar}>
              Add Category
            </NavLink>
          </div>
        )}
      </div>
    </div>
  );
}