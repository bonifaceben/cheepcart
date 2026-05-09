import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";

import "./edit-preorder.css";

export default function EditPreOrder() {
  const { id } = useParams();

  const navigate = useNavigate();

  const { token } = useAuth();

  const fileRef = useRef();

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [imageFiles, setImageFiles] =
    useState([]);

  const [previews, setPreviews] =
    useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "available",
    displayOrder: 1,
    isActive: true,
  });

  // FETCH PRODUCT
  const fetchProduct = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_BASE_URL}/pre-order-products/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed"
        );
      }

      const product =
        data.products.find(
          (p) => p._id === id
        );

      if (!product) {
        alert("Product not found");

        navigate("admin/preorder");

        return;
      }

      setForm({
        name: product.name || "",
        description:
          product.description || "",
        price: product.price || "",
        status:
          product.status || "available",
        displayOrder:
          product.displayOrder || 1,
        isActive: product.isActive,
      });

      const existingImages =
        product.images?.map(
          (img) => img.secure_url
        ) || [];

      setPreviews(existingImages);

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    const {
      name,
      value,
      checked,
      type,
    } = e.target;

    setForm({
      ...form,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  // HANDLE IMAGES
  const handleImageChange = (e) => {
    const files = Array.from(
      e.target.files
    );

    if (!files.length) return;

    if (files.length > 4) {
      alert("Maximum 4 images");
      return;
    }

    for (const file of files) {
      if (
        !file.type.startsWith("image/")
      ) {
        alert("Only images allowed");
        return;
      }

      if (
        file.size >
        5 * 1024 * 1024
      ) {
        alert("Image too large");
        return;
      }
    }

    setImageFiles(files);

    const previewUrls = files.map(
      (file) =>
        URL.createObjectURL(file)
    );

    setPreviews(previewUrls);
  };

  // REMOVE IMAGE
  const removeImage = (index) => {
    const updatedPreviews =
      previews.filter(
        (_, i) => i !== index
      );

    const updatedFiles =
      imageFiles.filter(
        (_, i) => i !== index
      );

    setPreviews(updatedPreviews);
    setImageFiles(updatedFiles);
  };

  // UPDATE PRODUCT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const formData =
        new FormData();

      formData.append(
        "name",
        form.name
      );

      formData.append(
        "description",
        form.description
      );

      if (form.price) {
        formData.append(
          "price",
          Number(form.price)
        );
      }

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "displayOrder",
        Number(form.displayOrder)
      );

      formData.append(
        "isActive",
        form.isActive
      );

      // ONLY SEND IF NEW IMAGES
      if (imageFiles.length > 0) {
        imageFiles.forEach((file) => {
          formData.append(
            "images",
            file
          );
        });
      }

      const res = await fetch(
        `${API_BASE_URL}/pre-order-products/${id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Update failed"
        );
      }

      alert(
        "Product updated successfully"
      );

      navigate("/admin/preorder");

    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-loading">
        Loading...
      </div>
    );
  }

  return (
    <div className="edit-preorder-container">

      <h2>Edit Pre-Order Product</h2>

      <form
        className="edit-preorder-form"
        onSubmit={handleSubmit}
      >

        <input
          type="text"
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
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
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
        />

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

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />

          Active Product
        </label>

        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          ref={fileRef}
        />

        <p className="upload-note">
          Uploading new images will replace old ones
        </p>

        <div className="preview-grid">

          {previews.map(
            (preview, index) => (
              <div
                className="preview-card"
                key={index}
              >
                <img
                  src={preview}
                  alt=""
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
            )
          )}

        </div>

        <button
          type="submit"
          className="update-btn"
          disabled={updating}
        >
          {updating
            ? "Updating..."
            : "Update Product"}
        </button>

      </form>
    </div>
  );
}