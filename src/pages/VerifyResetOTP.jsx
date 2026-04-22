import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function VerifyResetOTP() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("cheepcart_reset_email");

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!code || code.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Invalid or expired OTP.");
      }

      // 🔥 STORE RESET TOKEN TEMPORARILY
      sessionStorage.setItem(
        "cheepcart_reset_token",
        data.resetToken
      );

      setSuccess(true);

      setTimeout(() => {
        navigate("/reset-password", { replace: true });
      }, 2000);

    } catch (err) {
      setError(err.message);
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
            <h4>OTP Verified Successfully 🎉</h4>
            <p>Redirecting to reset password...</p>
            
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">Verify Reset Code</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Control
                className="cc-auth-input"
                type="text"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, ""))
                }
              />

              <Button
                type="submit"
                className="cc-auth-btn"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </Button>
            </Form>
          </>
        )}
      </Container>
    </div>
  );
}
