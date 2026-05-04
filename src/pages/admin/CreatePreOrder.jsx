import { useState, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./preorder-admin.css";

export default function CreatePreOrder() {
  const { token } = useAuth();
  const fileRef = useRef();

  const CLOUD_NAME = "dpqb1hpmc";
  const UPLOAD_PRESET = "cheepcart_unsigned";

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "available",
    displayOrder: 1,
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // HANDLE IMAGE
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // basic validation
    if (!file.type.startsWith("image/")) {
      alert("Only image files allowed");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be less than 2MB");
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (!imageFile) {
      alert("Please upload an image");
      return;
    }

    try {
      setLoading(true);

      // ================= CLOUDINARY =================
      const cloudData = new FormData();
      cloudData.append("file", imageFile);
      cloudData.append("upload_preset", UPLOAD_PRESET);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudData,
        }
      );

      const cloudResult = await cloudRes.json();

      if (!cloudRes.ok || !cloudResult.secure_url) {
        console.error(cloudResult);
        throw new Error("Image upload failed");
      }

      // ================= BACKEND PAYLOAD =================
      const payload = {
        name: form.name.trim(),
        description: form.description || "",
        status: form.status,
        displayOrder: Number(form.displayOrder) || 1,
        image: {
          secure_url: cloudResult.secure_url,
          public_id: cloudResult.public_id,
        },
      };

      if (form.price) {
        payload.price = Number(form.price);
      }

      // ================= API CALL =================
      const res = await fetch(`${API_BASE_URL}/pre-order-products`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      alert("Pre-order created successfully!");

      // ================= RESET =================
      setForm({
        name: "",
        description: "",
        price: "",
        status: "available",
        displayOrder: 1,
      });

      setImageFile(null);
      setPreview(null);

      if (fileRef.current) {
        fileRef.current.value = "";
      }

    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
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
          onChange={handleImageChange}
          ref={fileRef}
          required
        />

        {preview && (
          <img
            src={preview}
            alt="preview"
            style={{
              width: "120px",
              borderRadius: "8px",
              marginTop: "10px",
            }}
          />
        )}

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