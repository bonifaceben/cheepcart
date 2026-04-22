import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";
import AdminSidebar from "./AdminSidebar";
import "./Admin.css";

export default function AdminLayout() {

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("cc_admin_dark") === "true"
  );

  function toggleSidebar() {
    if (window.innerWidth <= 768) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  }

  function closeSidebar() {
    setMobileOpen(false);
  }

  function toggleDarkMode() {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("cc_admin_dark", newMode);
  }

  useEffect(() => {
    document.body.classList.toggle("admin-dark", darkMode);
  }, [darkMode]);

  return (
    <div className="admin-wrapper">

      {mobileOpen && (
        <div className="admin-overlay" onClick={closeSidebar}></div>
      )}

      <div
        className={`admin-sidebar 
        ${collapsed ? "collapsed" : ""} 
        ${mobileOpen ? "mobile-open" : ""}`}
      >
        <AdminSidebar closeSidebar={closeSidebar} collapsed={collapsed} />
      </div>

      <div className="admin-main">
        <AdminHeader
          toggleSidebar={toggleSidebar}
          toggleDarkMode={toggleDarkMode}
          darkMode={darkMode}
        />

        <div className="admin-content">
          <Outlet />
        </div>
      </div>

    </div>
  );
}