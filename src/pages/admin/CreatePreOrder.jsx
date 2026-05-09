import { useState, useRef } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./preorder-admin.css";

export default function CreatePreOrder() {
  const { token } = useAuth();
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "available",
    displayOrder: 1,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // HANDLE INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // HANDLE IMAGES
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    // COMBINE OLD + NEW
    const combinedFiles = [...imageFiles, ...files];

    // LIMIT
    if (combinedFiles.length > 4) {
      alert("Maximum 4 images allowed");
      return;
    }

    // VALIDATION
    for (const file of combinedFiles) {
      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("Each image must be less than 5MB");
        return;
      }
    }

    setImageFiles(combinedFiles);

    const previewUrls = combinedFiles.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  // REMOVE IMAGE
  const removeImage = (indexToRemove) => {
    const updatedFiles = imageFiles.filter(
      (_, index) => index !== indexToRemove
    );

    const updatedPreviews = previews.filter(
      (_, index) => index !== indexToRemove
    );

    setImageFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Product name is required");
      return;
    }

    if (imageFiles.length === 0) {
      alert("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);

      // ================= FORM DATA =================
      const formData = new FormData();

      formData.append("name", form.name.trim());

      if (form.description) {
        formData.append("description", form.description);
      }

      if (form.price) {
        formData.append("price", Number(form.price));
      }

      formData.append("status", form.status);

      formData.append(
        "displayOrder",
        Number(form.displayOrder) || 1
      );

      // ================= IMAGES =================
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      // ================= API CALL =================
      const res = await fetch(
        `${API_BASE_URL}/pre-order-products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to create pre-order"
        );
      }

      alert("Pre-order product created successfully!");

      // ================= RESET =================
      setForm({
        name: "",
        description: "",
        price: "",
        status: "available",
        displayOrder: 1,
      });

      setImageFiles([]);
      setPreviews([]);

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

      <form
        onSubmit={handleSubmit}
        className="preorder-form"
      >

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
          multiple
          onChange={handleImageChange}
          ref={fileRef}
          required
        />

        <p className="upload-note">
          You can upload up to 4 images
        </p>

        {/* IMAGE PREVIEWS */}
        {previews.length > 0 && (
          <div className="preview-grid">
            {previews.map((preview, index) => (
              <div
                className="preview-card"
                key={index}
              >
                <img
                  src={preview}
                  alt={`preview-${index}`}
                  className="preview-image"
                />

                <button
                  type="button"
                  className="remove-preview-btn"
                  onClick={() =>
                    removeImage(index)
                  }
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
        >
          <option value="available">
            Available
          </option>

          <option value="coming_soon">
            Coming Soon
          </option>

          <option value="closed">
            Closed
          </option>
        </select>

        <input
          type="number"
          name="displayOrder"
          value={form.displayOrder}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : "Create Product"}
        </button>

      </form>
    </div>
  );
}