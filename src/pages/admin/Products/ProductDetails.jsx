import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from "../../../config/api";
import { FaHeart, FaRegHeart, FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa";
import './ProductDetails.css';
import { useCart } from '../../../context/CartContext'; // Import the CartContext
import {  ProductDetailsSkeleton } from '../../../components/Skeleton';

const ProductDetails = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const token = localStorage.getItem("cheepcart_token");

  // Access cart context to update the global cart state
  const { updateCart } = useCart();

  // Show toast
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });

    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 2500);
  };

  // Fetch product details safely
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/products/${slug}`);
        const data = await response.json();

        if (response.ok) {
          if (data.product) {
            setProduct(data.product);
          } else {
            setProduct(data);
          }
        } else {
          setError(data.message || 'Failed to fetch product details');
        }
      } catch (error) {
        console.error('Error fetching product details:', error);
        setError('Error fetching product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [slug]);

  // Check wishlist status
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!product?._id || !token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/wishlist`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data?.wishlist?.products) {
          const exists = data.wishlist.products.some(
            (item) => item.product === product._id || item.product?._id === product._id
          );
          setIsWishlisted(exists);
        }
      } catch (error) {
        console.error("Error checking wishlist:", error);
      }
    };

    checkWishlistStatus();
  }, [product, token]);

  // Check cart quantity for this product
  useEffect(() => {
    const checkCartQuantity = async () => {
  if (!product?._id) return;

  try {
    if (token) {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      // ✅ FIXED HERE
      if (response.ok && data?.cart?.items) {
        const existingItem = data.cart.items.find(
          (item) =>
            item.product?._id === product._id ||
            item.product === product._id
        );

        setCartQuantity(existingItem ? existingItem.quantity : 0);

        // ✅ also sync global cart count
        updateCart(data.cart.totalItems);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

      const existingItem = guestCart.find(
        (item) => item.productId === product._id
      );

      setCartQuantity(existingItem ? existingItem.quantity : 0);
    }
  } catch (error) {
    console.error("Error checking cart quantity:", error);
  }
};

    checkCartQuantity();
  }, [product, token]);

  // Image click
  const handleImageClick = (img) => {
    setSelectedImage(img);
  };

  // Close image modal
  const closeModal = () => {
    setSelectedImage(null);
  };

  // Toggle Wishlist
  const handleWishlistToggle = async () => {
    if (!token) {
      showToast("Please login to use wishlist", "error");
      return;
    }

    if (!product?._id) return;

    setWishlistLoading(true);

    try {
      const endpoint = isWishlisted
        ? `${API_BASE_URL}/wishlist/remove/${product._id}`
        : `${API_BASE_URL}/wishlist/add/${product._id}`;

      const method = isWishlisted ? "DELETE" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        showToast(
          isWishlisted ? "Removed from wishlist" : "Added to wishlist"
        );
      } else {
        showToast(data.message || "Wishlist action failed", "error");
      }
    } catch (error) {
      console.error("Wishlist error:", error);
      showToast("Something went wrong with wishlist", "error");
    } finally {
      setWishlistLoading(false);
    }
  };

  // Add first item to cart
 const handleAddToCart = async () => {
  if (!product?._id) return;

  const token = localStorage.getItem("cheepcart_token");

  setCartLoading(true);

  try {
    // =========================
    // LOGGED-IN USER → BACKEND
    // =========================
    if (token) {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const addedItem = data.cart.items.find(
          (item) =>
            item.product === product._id ||
            item.product?._id === product._id
        );

        setCartQuantity(addedItem?.quantity || 1);

        // ✅ sync navbar/cart globally
        updateCart(data.cart.totalItems);

        showToast("Added to cart");
      } else {
        showToast(data.message || "Failed to add to cart", "error");
      }
    }

    // =========================
    // GUEST USER → LOCAL STORAGE
    // =========================
    else {
      let guestCart =
        JSON.parse(localStorage.getItem("guestCart")) || [];

      const existingItemIndex = guestCart.findIndex(
        (item) => item.productId === product._id
      );

      if (existingItemIndex !== -1) {
        guestCart[existingItemIndex].quantity += 1;
      } else {
        guestCart.push({
          productId: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          image: product.images?.[0]?.secure_url || "",
          stock: product.stock,
          quantity: 1,
        });
      }

      localStorage.setItem("guestCart", JSON.stringify(guestCart));

      const updatedItem = guestCart.find(
        (item) => item.productId === product._id
      );

      setCartQuantity(updatedItem?.quantity || 1);

      // ✅ update global cart count for guest
      const total = guestCart.reduce((sum, item) => sum + item.quantity, 0);
      updateCart(total);

      showToast("Added to cart");
    }
  } catch (error) {
    console.error("Cart error:", error);
    showToast("Something went wrong", "error");
  } finally {
    setCartLoading(false);
  }
};

  // Update quantity
  const updateCartQuantity = async (newQuantity) => {
    if (!product?._id) return;
    if (newQuantity < 0) return;
    if (newQuantity > product.stock) {
      showToast("Cannot exceed available stock", "error");
      return;
    }

    const oldQuantity = cartQuantity;
    const diff = newQuantity - oldQuantity;

    setCartLoading(true);

    try {
      // =========================
      // LOGGED-IN USER
      // =========================
      if (token) {
        if (newQuantity === 0) {
          const response = await fetch(`${API_BASE_URL}/cart/remove/${product._id}`, {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await response.json();

          if (response.ok) {
            setCartQuantity(0);
            showToast("Removed from cart successfully");
            updateCart((prev) => prev - oldQuantity); // Update cart in global state
          } else {
            showToast(data.message || "Failed to remove item", "error");
          }
        } else {
          const response = await fetch(`${API_BASE_URL}/cart/update`, {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: product._id,
              quantity: newQuantity,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            setCartQuantity(newQuantity);
            showToast("Cart updated successfully");
            updateCart((prev) => prev + diff); // Update cart in global state
          } else {
            showToast(data.message || "Failed to update cart", "error");
          }
        }
      }

      // =========================
      // GUEST USER
      // =========================
      else {
        let guestCart = JSON.parse(localStorage.getItem("guestCart")) || [];

        const existingItemIndex = guestCart.findIndex(
          (item) => item.productId === product._id
        );

        if (existingItemIndex === -1 && newQuantity > 0) {
          guestCart.push({
            productId: product._id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            comparePrice: product.comparePrice,
            image: product.images?.[0]?.secure_url || "",
            stock: product.stock,
            quantity: newQuantity,
          });
        } else if (existingItemIndex !== -1) {
          if (newQuantity === 0) {
            guestCart.splice(existingItemIndex, 1);
            showToast("Removed from cart successfully");
          } else {
            guestCart[existingItemIndex].quantity = newQuantity;
            showToast("Cart updated successfully");
          }
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        setCartQuantity(newQuantity);
        updateCart((prev) => prev + diff); // Update cart in global state
      }
    } catch (error) {
      console.error("Cart update error:", error);
      showToast("Something went wrong while updating cart", "error");
    } finally {
      setCartLoading(false);
    }
  };

  if (loading) return <ProductDetailsSkeleton />
  if (error) return <p>{error}</p>;
  if (!product) return <p>Product not found.</p>;

  const mainImage = product?.images?.[0]?.secure_url || "";

  const discountPercent =
    product?.comparePrice &&
    product?.price &&
    Number(product.comparePrice) > Number(product.price)
      ? Math.round(
          ((Number(product.comparePrice) - Number(product.price)) / 
          Number(product.comparePrice)) * 100
        )
      : 0;

  return (
    <div className="product-details-container">
      <div className="product-page-layout">

        {/* LEFT - Images */}
        <div className="product-images-container">
          <div className="product-large-image">
            <img
              src={selectedImage || mainImage}
              alt={product.name}
              className="large-product-image"
              onClick={() => handleImageClick(selectedImage || mainImage)}
            />
          </div>

          <div className="product-thumbnails">
            {product.images && product.images.length > 0 ? (
              product.images.map((img, index) => (
                <img
                  key={index}
                  src={img.secure_url}
                  alt={`${product.name}-thumbnail-${index}`}
                  className="product-thumbnail"
                  onClick={() => handleImageClick(img.secure_url)}
                />
              ))
            ) : (
              <p>No thumbnails available</p>
            )}
          </div>
        </div>

        {/* CENTER - Product Details */}
        <div className="product-details">
          <div className="product-top-row">
            <div></div>
            <button
              className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
            >
              {isWishlisted ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>

          <h2>{product.name}</h2>
          <p><strong>Brand:</strong> {product.brand}</p>

          <div className="price-row">
            <p className="product-details-price">
              ₦{Number(product.price || 0).toLocaleString()}
            </p>

            {product.comparePrice && (
              <>
                <span className="compare-price">
                  ₦{Number(product.comparePrice).toLocaleString()}
                </span>

                {discountPercent > 0 && (
                  <span className="discount-badge">-{discountPercent}%</span>
                )}
              </>
            )}
          </div>

          <p><strong>Availability:</strong> {product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
          <p><strong>Rating:</strong> {product.averageRating || 0} ⭐</p>

          {/* CART UI */}
          {cartQuantity === 0 ? (
            <button
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock <= 0}
            >
              <FaShoppingCart className="cart-icon" />
              {cartLoading
                ? "Adding..."
                : product.stock <= 0
                ? "Out of Stock"
                : "Add to Cart"}
            </button>
          ) : (
            <div className="cart-quantity-wrapper">
              <div className="cart-quantity-control">
                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(cartQuantity - 1)}
                  disabled={cartLoading}
                >
                  <FaMinus />
                </button>

                <span className="qty-count">{cartQuantity}</span>

                <button
                  className="qty-btn"
                  onClick={() => updateCartQuantity(cartQuantity + 1)}
                  disabled={cartLoading || cartQuantity >= product.stock}
                >
                  <FaPlus />
                </button>
              </div>

              <p className="cart-added-text">{cartQuantity} item(s) added</p>
            </div>
          )}
        </div>

        {/* RIGHT - Delivery */}
        <div className="delivery-column">
          <div className="delivery-card">
            <h3>DELIVERY & RETURNS</h3>

            <div className="delivery-box">
              <p className="delivery-title">Choose your location</p>

              <select className="delivery-select">
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Ibadan</option>
                <option>Port Harcourt</option>
              </select>

              <select className="delivery-select">
                <option>LEKKI-AJAH (SANGOTEDO)</option>
                <option>IKEJA</option>
                <option>YABA</option>
                <option>SURULERE</option>
              </select>
            </div>

            <div className="pickup-station">
              <h4>Pickup Station</h4>
              <p><strong>Delivery Fees:</strong> ₦5,600</p>
              <p>
                Ready for pickup between 01 April and 02 April if you place your order
                within 3hrs 41mins
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="product-description">
        <h3>Description</h3>
        <p>{product.description}</p>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="image-modal" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-modal" onClick={closeModal}>✖</span>
            <img src={selectedImage} alt="Selected" className="modal-image" />
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast.show && (
  <div className={`top-toast-bar ${toast.type}`}>
    <div className="top-toast-content">
      <span className="top-toast-icon">✔</span>
      <span className="top-toast-message">{toast.message}</span>
    </div>

    <button
      className="top-toast-close"
      onClick={() => setToast({ show: false, message: "", type: "success" })}
    >
      ✕
    </button>
  </div>
)}
    </div>
  );
};

export default ProductDetails;