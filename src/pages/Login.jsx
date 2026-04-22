import { useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext"; // ✅ NEW
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { fetchCartItemCount } = useCart(); // ✅ NEW

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  // 🔥 MERGE GUEST CART FUNCTION
  const mergeGuestCart = async () => {
    const token = localStorage.getItem("cheepcart_token");
    const guestCart =
      JSON.parse(localStorage.getItem("guestCart")) || [];

    if (!token || guestCart.length === 0) return;

    try {
      for (const item of guestCart) {
        await fetch(`${API_BASE_URL}/cart/add`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        });
      }

      // ✅ clear guest cart after merge
      localStorage.removeItem("guestCart");

      console.log("Guest cart merged successfully");
    } catch (error) {
      console.error("Merge cart error:", error);
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!formData.email || !formData.password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Login failed.");
      }

      // ✅ Save token + user in context
      login(data.token, data.user);

      // ✅ Ensure token is stored
      localStorage.setItem("cheepcart_token", data.token);

      // 🔥 MERGE guest cart into backend
      await mergeGuestCart();

      // 🔥 Update cart globally (navbar, etc.)
      await fetchCartItemCount();

      setIsLoggedIn(true);

      // 🔥 Redirect based on role
      setTimeout(() => {
        if (data.user.role === "admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      }, 2000);

    } catch (err) {
      if (err.name === "TypeError") {
        setError("Network error. Please check your connection.");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc-auth-wrapper">
      <Container className="cc-auth-card">

        <div className="cc-auth-icon">
          <img src={icon2} alt="Cheepcart Logo" className="cc-auth-logo" />
        </div>

        {isLoggedIn ? (
          <div className="cc-success-box">
            <h4 className="cc-success-title">
              🎉 Login Successful!
            </h4>
            <p className="cc-success-text">
              Redirecting to your dashboard...
            </p>
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">Login to your account</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>

              <Form.Control
                className="cc-auth-input"
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
              />

              <div className="cc-password-wrapper">
                <Form.Control
                  className="cc-auth-input"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />

                <span
                  className="cc-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </span>
              </div>

              <Button
                type="submit"
                className={`cc-auth-btn ${loading ? "cc-auth-btn-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      className="me-2"
                    />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>

            </Form>

            <div className="cc-auth-extra">
              <Link to="/forgot-password">
                Forgot your password?
              </Link>
            </div>

            <div className="cc-auth-extra">
              <span>Don't have an account? </span>
              <Link to="/register">
                Register
              </Link>
            </div>
          </>
        )}

      </Container>
    </div>
  );
}