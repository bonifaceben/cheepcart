import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./preorder-admin.css";

export default function CreatePreOrder() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "available",
    displayOrder: 1,
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload an image");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // TEXT
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // FILE
      formData.append("image", file);

      const res = await fetch(`${API_BASE_URL}/pre-order-products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        alert("Pre-order created successfully!");

        setForm({
          name: "",
          description: "",
          price: "",
          status: "available",
          displayOrder: 1,
        });

        setFile(null);
      } else {
        alert(data.message || "Error creating product");
      }

    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="preorder-admin-container">
      <h2>Create Pre-Order Product</h2>

      <form onSubmit={handleSubmit} className="preorder-form">

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />

        <input
          type="number"
          name="price"
          placeholder="Price (optional)"
          value={form.price}
          onChange={handleChange}
        />

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="available">Available</option>
          <option value="coming_soon">Coming Soon</option>
          <option value="closed">Closed</option>
        </select>

        <input
          type="number"
          name="displayOrder"
          value={form.displayOrder}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Create Product"}
        </button>

      </form>
    </div>
  );
}