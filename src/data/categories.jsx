import {
  useEffect,
  useState,
} from "react";

import { API_BASE_URL } from "../config/api";

export function useCategories() {
  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/categories`
        );

        const data = await res.json();

        if (data.success) {
          const activeCategories =
            data.categories
              ?.filter(
                (cat) => cat.isActive
              )
              ?.sort(
                (a, b) =>
                  a.order - b.order
              );

          setCategories(
            activeCategories || []
          );
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return {
    categories,
    loading,
  };
}