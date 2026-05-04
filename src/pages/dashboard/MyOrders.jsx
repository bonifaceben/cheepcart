import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./orders.css";

export default function MyOrders() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState({
    type: null,
    orderId: null,
    message: "",
    loading: false,
  });

  // ================= FETCH =================
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/orders/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          const sorted = data.orders.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // ================= MODAL =================
  const openModal = (type, id, e) => {
    e.stopPropagation();
    setModal({ type, orderId: id, message: "", loading: false });
  };

  const closeModal = () => {
    if (modal.loading) return;
    setModal({ type: null, orderId: null, message: "", loading: false });
  };

  // ================= CONFIRM =================
  const handleConfirm = async () => {
    const { type, orderId } = modal;

    try {
      setModal((prev) => ({ ...prev, loading: true }));

      let res;

      // 🔥 FIXED: USE DELETE FOR CANCEL
      if (type === "cancel") {
        res = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      if (type === "delete") {
        res = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }

      const data = await res.json();

      // HANDLE BACKEND ERROR
      if (!res.ok) {
        setModal((prev) => ({
          ...prev,
          message: data.message || "Something went wrong",
          loading: false,
        }));
        return;
      }

      // SUCCESS
      if (type === "cancel") {
        setOrders((prev) =>
          prev.map((o) =>
            o._id === orderId
              ? { ...o, orderStatus: "cancelled" }
              : o
          )
        );
      }

      if (type === "delete") {
        setOrders((prev) =>
          prev.filter((o) => o._id !== orderId)
        );
      }

      closeModal();

    } catch (err) {
      console.error(err);
      setModal((prev) => ({
        ...prev,
        message: "Network error",
        loading: false,
      }));
    }
  };

  // ================= UI =================
  if (loading) return <p style={{ padding: 20 }}>Loading...</p>;

  return (
    <div className="orders-container">
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          className="order-card clickable"
          onClick={() => navigate(`/dashboard/orders/${order._id}`)}
        >

          {/* HEADER */}
          <div className="order-header">
            <div>
              <strong>{order.orderNumber}</strong>
              <p className="order-date">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>

            <span className={`status ${order.orderStatus}`}>
              {order.orderStatus}
            </span>
          </div>

          {/* ITEMS */}
          <div className="order-items">
            {order.items?.map((item, i) => (
              <div key={i} className="order-item">
                <img src={item.image} alt={item.name} />
                <div>
                  <p>{item.name}</p>
                  <small>
                    ₦{item.price.toLocaleString()} × {item.quantity}
                  </small>
                </div>
              </div>
            ))}
          </div>

          {/* FOOTER */}
          <div className="order-footer">
            <span>
              ₦{order.pricing?.totalAmount?.toLocaleString()}
            </span>

            <span className={`payment ${order.paymentStatus}`}>
              {order.paymentStatus}
            </span>
          </div>

          {/* ACTIONS */}
          <div className="order-actions">

            {order.orderStatus !== "cancelled" && (
              <button
                className="cancel-btn"
                disabled={order.paymentStatus === "paid"}
                onClick={(e) => openModal("cancel", order._id, e)}
              >
                {order.paymentStatus === "paid"
                  ? "Paid Order"
                  : "Cancel Order"}
              </button>
            )}

            {order.orderStatus === "cancelled" && (
              <button
                className="delete-btn"
                onClick={(e) => openModal("delete", order._id, e)}
              >
                Delete Order
              </button>
            )}

          </div>
        </div>
      ))}

      {/* MODAL */}
      {modal.type && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>
              {modal.type === "cancel"
                ? "Cancel Order"
                : "Delete Order"}
            </h3>

            <p>
              {modal.type === "cancel"
                ? "Are you sure you want to cancel this order?"
                : "This action cannot be undone."}
            </p>

            {modal.message && (
              <p className="error-text">{modal.message}</p>
            )}

            <div className="modal-actions">
              <button onClick={closeModal} disabled={modal.loading}>
                No
              </button>

              <button
                className="btn-danger"
                onClick={handleConfirm}
                disabled={modal.loading}
              >
                {modal.loading ? "Processing..." : "Yes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}