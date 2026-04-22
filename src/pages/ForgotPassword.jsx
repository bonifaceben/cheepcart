import { useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      // 🔐 Always show success message (security rule)
      // Do NOT reveal if email exists

      // ✅ Store email temporarily in sessionStorage
      sessionStorage.setItem("cheepcart_reset_email", email);

      setSuccess(true);

      setTimeout(() => {
        navigate("/verify-reset-otp", { replace: true });
      }, 2500);

    } catch (err) {
      if (err.name === "TypeError") {
        setError("Network error. Please check your connection.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="cc-auth-wrapper">
      <Container className="cc-auth-card">
        <div className="cc-auth-icon">
          <img src={icon2} alt="Logo" className="cc-auth-logo" />
        </div>

        {success ? (
          <div className="cc-success-box">
            <h4>Reset Code Sent 🎉</h4>
            <p>
              If the email exists in our system, a reset OTP has been sent.
            </p>
            <Spinner animation="border" size="sm" />
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">Forgot Password</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Control
                className="cc-auth-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Button
                type="submit"
                className={`cc-auth-btn ${loading ? "cc-auth-btn-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Sending...
                  </>
                ) : (
                  "Send Reset OTP"
                )}
              </Button>
            </Form>
          </>
        )}
      </Container>
    </div>
  );
}
