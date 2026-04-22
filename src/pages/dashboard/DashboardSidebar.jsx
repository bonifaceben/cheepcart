import { Nav } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  Person,
  BoxSeam,
  Heart,
  GeoAlt
} from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";

export default function DashboardSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="cc-sidebar">

      <div className="cc-sidebar-user">
        <Person size={24} />
        <div>
          <strong>Hi, {user?.name?.split(" ")[0]}</strong>
        </div>
      </div>

      <Nav className="flex-column">

        <Nav.Link
          as={Link}
          to="/dashboard/profile"
          active={location.pathname.includes("profile")}
        >
          <Person className="me-2" />
          My Account
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/dashboard/orders"
        >
          <BoxSeam className="me-2" />
          Orders
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/dashboard/address"
        >
          <GeoAlt className="me-2" />
          Address Book
        </Nav.Link>

        <Nav.Link
          as={Link}
          to="/dashboard/wishlist"
        >
          <Heart className="me-2" />
          Wishlist
        </Nav.Link>

        <hr />

        <Nav.Link onClick={logout}>
          Logout
        </Nav.Link>

      </Nav>
    </div>
  );
}
