import { useState } from "react";
import {
  Navbar,
  Container,
  Form,
  Button,
  Dropdown
} from "react-bootstrap";

import { Link, useNavigate } from "react-router-dom";

import {
  Person,
  QuestionCircle,
  Cart
} from "react-bootstrap-icons";

import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

import CategoryDrawer from "./CategoryDrawer";

import "./Header.css";

import logo from "../../assets/logo.png";

export default function Header() {

  const [showCategories, setShowCategories] = useState(false);

  // 🔥 SEARCH STATE
  const [search, setSearch] = useState("");

  const { user, isAuthenticated, logout } = useAuth();

  const { cartItemCount } = useCart();

  const navigate = useNavigate();

  // ================= LOGOUT =================
  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  // ================= SEARCH =================
  function handleSearch(e) {

    e.preventDefault();

    // EMPTY SEARCH
    if (!search.trim()) return;

    // GO TO SEARCH PAGE
    navigate(`/search?keyword=${search}`);

    // OPTIONAL CLEAR INPUT
    // setSearch("");
  }

  // FIRST NAME
  const firstName = user?.name?.split(" ")[0];

  return (
    <>
      <Navbar className="cc-header" bg="white">

        <Container fluid className="cc-header-inner">

          {/* ================= MENU TOGGLE ================= */}
          <button
            className="cc-menu-toggle"
            onClick={() => setShowCategories(true)}
          >
            ☰
          </button>

          {/* ================= LOGO ================= */}
          <Link to="/">
            <img
              src={logo}
              alt="Cheepcart Logo"
              className="cc-main-logo"
              style={{ cursor: "pointer" }}
            />
          </Link>

          {/* ================= SEARCH ================= */}
          <Form
            className="cc-search"
            onSubmit={handleSearch}
          >

            <input
              type="text"
              placeholder="Search products, brands and categories"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              type="submit"
              className="cc-search-btn"
            >
              Search
            </Button>

          </Form>

          {/* ================= RIGHT ACTIONS ================= */}
          <div className="cc-header-actions">

            {/* ================= ACCOUNT ================= */}
            <Dropdown align="end">

              {/* DESKTOP */}
              <Dropdown.Toggle
                variant="link"
                className="cc-account-toggle cc-action-text"
              >
                {isAuthenticated
                  ? `Hi, ${firstName}`
                  : "Account"}
              </Dropdown.Toggle>

              {/* MOBILE */}
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

                    <Dropdown.Item as={Link} to="/dashboard/orders">
                      Orders
                    </Dropdown.Item>

                    <Dropdown.Item as={Link} to="/dashboard/wishlist">
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

            {/* ================= HELP ================= */}
            <span className="cc-action-text">
              Help ▾
            </span>

            <QuestionCircle
              className="cc-action-icon"
              size={20}
            />

            {/* ================= CART ================= */}
            <span
              className="cart-wrapper"
              onClick={() => navigate("/cart")}
            >

              <Cart size={20} />

              {cartItemCount > 0 && (
                <span className="cart-item-count">
                  {cartItemCount}
                </span>
              )}

            </span>

          </div>

        </Container>

      </Navbar>

      {/* ================= CATEGORY DRAWER ================= */}
      <CategoryDrawer
        show={showCategories}
        onClose={() => setShowCategories(false)}
      />
    </>
  );
}