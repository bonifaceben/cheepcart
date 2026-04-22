import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { EyeFill, EyeSlashFill } from "react-bootstrap-icons";
import "./Auth.css";
import icon2 from "../assets/icon2.png";

export default function ResetPassword() {
  const navigate = useNavigate();

  const email = sessionStorage.getItem("cheepcart_reset_email");
  const resetToken = sessionStorage.getItem("cheepcart_reset_token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // 🔐 Guard (ONLY if not success)
  useEffect(() => {
    if (!success && (!email || !resetToken)) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, resetToken, navigate, success]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resetToken}`
        },
        body: JSON.stringify({
          newPassword
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Reset failed.");
      }

      // ✅ SHOW SUCCESS FIRST
      setSuccess(true);

      // ⏳ Wait before cleanup + redirect
      setTimeout(() => {
        sessionStorage.removeItem("cheepcart_reset_email");
        sessionStorage.removeItem("cheepcart_reset_token");

        navigate("/login", { replace: true });
      }, 2500);

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
            <h4 className="cc-success-title">
              🎉 Password Reset Successful!
            </h4>
            <p className="cc-success-text">
              Redirecting to login...
            </p>
            
          </div>
        ) : (
          <>
            <h3 className="cc-auth-title">Set New Password</h3>

            {error && <Alert variant="danger">{error}</Alert>}

            <Form onSubmit={handleSubmit}>

              <div className="cc-password-wrapper">
                <Form.Control
                  className="cc-auth-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <span
                  className="cc-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </span>
              </div>

              <Form.Control
                className="cc-auth-input"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button
                type="submit"
                className={`cc-auth-btn ${loading ? "cc-auth-btn-loading" : ""}`}
              >
                {loading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>

            </Form>
          </>
        )}
      </Container>
    </div>
  );
}
