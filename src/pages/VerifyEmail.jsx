import { useEffect, useState } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function VerifyEmail() {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const userId = localStorage.getItem("cheepcart_userId");
  const email = localStorage.getItem("cheepcart_email");

  // 🔐 ROUTE GUARD
  useEffect(() => {
  if (!userId || !email) {
    // Only redirect if not already verified
    if (!isVerified) {
      navigate("/register", { replace: true });
    }
  }
}, [navigate, userId, email, isVerified]);


  // ⏳ Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    if (!code) {
      setError("Please enter the OTP sent to your email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, code })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Verification failed.");
      }

      // Show success
setIsVerified(true);

// Delay cleanup + redirect
setTimeout(() => {
  localStorage.removeItem("cheepcart_userId");
  localStorage.removeItem("cheepcart_email");
  navigate("/login", { replace: true });
}, 3000);

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

  async function handleResend() {
    if (resendLoading || cooldown > 0) return;

    setError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to resend OTP.");
      }

      setSuccess("A new OTP has been sent to your email.");
      setCooldown(60);

    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <div className="cc-auth-wrapper">
      <Container className="cc-auth-card">

        {/* Logo */}
        <div className="cc-auth-icon">
          <img src={icon2} alt="Cheepcart Logo" className="cc-auth-logo" />
        </div>

        {isVerified ? (
          <div className="cc-success-box">
            <h4 className="cc-success-title">
              🎉 Verification Successful!
            </h4>

            <p className="cc-success-text">
              Your email has been verified successfully.
            </p>

            <p className="cc-success-redirect">
              Redirecting you to login...
            </p>

            
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">Verify your email</h3>

            <p className="cc-auth-subtitle">
              Enter the OTP sent to <strong>{email}</strong>
            </p>

            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleVerify}>
              <Form.Control
                className="cc-auth-input"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={code}
                onChange={(e) => setCode(e.target.value)}
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
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </Form>

            {/* RESEND SECTION */}
            <div style={{ marginTop: "16px", textAlign: "center" }}>
              {cooldown > 0 ? (
                <small>
                  You can resend OTP in <strong>{cooldown}s</strong>
                </small>
              ) : (
                <Button
                  variant="link"
                  onClick={handleResend}
                  style={{ textDecoration: "none" }}
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </Button>
              )}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
