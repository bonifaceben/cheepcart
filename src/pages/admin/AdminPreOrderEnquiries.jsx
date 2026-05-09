import { useEffect, useState } from "react";
import { FiTrash2 } from "react-icons/fi";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./admin-preorder-enquiries.css";

export default function AdminPreOrderEnquiries() {
  const { token } = useAuth();

  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState(null);

  // FETCH ENQUIRIES
  const fetchEnquiries = async () => {
    try {
      setLoading(true);

      let url =
        `${API_BASE_URL}/pre-order-enquiries`;

      // FILTER
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // SAFE RESPONSE
      let data = {};

      const text = await res.text();

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to fetch enquiries"
        );
      }

      setEnquiries(data.enquiries || []);

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to fetch enquiries"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter]);

  // UPDATE STATUS
  const updateStatus = async (
    enquiryId,
    newStatus
  ) => {
    try {
      setUpdatingId(enquiryId);

      const res = await fetch(
        `${API_BASE_URL}/pre-order-enquiries/${enquiryId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",

            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      // SAFE RESPONSE
      let data = {};

      const text = await res.text();

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update status"
        );
      }

      // UPDATE UI
      setEnquiries((prev) =>
        prev.map((enquiry) =>
          enquiry._id === enquiryId
            ? {
                ...enquiry,
                status: newStatus,
              }
            : enquiry
        )
      );

      alert(
        data.message ||
          "Status updated successfully"
      );

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // DELETE ENQUIRY
  const deleteEnquiry = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to permanently delete this enquiry?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/pre-order-enquiries/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // SAFE RESPONSE
      let data = {};

      const text = await res.text();

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to delete enquiry"
        );
      }

      // REMOVE FROM UI
      setEnquiries((prev) =>
        prev.filter(
          (enquiry) => enquiry._id !== id
        )
      );

      alert(
        data.message ||
          "Pre-order enquiry deleted successfully"
      );

    } catch (err) {
      console.error(err);

      alert(
        err.message ||
          "Failed to delete enquiry"
      );
    }
  };

  if (loading) {
    return (
      <div className="enquiries-loading">
        Loading enquiries...
      </div>
    );
  }

  return (
    <div className="admin-enquiries-container">

      {/* HEADER */}
      <div className="enquiries-header">

        <div>
          <h2>Pre-Order Enquiries</h2>

          <p>
            Total Enquiries:
            {" "}
            {enquiries.length}
          </p>
        </div>

        {/* FILTER */}
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
        >
          <option value="">
            All Status
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="contacted">
            Contacted
          </option>

          <option value="confirmed">
            Confirmed
          </option>

          <option value="cancelled">
            Cancelled
          </option>

          <option value="completed">
            Completed
          </option>
        </select>

      </div>

      {/* EMPTY */}
      {enquiries.length === 0 ? (
        <div className="empty-enquiries">
          No enquiries found
        </div>
      ) : (
        <div className="enquiries-grid">

          {enquiries.map((enquiry) => (
            <div
              className="enquiry-card"
              key={enquiry._id}
            >

              {/* PRODUCT */}
              <div className="enquiry-product">

                <img
                  src={
                    enquiry.productSnapshot
                      ?.images?.[0]
                      ?.secure_url ||
                    enquiry.productSnapshot
                      ?.image
                      ?.secure_url
                  }
                  alt={
                    enquiry.productSnapshot
                      ?.name
                  }
                />

                <div>
                  <h3>
                    {
                      enquiry
                        .productSnapshot
                        ?.name
                    }
                  </h3>

                  <p>
                    ₦
                    {enquiry
                      .productSnapshot
                      ?.price?.toLocaleString() ||
                      "N/A"}
                  </p>
                </div>

              </div>

              {/* CUSTOMER */}
              <div className="customer-info">

                <h4>
                  {enquiry.fullName}
                </h4>

                <p>
                  {enquiry.phone}
                </p>

                <p>
                  {enquiry.email}
                </p>

                <p>
                  {enquiry.location}
                </p>

              </div>

              {/* MESSAGE */}
              <div className="message-box">

                <strong>
                  Message:
                </strong>

                <p>
                  {enquiry.message ||
                    "No message"}
                </p>

              </div>

              {/* FOOTER */}
              <div className="enquiry-footer">

                <span
                  className={`status-badge ${enquiry.status}`}
                >
                  {enquiry.status}
                </span>

                <span>
                  Qty:
                  {" "}
                  {enquiry.quantity}
                </span>

              </div>

              {/* STATUS UPDATE */}
              <div className="status-update-box">

                <label>
                  Update Status
                </label>

                <select
                  value={enquiry.status}
                  disabled={
                    updatingId ===
                    enquiry._id
                  }
                  onChange={(e) =>
                    updateStatus(
                      enquiry._id,
                      e.target.value
                    )
                  }
                >
                  <option value="pending">
                    Pending
                  </option>

                  <option value="contacted">
                    Contacted
                  </option>

                  <option value="confirmed">
                    Confirmed
                  </option>

                  <option value="cancelled">
                    Cancelled
                  </option>

                  <option value="completed">
                    Completed
                  </option>
                </select>

              </div>

              {/* DELETE BUTTON */}
              <button
                className="delete-enquiry-btn"
                onClick={() =>
                  deleteEnquiry(enquiry._id)
                }
              >
                <FiTrash2 />

                Delete Enquiry
              </button>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}