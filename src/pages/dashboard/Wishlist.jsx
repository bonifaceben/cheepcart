// Wishlist.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { FaTrash, FaHeart } from "react-icons/fa";
import "./wishlist.css";

export default function Wishlist() {

  const navigate = useNavigate();

  const token = localStorage.getItem("cheepcart_token");

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH WISHLIST =================
  useEffect(() => {

    fetchWishlist();

  }, []);

  const fetchWishlist = async () => {

    try {

      setLoading(true);

      const response = await fetch(
        `${API_BASE_URL}/users/wishlist`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWishlist(data.wishlist || []);
      }

    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================= REMOVE ITEM =================
  const removeWishlistItem = async (productId) => {

    try {

      const response = await fetch(
        `${API_BASE_URL}/users/wishlist/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        setWishlist((prev) =>
          prev.filter((item) => item._id !== productId)
        );

      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ================= CLEAR WISHLIST =================
  const clearWishlist = async () => {

    const confirmClear = window.confirm(
      "Clear entire wishlist?"
    );

    if (!confirmClear) return;

    try {

      const response = await fetch(
        `${API_BASE_URL}/users/wishlist`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setWishlist([]);
      } else {
        alert(data.message);
      }

    } catch (error) {
      console.error(error);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="wishlist-page">
        <p>Loading wishlist...</p>
      </div>
    );
  }

  return (
    <div className="wishlist-page">

      {/* ================= HEADER ================= */}
      <div className="wishlist-header">

        <div className="wishlist-title">

          <FaHeart className="wishlist-icon" />

          <div>
            <h2>My Wishlist</h2>
            <p>{wishlist.length} item(s)</p>
          </div>

        </div>

        {wishlist.length > 0 && (
          <button
            className="clear-wishlist-btn"
            onClick={clearWishlist}
          >
            Clear Wishlist
          </button>
        )}

      </div>

      {/* ================= EMPTY ================= */}
      {wishlist.length === 0 ? (

        <div className="empty-wishlist">

          <FaHeart className="empty-heart" />

          <h3>Your wishlist is empty</h3>

          <p>
            Products you save will appear here.
          </p>

        </div>

      ) : (

        <div className="wishlist-grid">

          {wishlist.map((product) => (

            <div
              key={product._id}
              className="wishlist-card"
            >

              {/* IMAGE */}
              <div
                className="wishlist-image-box"
                onClick={() =>
                  navigate(`/product/${product.slug}`)
                }
              >
                <img
                  src={product.images?.[0]?.secure_url || ""}
                  alt={product.name}
                />
              </div>

              {/* CONTENT */}
              <div className="wishlist-content">

                <h4
                  onClick={() =>
                    navigate(`/product/${product.slug}`)
                  }
                >
                  {product.name}
                </h4>

                <p className="wishlist-price">
                  ₦{Number(product.price).toLocaleString()}
                </p>

                {/* ACTIONS */}
                <div className="wishlist-actions">

                  <button
                    className="view-product-btn"
                    onClick={() =>
                      navigate(`/product/${product.slug}`)
                    }
                  >
                    View Product
                  </button>

                  <button
                    className="remove-btn"
                    onClick={() =>
                      removeWishlistItem(product._id)
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}