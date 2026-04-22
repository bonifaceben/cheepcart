import { useState } from "react";
import { Navbar, Container, Form, Button, Dropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { Person, QuestionCircle, Cart } from "react-bootstrap-icons";
import { useAuth } from "../../context/AuthContext";
import CategoryDrawer from "./CategoryDrawer";
import "./Header.css";
import logo from "../../assets/logo.png";
import { useCart } from "../../context/CartContext";  // Import the CartContext

export default function Header() {
  const [showCategories, setShowCategories] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const { cartItemCount } = useCart(); // Access the cartItemCount from CartContext
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  // Extract first name
  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <Navbar className="cc-header" bg="white">
        <Container fluid className="cc-header-inner">

          {/* Menu toggle */}
          <button
            className="cc-menu-toggle"
            onClick={() => setShowCategories(true)}
          >
            ☰
          </button>

          {/* Logo */}
         <Link to="/">
  <img
    src={logo}
    alt="Cheepcart Logo"
    className="cc-main-logo"
    style={{ cursor: "pointer" }}
  />
</Link>

          {/* Search */}
          <Form className="cc-search">
            <input
              type="text"
              placeholder="Search products, brands and categories"
            />
            <Button className="cc-search-btn">Search</Button>
          </Form>

          {/* Right actions */}
          <div className="cc-header-actions">

            {/* ACCOUNT DROPDOWN */}
            <Dropdown align="end">

              {/* Desktop toggle */}
              <Dropdown.Toggle
                variant="link"
                className="cc-account-toggle cc-action-text"
              >
                {isAuthenticated
                  ? `Hi, ${firstName}`
                  : "Account"}
              </Dropdown.Toggle>

              {/* Mobile toggle */}
              <Dropdown.Toggle
                variant="link"
                className="cc-account-toggle cc-action-icon"
              >
                <Person size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu>

                {!isAuthenticated ? (
                  <>
                    <Dropdown.Item as={Link} to="/login">
                      Sign In
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/register">
                      Register
                    </Dropdown.Item>
                  </>
                ) : (
                  <>
                    <Dropdown.Item as={Link} to="/dashboard">
                      My Account
                    </Dropdown.Item>

                    <Dropdown.Item as={Link} to="/orders">
                      Orders
                    </Dropdown.Item>

                    <Dropdown.Item as={Link} to="/wishlist">
                      Wishlist
                    </Dropdown.Item>

                    <Dropdown.Divider />

                    <Dropdown.Item onClick={handleLogout}>
                      Logout
                    </Dropdown.Item>
                  </>
                )}

              </Dropdown.Menu>
            </Dropdown>

            {/* Help */}
            <span className="cc-action-text">Help ▾</span>
            <QuestionCircle className="cc-action-icon" size={20} />

            {/* Cart */}
            <span className="cart-wrapper" onClick={() => navigate("/cart")}>
  <Cart size={20} />
  {cartItemCount > 0 && (
    <span className="cart-item-count">{cartItemCount}</span>
  )}
</span>
            
          </div>

        </Container>
      </Navbar>

      <CategoryDrawer
        show={showCategories}
        onClose={() => setShowCategories(false)}
      />
    </>
  );
}