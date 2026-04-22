import { useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRegistered, setIsRegistered] = useState(false);

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Registration failed.");
      }

      const data = await res.json();

      // Save temp verification data
      localStorage.setItem("cheepcart_userId", data.userId);
      localStorage.setItem("cheepcart_email", formData.email);

      // Show success screen
      setIsRegistered(true);

      // Redirect after delay
      setTimeout(() => {
        navigate("/verify-email");
      }, 3000);

    } catch (err) {
      if (err.name === "TypeError") {
        setError("Network error. Please check your internet connection.");
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

        {/* Logo */}
        <div className="cc-auth-icon">
          <img
            src={icon2}
            alt="Cheepcart Logo"
            className="cc-auth-logo"
          />
        </div>

        {/* SUCCESS DESIGN SCREEN */}
        {isRegistered ? (
          <div className="cc-success-box">
            <h4 className="cc-success-title">
              Registration Successful 🎉
            </h4>
            <p className="cc-success-text">
              Redirecting to email verification...
            </p>
           
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">
              Create your Cheepcart account
            </h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Control
                className="cc-auth-input"
                type="text"
                name="name"
                placeholder="Full Name*"
                value={formData.name}
                onChange={handleChange}
              />

              <Form.Control
                className="cc-auth-input"
                type="email"
                name="email"
                placeholder="Email Address*"
                value={formData.email}
                onChange={handleChange}
              />

              <Form.Control
                className="cc-auth-input"
                type="tel"
                name="phone"
                placeholder="Mobile Number*"
                value={formData.phone}
                onChange={handleChange}
              />

              <Form.Control
                className="cc-auth-input"
                type="password"
                name="password"
                placeholder="Password*"
                value={formData.password}
                onChange={handleChange}
              />

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
      Creating...
    </>
  ) : (
    "Continue"
  )}
</Button>

            </Form>
          </>
        )}

      </Container>
    </div>
  );
}
