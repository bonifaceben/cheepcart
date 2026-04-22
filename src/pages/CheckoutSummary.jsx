import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./checkout.css";

export default function CheckoutSummary() {
  const navigate = useNavigate();
  const location = useLocation();

  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // ================= LOAD DATA =================
  useEffect(() => {
    console.log("📦 RECEIVED STATE:", location.state);

    if (location.state && location.state.items) {
      setCheckout(location.state);
      setLoading(false);
    } else {
      console.warn("❌ No checkout data received");
      setLoading(false);
    }
  }, [location.state]);

  // ================= LOADING =================
  if (loading) {
    return <p style={{ padding: "20px" }}>Loading summary...</p>;
  }

  // ================= FALLBACK =================
  if (!checkout) {
    return (
      <div style={{ padding: "20px" }}>
        <h3>No checkout data</h3>
        <button onClick={() => navigate("/checkout")}>
          Go Back to Checkout
        </button>
      </div>
    );
  }

  const { items, pricing, billingAddress, shippingAddress } = checkout;

  // ================= PAYMENT FLOW =================
  const handlePayment = async () => {
    if (processing) return;

    setProcessing(true);

    const token = localStorage.getItem("cheepcart_token");

    try {
      console.log("🚀 Creating order...");

      // ===== CREATE ORDER =====
      const orderRes = await fetch(`${API_BASE_URL}/orders/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          billingAddress,
          shippingAddress,
          items,
          pricing,
          recipientCity: shippingAddress.redstarCityAbbr,
          recipientTownID: shippingAddress.redstarTownId,
        }),
      });

      const orderData = await orderRes.json();
      console.log("📦 ORDER RESPONSE:", orderData);

      if (!orderRes.ok) {
        throw new Error(orderData.message || "Order creation failed");
      }

      const orderId = orderData.order?._id;

      if (!orderId) {
        throw new Error("Order ID not returned");
      }

      console.log("✅ Order ID:", orderId);

      // ===== INITIALIZE PAYMENT =====
      const paymentRes = await fetch(
        `${API_BASE_URL}/payments/initialize/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const paymentData = await paymentRes.json();
      console.log("💳 PAYMENT RESPONSE:", paymentData);

      if (!paymentRes.ok) {
        throw new Error(paymentData.message || "Payment initialization failed");
      }

      // ✅ CORRECT BASED ON YOUR BACKEND
      const paymentUrl = paymentData.payment?.authorizationUrl;

      if (!paymentUrl) {
        console.log("❌ FULL PAYMENT RESPONSE:", paymentData);
        throw new Error("Payment URL not found");
      }

      // ===== REDIRECT TO PAYSTACK =====
      window.location.href = paymentUrl;

    } catch (err) {
      console.error("🔥 ERROR:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">

        {/* LEFT */}
        <div className="checkout-left">
          <h2>Order Summary</h2>

          <div className="summary-box">
            <h4>Billing Address</h4>
            <p><strong>{billingAddress.fullName}</strong></p>
            <p>{billingAddress.phone}</p>
            <p>{billingAddress.email}</p>
            <p>{billingAddress.addressLine1}</p>
            <p>{billingAddress.city}, {billingAddress.state}</p>
          </div>

          <div className="summary-box">
            <h4>Shipping Address</h4>
            <p><strong>{shippingAddress.fullName}</strong></p>
            <p>{shippingAddress.phone}</p>
            <p>{shippingAddress.email}</p>
            <p>{shippingAddress.addressLine1}</p>
            <p>{shippingAddress.city}, {shippingAddress.state}</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="checkout-right">
          <h3>Your Order</h3>

          <div className="order-items">
            {items.map((item, i) => (
              <div key={i} className="order-item">
                <p>{item.name} × {item.quantity}</p>
                <p>₦{item.subtotal.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <hr />

          <div className="summary-row">
            <span>Subtotal</span>
            <span>₦{pricing.subtotal.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>₦{pricing.deliveryFee.toLocaleString()}</span>
          </div>

          <div className="summary-row">
            <span>VAT</span>
            <span>₦{pricing.vatAmount.toLocaleString()}</span>
          </div>

          <div className="summary-total">
            <strong>Total</strong>
            <strong>₦{pricing.totalAmount.toLocaleString()}</strong>
          </div>

          <button
            className={`place-order-btn ${processing ? "disabled-btn" : ""}`}
            onClick={handlePayment}
            disabled={processing}
          >
            {processing ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>

      </div>
    </div>
  );
}