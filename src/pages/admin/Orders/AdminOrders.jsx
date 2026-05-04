import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import "./admin-orders.css";

export default function AdminOrders() {
  const { token } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(""); // filter

  // ================= FETCH =================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      let url = `${API_BASE_URL}/orders/admin/all`;

      if (status) {
        url += `?orderStatus=${status}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrders(data.orders || []);
      }

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [status]);

  if (loading) return <p className="p-3">Loading orders...</p>;

  return (
    <div className="admin-orders-container">
      <h2>All Orders</h2>

      {/* FILTER */}
      <div className="order-filter">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>

                <td>
                  <strong>{order.orderNumber}</strong>
                </td>

                <td>
                  {order.customerEmail}
                </td>

                <td>
                  ₦{order.pricing?.totalAmount?.toLocaleString()}
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
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {orders.length === 0 && (
        <p className="empty">No orders found</p>
      )}
    </div>
  );
}