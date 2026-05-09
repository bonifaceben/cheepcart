import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import "./admin-preorders.css";

export default function AdminPreOrders() {
  const { token } = useAuth();

  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/pre-order-products/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // SAFELY HANDLE RESPONSE
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
            "Failed to fetch products"
        );
      }

      setProducts(data.products || []);

    } catch (err) {
      console.error(err);
      alert(
        err.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // DELETE PRODUCT
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product?"
    );

    if (!confirmDelete) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/pre-order-products/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // SAFELY HANDLE RESPONSE
      let data = {};

      const text = await res.text();

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message || "Delete failed"
        );
      }

      alert(
        data.message ||
          "Pre-order product removed"
      );

      // REMOVE FROM UI
      setProducts((prevProducts) =>
        prevProducts.filter(
          (product) => product._id !== id
        )
      );

    } catch (err) {
      console.error(err);

      alert(
        err.message || "Delete failed"
      );
    }
  };

  if (loading) {
    return (
      <div className="admin-preorders-loading">
        Loading pre-orders...
      </div>
    );
  }

  return (
    <div className="admin-preorders-container">

      {/* HEADER */}
      <div className="admin-preorders-header">

        <h2>Pre-Order Products</h2>

        <span>
          Total Products: {products.length}
        </span>

      </div>

      {/* EMPTY */}
      {products.length === 0 ? (
        <div className="empty-products">
          No pre-order products found
        </div>
      ) : (
        <div className="preorders-table">

          {products.map((product) => (
            <div
              className="preorder-row"
              key={product._id}
            >

              {/* IMAGE */}
              <div className="preorder-image-box">

                <img
                  src={
                    product.images?.[0]
                      ?.secure_url ||
                    product.image?.secure_url
                  }
                  alt={product.name}
                  className="preorder-image"
                />

              </div>

              {/* NAME */}
              <div className="preorder-name">
                {product.name}
              </div>

              {/* ID */}
              <div className="preorder-id">
                #{product._id}
              </div>

              {/* PRICE */}
              <div className="preorder-price">
                {product.price
                  ? `₦${product.price.toLocaleString()}`
                  : "No Price"}
              </div>

              {/* IMAGE COUNT */}
              <div className="preorder-count">
                {product.images?.length || 1}
              </div>

              {/* ACTIONS */}
              <div className="preorder-actions">

                {/* EDIT */}
                <button
                  className="edit-btn"
                  onClick={() =>
                    navigate(
                      `/admin/pre-orders/edit/${product._id}`
                    )
                  }
                >
                  <FiEdit />
                </button>

                {/* DELETE */}
                <button
                  className="delete-btn"
                  onClick={() =>
                    handleDelete(product._id)
                  }
                >
                  <FiTrash2 />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}