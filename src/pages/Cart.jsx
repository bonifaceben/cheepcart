import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../config/api";
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./Cart.css";
import { CartSkeleton } from "../components/Skeleton";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const token = localStorage.getItem("cheepcart_token");
  const navigate = useNavigate();

  const { updateCart, fetchCartItemCount } = useCart();

  // ================= CHECKOUT NAVIGATION =================
  const handleCheckout = () => {
    const token = localStorage.getItem("cheepcart_token");

    if (token) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=checkout");
    }
  };

  // ================= TOAST =================
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // ================= LOAD CART =================
  const loadCart = async () => {
    setLoading(true);

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCartItems(data.cart?.items || []);
        } else {
          showToast(data.message || "Failed to load cart", "error");
        }
      } else {
        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || [];
        setCartItems(guestCart);
      }
    } catch (error) {
      console.error("Error loading cart:", error);
      showToast("Something went wrong while loading cart", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // ================= UPDATE QUANTITY =================
  const updateQuantity = async (productId, newQuantity, stock) => {
    if (newQuantity < 1) return;
    if (newQuantity > stock) {
      showToast("Cannot exceed available stock", "error");
      return;
    }

    setCartLoading(true);

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/cart/update`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            quantity: newQuantity,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setCartItems((prev) =>
            prev.map((item) =>
              (item.product?._id || item.productId) === productId
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
          showToast("Cart updated successfully");
          await loadCart();
          fetchCartItemCount();
        } else {
          showToast(data.message || "Failed to update cart", "error");
        }
      } else {
        const updatedCart = cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newQuantity }
            : item
        );

        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        showToast("Cart updated successfully");
        updateCart(newQuantity);
      }
    } catch (error) {
      console.error("Cart update error:", error);
      showToast("Something went wrong while updating cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  // ================= REMOVE ITEM =================
  const removeItem = async (productId) => {
    setCartLoading(true);

    try {
      if (token) {
        const response = await fetch(
          `${API_BASE_URL}/cart/remove/${productId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setCartItems((prev) =>
            prev.filter(
              (item) =>
                (item.product?._id || item.productId) !== productId
            )
          );
          showToast("Item removed successfully");
          await loadCart();
          fetchCartItemCount();
        } else {
          showToast(data.message || "Failed to remove item", "error");
        }
      } else {
        const updatedCart = cartItems.filter(
          (item) => item.productId !== productId
        );
        localStorage.setItem("guestCart", JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        showToast("Item removed successfully");
        await loadCart();
        fetchCartItemCount();
      }
    } catch (error) {
      console.error("Remove item error:", error);
      showToast("Something went wrong while removing item", "error");
    } finally {
      setCartLoading(false);
    }
  };

  // ================= CLEAR CART =================
  const clearCart = async () => {
    setCartLoading(true);

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/cart/clear`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          setCartItems([]);
          showToast("Cart cleared successfully");
          updateCart(0);
        } else {
          showToast(data.message || "Failed to clear cart", "error");
        }
      } else {
        localStorage.removeItem("guestCart");
        setCartItems([]);
        showToast("Cart cleared successfully");
        updateCart(0);
      }
    } catch (error) {
      console.error("Clear cart error:", error);
      showToast("Something went wrong while clearing cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  // ================= CALCULATIONS =================
  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.product?.price || item.price || 0;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return (
      <div className="cart-page">
        <CartSkeleton/>
      </div>
    );
  }

  return (
    <div className="cart-page">
      {cartItems.length === 0 ? (
        <div className="empty-cart">
          <FaShoppingCart className="empty-cart-icon" />
          <h3>Your cart is empty</h3>
          <p>Looks like you haven’t added anything yet.</p>
          <button
            className="shop-now-btn"
            onClick={() => navigate("/")}
          >
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-layout">

          {/* LEFT */}
          <div className="cart-items-section">
            <div className="cart-header-row">
              <h3>Cart Items ({totalItems})</h3>
              <button
                className="clear-cart-btn"
                onClick={clearCart}
                disabled={cartLoading}
              >
                Clear Cart
              </button>
            </div>

            {cartItems.map((item, index) => {
              const product = item.product || item;
              const productId = product._id || item.productId;
              const name = product.name;
              const image =
                product.images?.[0]?.secure_url || item.image || "";
              const price = product.price || item.price || 0;
              const stock = product.stock || item.stock || 0;
              const slug = product.slug || item.slug || "";

              return (
                <div className="cart-item-card" key={index}>
                  <img
                    src={image}
                    alt={name}
                    className="cart-item-image"
                    onClick={() => navigate(`/product/${slug}`)}
                  />

                  <div className="cart-item-info">
                    <h4
                      onClick={() => navigate(`/product/${slug}`)}
                    >
                      {name}
                    </h4>

                    <p className="cart-item-price">
                      ₦{Number(price).toLocaleString()}
                    </p>

                    <p className="cart-item-stock">
                      {stock > 0 ? "In Stock" : "Out of Stock"}
                    </p>

                    <div className="cart-item-actions">
                      <div className="cart-qty-control">
                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              productId,
                              item.quantity - 1,
                              stock
                            )
                          }
                          disabled={
                            cartLoading || item.quantity <= 1
                          }
                        >
                          <FaMinus />
                        </button>

                        <span className="qty-count">
                          {item.quantity}
                        </span>

                        <button
                          className="qty-btn"
                          onClick={() =>
                            updateQuantity(
                              productId,
                              item.quantity + 1,
                              stock
                            )
                          }
                          disabled={
                            cartLoading || item.quantity >= stock
                          }
                        >
                          <FaPlus />
                        </button>
                      </div>

                      <button
                        className="remove-item-btn"
                        onClick={() => removeItem(productId)}
                        disabled={cartLoading}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT */}
          <div className="cart-summary-section">
            <h3>Cart Summary</h3>

            <div className="summary-row">
              <span>Total Items</span>
              <strong>{totalItems}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <strong>₦{subtotal.toLocaleString()}</strong>
            </div>

            <hr />

            <div className="summary-row total-row">
              <span>Total</span>
              <strong>₦{subtotal.toLocaleString()}</strong>
            </div>

            <button
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Proceed to Checkout
            </button>
          </div>

        </div>
      )}

      {/* TOAST */}
      {toast.show && (
        <div className={`top-toast-bar ${toast.type}`}>
          <div className="top-toast-content">
            <span className="top-toast-icon">✔</span>
            <span className="top-toast-message">
              {toast.message}
            </span>
          </div>

          <button
            className="top-toast-close"
            onClick={() =>
              setToast({
                show: false,
                message: "",
                type: "success",
              })
            }
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Cart;