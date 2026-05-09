import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import "./AdminCategory.css";

export default function AdminCreateCategory() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [order, setOrder] = useState(1);

  // Store uploaded image object
  const [image, setImage] = useState(null); // { secure_url, public_id }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Handle image upload
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadedImage = await uploadImage(file);
      setImage(uploadedImage);
    } catch (err) {
      setError("Error uploading image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload image (NEW API)
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("images", file);
    formData.append("type", "categories");

    const response = await fetch(`${API_BASE_URL}/upload/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.success) {
      return data.images[0]; // { secure_url, public_id }
    } else {
      throw new Error(data.message || "Upload failed");
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setImage(null);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !image) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const categoryData = {
        name,
        order,
        image: image.secure_url, // ✅ FIXED FOR BACKEND
      };

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        navigate("/admin/categories");
      } else {
        throw new Error(jsonResponse.message || "Failed to create category.");
      }
    } catch (error) {
      setError("Error creating category. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-category">
      <h2>Add Category</h2>

      {error && <p className="error">{error}</p>}

      {/* Image Upload */}
      <div>
        <label>Upload Image *</label>

        <div
          className={`upload-container ${image ? "active" : ""}`}
          onClick={() => document.getElementById("fileInput").click()}
        >
          {image ? (
            <div style={{ textAlign: "center" }}>
              <img
                src={image.secure_url}
                alt="Category"
                className="image-preview"
                style={{
                  width: "120px",
                  height: "120px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <div style={{ marginTop: "10px" }}>
                <button type="button" onClick={handleRemoveImage}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <span className="icon">📤</span>
              <p>{isUploading ? "Uploading..." : "Click to upload image"}</p>
            </div>
          )}
        </div>

        <input
          type="file"
          id="fileInput"
          onChange={handleImageChange}
          style={{ display: "none" }}
          accept="image/*"
        />
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Category Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category name"
            required
            disabled={isUploading}
          />
        </div>

        <div>
          <label>Order *</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            min="1"
            required
            disabled={isUploading}
          />
        </div>

        <button type="submit" disabled={loading || isUploading}>
          {loading ? "Creating..." : "Create Category"}
        </button>

        <button type="button" onClick={() => navigate("/admin/categories")}>
          Cancel
        </button>
      </form>
    </div>
  );
}