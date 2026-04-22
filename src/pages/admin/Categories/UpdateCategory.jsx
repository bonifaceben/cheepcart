import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function UpdateCategory() {
  const { token } = useAuth();
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [category, setCategory] = useState({ name: "", order: 1, image: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
        const data = await response.json();
        if (response.ok) {
          setCategory(data);
        } else {
          setError("Failed to fetch category details.");
        }
      } catch (err) {
        setError("Error fetching category.");
      }
    };

    fetchCategory();
  }, [categoryId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(category),
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/admin/categories"); // Redirect to categories list after update
      } else {
        setError("Failed to update category.");
      }
    } catch (err) {
      setError("Error updating category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Update Category</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name</label>
          <input
            type="text"
            value={category.name}
            onChange={(e) => setCategory({ ...category, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Order</label>
          <input
            type="number"
            value={category.order}
            onChange={(e) => setCategory({ ...category, order: e.target.value })}
            required
          />
        </div>

        <div>
          <label>Image URL</label>
          <input
            type="text"
            value={category.image}
            onChange={(e) => setCategory({ ...category, image: e.target.value })}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Category"}
        </button>
      </form>
    </div>
  );
}