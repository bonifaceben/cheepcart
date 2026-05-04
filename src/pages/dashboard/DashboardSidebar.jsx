import { Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import {
  Person,
  BoxSeam,
  Heart,
  GeoAlt,
  X
} from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";

export default function DashboardSidebar({ onLinkClick, onClose }) {
  const { user, logout } = useAuth();

  return (
    <div className="cc-sidebar">

      {/* 🔥 MOBILE HEADER */}
      <div className="cc-sidebar-top">
        <span>Menu</span>
        <button className="close-btn" onClick={onClose}>
          <X size={22} />
        </button>
      </div>

      {/* USER */}
      <div className="cc-sidebar-user">
        <Person size={24} />
        <div>
          <strong>Hi, {user?.name?.split(" ")[0]}</strong>
        </div>
      </div>

      <Nav className="flex-column">

        <Nav.Link
          as={NavLink}
          to="/dashboard"
          className={({ isActive }) => isActive ? "active" : ""}
          onClick={onLinkClick}
        >
          <Person className="me-2" />
          My Account
        </Nav.Link>

        <Nav.Link
          as={NavLink}
          to="/dashboard/orders"
          className={({ isActive }) => isActive ? "active" : ""}
          onClick={onLinkClick}
        >
          <BoxSeam className="me-2" />
          Orders
        </Nav.Link>

        <Nav.Link
          as={NavLink}
          to="/dashboard/address"
          className={({ isActive }) => isActive ? "active" : ""}
          onClick={onLinkClick}
        >
          <GeoAlt className="me-2" />
          Address Book
        </Nav.Link>

        <Nav.Link
          as={NavLink}
          to="/dashboard/wishlist"
          className={({ isActive }) => isActive ? "active" : ""}
          onClick={onLinkClick}
        >
          <Heart className="me-2" />
          Wishlist
        </Nav.Link>

        <hr />

        <Nav.Link
          onClick={() => {
            logout();
            onLinkClick && onLinkClick();
          }}
        >
          Logout
        </Nav.Link>

      </Nav>
    </div>
  );
}