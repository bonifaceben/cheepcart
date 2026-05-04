import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./order-details.css";

export default function OrderDetails() {
  const { id } = useParams();
  const { token } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/orders/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();

        if (data.order) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) return <p>Loading order...</p>;
  if (!order) return <p>Order not found</p>;

  return (
    <div className="order-details">

      <h2>{order.orderNumber}</h2>
      <p className="date">
        {new Date(order.createdAt).toLocaleString()}
      </p>

      {/* STATUS */}
      <div className="status-row">
        <span className={`status ${order.orderStatus}`}>
          {order.orderStatus}
        </span>

        <span className={`payment ${order.paymentStatus}`}>
          {order.paymentStatus}
        </span>
      </div>

      {/* ITEMS */}
      <div className="section">
        <h3>Items</h3>

        {order.items.map((item, i) => (
          <div key={i} className="item">

            <img src={item.image} alt={item.name} />

            <div>
              <p>{item.name}</p>
              <small>
                ₦{item.price.toLocaleString()} x {item.quantity}
              </small>
              <strong>
                ₦{item.subtotal.toLocaleString()}
              </strong>
            </div>

          </div>
        ))}
      </div>

      {/* ADDRESS */}
      <div className="section">
        <h3>Shipping Address</h3>

        <p>{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.phone}</p>
        <p>
          {order.shippingAddress.addressLine1},{" "}
          {order.shippingAddress.city},{" "}
          {order.shippingAddress.state}
        </p>
      </div>

      {/* PAYMENT */}
      <div className="section">
        <h3>Payment</h3>
        <p>Method: {order.paymentMethod}</p>
        <p>Status: {order.paymentStatus}</p>
      </div>

      {/* BREAKDOWN */}
      <div className="section">
        <h3>Order Summary</h3>

        <div className="summary-row">
          <span>Subtotal</span>
          <span>₦{order.pricing.subtotal.toLocaleString()}</span>
        </div>

        <div className="summary-row">
          <span>Delivery</span>
          <span>₦{order.pricing.deliveryFee.toLocaleString()}</span>
        </div>

        <div className="summary-row">
          <span>VAT</span>
          <span>₦{order.pricing.vatAmount.toLocaleString()}</span>
        </div>

        <div className="summary-row total">
          <span>Total</span>
          <span>₦{order.pricing.totalAmount.toLocaleString()}</span>
        </div>
      </div>


      

    </div>
  );
}