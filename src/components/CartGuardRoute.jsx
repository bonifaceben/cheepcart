import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import { CheckoutSkeleton } from "./Skeleton";

export default function CartGuardRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasItems, setHasItems] = useState(false);

  useEffect(() => {
    const checkCart = async () => {
      const token = localStorage.getItem("cheepcart_token");

      try {
        const res = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const items = data.cart?.items || [];

        setHasItems(items.length > 0);
      } catch (err) {
        console.error("Cart check error:", err);
        setHasItems(false);
      } finally {
        setLoading(false);
      }
    };

    checkCart();
  }, []);

  if (loading) return <CheckoutSkeleton/>;

  // 🚫 Redirect if empty
  if (!hasItems) {
    return <Navigate to="/cart" replace />;
  }

  return children;
}