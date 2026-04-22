import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";

export default function DeleteCategory({ categoryId }) {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        navigate("/admin/categories"); // Redirect to categories list after deletion
      } else {
        setError("Failed to delete category.");
      }
    } catch (err) {
      setError("Error deleting category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Delete Category</h2>

      {error && <p>{error}</p>}

      <button onClick={handleDelete} disabled={loading}>
        {loading ? "Deleting..." : "Delete Category"}
      </button>
    </div>
  );
}