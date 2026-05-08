import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import ShipmentTracker from "../../../components/ShipmentTracker"; // ✅ FIXED NAME
import "./admin-orders.css";

export default function AdminOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // FILTERS
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [shipmentStatus, setShipmentStatus] = useState("");

  // PAGINATION
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // RETRY STATE
  const [retryingId, setRetryingId] = useState(null);

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let url = `${API_BASE_URL}/orders/admin/all?page=${page}`;

      if (orderStatus) url += `&orderStatus=${orderStatus}`;
      if (paymentStatus) url += `&paymentStatus=${paymentStatus}`;
      if (shipmentStatus) url += `&shipmentStatus=${shipmentStatus}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
        setPages(data.pages || 1);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderStatus, paymentStatus, shipmentStatus, page]);

  // ================= RETRY SHIPMENT =================
  const handleRetryShipment = async (orderId) => {
    try {
      setRetryingId(orderId);

      const res = await fetch(
        `${API_BASE_URL}/shipments/create/${orderId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create shipment");
      }

      alert("Shipment created successfully");

      fetchOrders();

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setRetryingId(null);
    }
  };

  if (loading) return <p className="p-3">Loading orders...</p>;

  return (
    <div className="admin-orders-container">
      <h2>All Orders</h2>

      {/* 🔥 GLOBAL TRACKING INPUT */}
      <ShipmentTracker />

      {/* ================= FILTERS ================= */}
      <div className="filters">

        <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <option value="">All Payments</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>

        <select value={shipmentStatus} onChange={(e) => setShipmentStatus(e.target.value)}>
          <option value="">All Shipments</option>
          <option value="not_created">Not Created</option>
          <option value="created">Created</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
        </select>

      </div>

      {/* ================= TABLE ================= */}
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Order Status</th>
              <th>Shipment</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>

                <td>
                  <strong>{order.orderNumber}</strong>
                </td>

                <td>
                  <p>{order.customer?.name}</p>
                  <small>{order.customer?.email}</small>
                </td>

                <td>
                  ₦{order.totalAmount?.toLocaleString()}
                </td>

                <td>
                  <span className={`payment ${order.paymentStatus}`}>
                    {order.paymentStatus}
                  </span>
                </td>

                <td>
                  <span className={`status ${order.orderStatus}`}>
                    {order.orderStatus}
                  </span>
                </td>

                <td>
                  <span className={`shipment ${order.shipmentStatus}`}>
                    {order.shipmentStatus}
                  </span>

                  {order.trackingNumber && (
                    <div className="tracking">
                      {order.trackingNumber}
                    </div>
                  )}

                  {order.shipmentStatus === "not_created" && (
                    <button
                      className="retry-btn"
                      onClick={() => handleRetryShipment(order.id)}
                      disabled={retryingId === order.id}
                    >
                      {retryingId === order.id ? "Creating..." : "Retry Shipment"}
                    </button>
                  )}
                </td>

                <td>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= PAGINATION ================= */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>

        <span>Page {page} of {pages}</span>

        <button disabled={page === pages} onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>

      {orders.length === 0 && <p className="empty">No orders found</p>}
    </div>
  );
}