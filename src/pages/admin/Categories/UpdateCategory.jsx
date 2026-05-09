import { useState } from "react";

import {
  useParams,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { API_BASE_URL } from "../../../config/api";

import { useAuth } from "../../../context/AuthContext";

import "./AdminCategory.css";

export default function UpdateCategory() {

  const { token } = useAuth();

  const { id } = useParams();

  const navigate = useNavigate();

  const location = useLocation();

  // ================= CATEGORY DATA =================

  const categoryData =
    location.state?.category;

  // ================= STATES =================

  const [category, setCategory] =
    useState({
      name: categoryData?.name || "",

      order:
        Number(categoryData?.order) || 1,

      image:
        categoryData?.image || "",

      isActive:
        categoryData?.isActive ?? true,
    });

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ================= IMAGE UPDATE =================

  const handleImageChange = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    try {

      setUploading(true);

      setError("");

      const formData = new FormData();

      formData.append("images", file);

      formData.append(
        "type",
        "categories"
      );

      // IMPORTANT
      // CLOUDINARY UPDATE ENDPOINT

      const response = await fetch(
        `${API_BASE_URL}/upload/update`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok && data.success) {

        // VERY IMPORTANT
        // SAVE NEW CLOUDINARY URL

        setCategory((prev) => ({
          ...prev,

          image: data.images[0].url
        }));

      } else {

        setError(
          data.message ||
          "Image upload failed"
        );

      }

    } catch (error) {

      setError("Error uploading image");

    } finally {

      setUploading(false);

    }

  };

  // ================= UPDATE CATEGORY =================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    setError("");

    try {

      const response = await fetch(
        `${API_BASE_URL}/categories/${id}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: category.name,

            image: category.image,

            order: Number(
              category.order
            ),

            isActive:
              category.isActive,
          }),
        }
      );

      const data = await response.json();

      console.log(data);

      if (response.ok) {

        navigate("/admin/categories");

      } else {

        setError(
          data.message ||
          "Failed to update category"
        );

      }

    } catch (error) {

      setError(
        "Error updating category"
      );

    } finally {

      setLoading(false);

    }

  };

  // ================= UI =================

  return (

    <div className="admin-create-category">

      <h2>Update Category</h2>

      {error && (
        <p className="error">{error}</p>
      )}

      <form onSubmit={handleSubmit}>

        {/* CATEGORY NAME */}

        <div>

          <label>
            Category Name *
          </label>

          <input
            type="text"
            value={category.name}
            onChange={(e) =>
              setCategory({
                ...category,
                name:
                  e.target.value,
              })
            }
            placeholder="Category name"
            required
          />

        </div>

        {/* ORDER */}

        <div>

          <label>
            Order *
          </label>

          <input
            type="number"
            value={category.order}
            onChange={(e) =>
              setCategory({
                ...category,

                order: Number(
                  e.target.value
                ),
              })
            }
            min="1"
            required
          />

        </div>

        {/* IMAGE */}

        <div>

          <label>
            Category Image
          </label>

          <div className="upload-container">

            {category.image && (

              <div
                style={{
                  marginBottom:
                    "15px",
                }}
              >

                <img
                  src={
                    category.image
                  }
                  alt="Category"
                  className="image-preview"
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit:
                      "cover",
                    borderRadius:
                      "10px",
                  }}
                />

              </div>

            )}

            <input
              type="file"
              accept="image/*"
              onChange={
                handleImageChange
              }
            />

            {uploading && (
              <p
                style={{
                  marginTop:
                    "10px",
                }}
              >
                Uploading image...
              </p>
            )}

          </div>

        </div>

        {/* ACTIVE */}

        <div
          style={{
            marginTop: "20px",

            marginBottom:
              "20px",
          }}
        >

          <label
            style={{
              display: "flex",

              alignItems:
                "center",

              gap: "10px",
            }}
          >

            <input
              type="checkbox"
              checked={
                category.isActive
              }
              onChange={(e) =>
                setCategory({
                  ...category,

                  isActive:
                    e.target
                      .checked,
                })
              }
              style={{
                width: "18px",

                height: "18px",
              }}
            />

            Active Category

          </label>

        </div>

        {/* BUTTONS */}

        <button
          type="submit"
          disabled={
            loading ||
            uploading
          }
        >

          {loading
            ? "Updating..."
            : "Update Category"}

        </button>

        <button
          type="button"
          onClick={() =>
            navigate(
              "/admin/categories"
            )
          }
        >
          Cancel
        </button>

      </form>

    </div>

  );
}