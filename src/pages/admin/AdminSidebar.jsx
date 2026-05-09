import { useState, useRef, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css";
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaUsers,
  FaChartLine,
  FaTags,
  FaCaretDown,
  FaImages
} from "react-icons/fa";

export default function AdminSidebar({ onLinkClick }) {
  const [openMenu, setOpenMenu] = useState(null);
  const sidebarRef = useRef();

  // CLOSE ON OUTSIDE CLICK
  useEffect(() => {
    function handleClickOutside(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TOGGLE
  const handleToggle = (menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu));
  };

  const handleLinkClick = () => {
    setOpenMenu(null);
    onLinkClick && onLinkClick();
  };

  return (
    <div className="sb-menu" ref={sidebarRef}>

      {/* DASHBOARD */}
      <NavLink to="/admin" onClick={handleLinkClick}>
        <FaTachometerAlt /> <span>Dashboard</span>
      </NavLink>

      {/* PRODUCTS */}
      <div className="sb-section">
        <button
          onClick={() => handleToggle("products")}
          className={`sb-dropdown-btn ${openMenu === "products" ? "open" : ""}`}
        >
          <FaBox /> <span>Products</span> <FaCaretDown />
        </button>

        {openMenu === "products" && (
          <div className="sb-dropdown-menu">
            <NavLink to="/admin/products" onClick={handleLinkClick}>
              All Products
            </NavLink>
            <NavLink to="/admin/products/create" onClick={handleLinkClick}>
              Add Product
            </NavLink>
          </div>
        )}
      </div>

      {/* ORDERS */}
      <NavLink to="/admin/orders" onClick={handleLinkClick}>
        <FaShoppingCart /> <span>Orders</span>
      </NavLink>

      {/* USERS */}
      <NavLink to="/admin/users" onClick={handleLinkClick}>
        <FaUsers /> <span>Users</span>
      </NavLink>

      {/* ANALYTICS */}
      <NavLink to="/admin/analytics" onClick={handleLinkClick}>
        <FaChartLine /> <span>Analytics</span>
      </NavLink>

      {/* 🔥 PRE-ORDER (NEW) */}
      <div className="sb-section">
        <button
          onClick={() => handleToggle("preorder")}
          className={`sb-dropdown-btn ${openMenu === "preorder" ? "open" : ""}`}
        >
          <FaBox /> <span>Pre-Order</span> <FaCaretDown />
        </button>

        {openMenu === "preorder" && (
          <div className="sb-dropdown-menu">

            <NavLink to="/admin/preorder/create" onClick={handleLinkClick}>
              Create Pre-Order
            </NavLink>

            <NavLink to="/admin/preorder" onClick={handleLinkClick}>
              All Pre-Orders
            </NavLink>

            <NavLink to="/admin/pre-order-enquiries" onClick={handleLinkClick}>
              Enquiries
            </NavLink>

          </div>
        )}
      </div>

      {/* BANNERS */}
      <div className="sb-section">
        <button
          onClick={() => handleToggle("banners")}
          className={`sb-dropdown-btn ${openMenu === "banners" ? "open" : ""}`}
        >
          <FaImages /> <span>Banners</span> <FaCaretDown />
        </button>

        {openMenu === "banners" && (
          <div className="sb-dropdown-menu">
            <NavLink to="/admin/banners" onClick={handleLinkClick}>
              All Banners
            </NavLink>
            <NavLink to="/admin/banners/create" onClick={handleLinkClick}>
              Upload Main Banner
            </NavLink>
            <NavLink to="/admin/side-banners/create" onClick={handleLinkClick}>
              Upload Side Banner
            </NavLink>
          </div>
        )}
      </div>

      {/* CATEGORIES */}
      <div className="sb-section">
        <button
          onClick={() => handleToggle("categories")}
          className={`sb-dropdown-btn ${openMenu === "categories" ? "open" : ""}`}
        >
          <FaTags /> <span>Categories</span> <FaCaretDown />
        </button>

        {openMenu === "categories" && (
          <div className="sb-dropdown-menu">
            <NavLink to="/admin/categories" onClick={handleLinkClick}>
              All Categories
            </NavLink>
            <NavLink to="/admin/categories/create" onClick={handleLinkClick}>
              Add Category
            </NavLink>
          </div>
        )}
      </div>

    </div>
  );
}