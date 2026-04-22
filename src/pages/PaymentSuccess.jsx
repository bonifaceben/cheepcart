import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const token = localStorage.getItem("cheepcart_token");

      // ✅ Get reference from Paystack redirect
      const query = new URLSearchParams(location.search);
      const reference = query.get("reference");

      if (!reference) {
        setStatus("error");
        setMessage("Invalid payment reference");
        setLoading(false);
        return;
      }

      try {
        console.log("🔍 Verifying payment:", reference);

        // ✅ MATCH YOUR BACKEND ROUTE
        const res = await fetch(
          `${API_BASE_URL}/payment/verify/${reference}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("✅ VERIFY RESPONSE:", data);

        if (!res.ok) {
          throw new Error(data.message || "Verification failed");
        }

        setStatus("success");
        setMessage(data.message || "Payment successful!");

        // ✅ Redirect after success
        setTimeout(() => {
          navigate("/dashboard"); // or /orders
        }, 3000);

      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage(err.message || "Payment verification failed");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [location.search]);

  // ================= UI =================
  if (loading) {
    return <p style={{ padding: "20px" }}>Verifying payment...</p>;
  }

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      {status === "success" ? (
        <>
          <h2>✅ Payment Successful</h2>
          <p>{message}</p>
          <p>Redirecting...</p>
        </>
      ) : (
        <>
          <h2>❌ Payment Failed</h2>
          <p>{message}</p>
          <button onClick={() => navigate("/cart")}>
            Go Back to Cart
          </button>
        </>
      )}
    </div>
  );
}