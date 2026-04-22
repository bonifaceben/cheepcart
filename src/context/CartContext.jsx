import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config/api";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  // 🔥 Fetch cart count globally
  const fetchCartItemCount = async () => {
    const token = localStorage.getItem("cheepcart_token"); // ✅ FIXED

    try {
      if (token) {
        const response = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        console.log("GLOBAL CART:", data); // debug

        if (response.ok) {
          // ✅ FIXED
          setCartItemCount(data.cart?.totalItems || 0);
        } else {
          setCartItemCount(0);
        }
      } else {
        const guestCart =
          JSON.parse(localStorage.getItem("guestCart")) || [];

        const total = guestCart.reduce(
          (sum, item) => sum + item.quantity,
          0
        );

        setCartItemCount(total);
      }
    } catch (error) {
      console.error("Cart fetch error:", error);
      setCartItemCount(0);
    }
  };

  // 🔥 Run on app load
  useEffect(() => {
    fetchCartItemCount();
  }, []);

  // ✅ Keep this (it's fine)
  const updateCart = (value) => {
    setCartItemCount((prev) =>
      typeof value === "function" ? value(prev) : value
    );
  };

  return (
    <CartContext.Provider
      value={{ cartItemCount, updateCart, fetchCartItemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);