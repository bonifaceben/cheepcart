import { useState } from "react";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import {
  useNavigate,
  useParams,
  useLocation,
} from "react-router-dom";

import { FaSave } from "react-icons/fa";

import "./AdminProductList.css";

export default function AdminUpdateProduct() {

  const { token } = useAuth();

  const navigate = useNavigate();

  const { productId } = useParams();

  const location = useLocation();

  // ================= PRODUCT =================

  const productData =
    location.state?.product;

  // ================= FORMAT IMAGES =================

  const formattedImages = Array.isArray(
    productData?.images
  )
    ? productData.images.map((img) => {

        // STRING IMAGE

        if (typeof img === "string") {

          return {
            url: img,
            public_id: "",
          };

        }

        // OBJECT IMAGE

        return {
          url:
            img?.url ||
            img?.secure_url ||
            "",

          public_id:
            img?.public_id || "",
        };

      })
    : [];

  // ================= STATES =================

  const [loading, setLoading] =
    useState(false);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [formData, setFormData] =
    useState({
      name:
        productData?.name || "",

      price:
        productData?.price || "",

      comparePrice:
        productData?.comparePrice ||
        "",

      stock:
        productData?.stock || "",

      isFeatured:
        productData?.isFeatured ??
        false,

      isActive:
        productData?.isActive ??
        true,

      images: formattedImages,
    });

  // ================= INPUT CHANGE =================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData((prev) => ({
      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

  };

  // ================= IMAGE UPDATE =================

  const handleImageChange = async (
    e,
    index
  ) => {

    const file = e.target.files[0];

    if (!file) return;

    try {

      setUploading(true);

      setError("");

      const uploadData =
        new FormData();

      // ================= CURRENT IMAGE =================

      const currentImage =
        formData.images[index];

      // IMPORTANT
      // BACKEND EXPECTS oldImages[]

      if (
        currentImage?.public_id
      ) {

        uploadData.append(
          "oldImages[]",
          currentImage.public_id
        );

      }

      // ================= NEW IMAGE =================

      uploadData.append(
        "images",
        file
      );

      uploadData.append(
        "type",
        "products"
      );

      // ================= API =================

      const response = await fetch(
        `${API_BASE_URL}/upload/update`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: uploadData,
        }
      );

      const data =
        await response.json();

      console.log(
        "UPLOAD RESPONSE:",
        data
      );

      if (
        response.ok &&
        data.success
      ) {

        const updatedImages = [
          ...formData.images,
        ];

        // IMPORTANT
        // SAVE RETURNED IMAGE

        updatedImages[index] = {
          url:
            data?.images?.[0]
              ?.url || "",

          public_id:
            data?.images?.[0]
              ?.public_id || "",
        };

        setFormData((prev) => ({
          ...prev,

          images:
            updatedImages,
        }));

      } else {

        setError(
          data.message ||
          "Image upload failed"
        );

      }

    } catch (error) {

      console.log(error);

      setError(
        "Error uploading image"
      );

    } finally {

      setUploading(false);

    }

  };

  // ================= REMOVE IMAGE =================

  const handleRemoveImage = (
    index
  ) => {

    const updatedImages =
      formData.images.filter(
        (_, i) =>
          i !== index
      );

    setFormData((prev) => ({
      ...prev,

      images:
        updatedImages,
    }));

  };

  // ================= UPDATE PRODUCT =================

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      setError("");

      const updatedProduct = {
        name:
          formData.name,

        price: Number(
          formData.price
        ),

        comparePrice:
          Number(
            formData.comparePrice
          ),

        stock: Number(
          formData.stock
        ),

        isFeatured:
          formData.isFeatured,

        isActive:
          formData.isActive,

        images:
          formData.images,
      };

      console.log(
        "FINAL PRODUCT:",
        updatedProduct
      );

      const response = await fetch(
        `${API_BASE_URL}/products/${productId}`,
        {
          method: "PUT",

          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            updatedProduct
          ),
        }
      );

      const data =
        await response.json();

      console.log(
        "UPDATE RESPONSE:",
        data
      );

      if (response.ok) {

        navigate(
          "/admin/products"
        );

      } else {

        setError(
          data.message ||
          "Failed to update product"
        );

      }

    } catch (error) {

      console.log(error);

      setError(
        "Error updating product"
      );

    } finally {

      setLoading(false);

    }

  };

  // ================= UI =================

  return (

    <div className="admin-create-category">

      <h2>
        Update Product
      </h2>

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <form
        onSubmit={
          handleSubmit
        }
      >

        {/* NAME */}

        <div>

          <label>
            Product Name
          </label>

          <input
            type="text"
            name="name"
            value={
              formData.name
            }
            onChange={
              handleChange
            }
            required
          />

        </div>

        {/* PRICE */}

        <div>

          <label>
            Price
          </label>

          <input
            type="number"
            name="price"
            value={
              formData.price
            }
            onChange={
              handleChange
            }
            required
          />

        </div>

        {/* COMPARE PRICE */}

        <div>

          <label>
            Compare Price
          </label>

          <input
            type="number"
            name="comparePrice"
            value={
              formData.comparePrice
            }
            onChange={
              handleChange
            }
          />

        </div>

        {/* STOCK */}

        <div>

          <label>
            Stock
          </label>

          <input
            type="number"
            name="stock"
            value={
              formData.stock
            }
            onChange={
              handleChange
            }
            required
          />

        </div>

        {/* FEATURED */}

        <div
          style={{
            marginTop:
              "20px",
          }}
        >

          <label
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap: "10px",
            }}
          >

            <input
              type="checkbox"
              name="isFeatured"
              checked={
                formData.isFeatured
              }
              onChange={
                handleChange
              }
            />

            Featured Product

          </label>

        </div>

        {/* ACTIVE */}

        <div
          style={{
            marginTop:
              "15px",

            marginBottom:
              "20px",
          }}
        >

          <label
            style={{
              display:
                "flex",

              alignItems:
                "center",

              gap: "10px",
            }}
          >

            <input
              type="checkbox"
              name="isActive"
              checked={
                formData.isActive
              }
              onChange={
                handleChange
              }
            />

            Active Product

          </label>

        </div>

        {/* IMAGES */}

        <div>

          <label>
            Product Images
          </label>

          <div className="image-grid">

            {Array.isArray(
              formData.images
            ) &&
              formData.images.map(
                (
                  image,
                  index
                ) => {

                  // IMPORTANT
                  // HANDLE STRING + OBJECT

                  const imageUrl =
                    typeof image ===
                    "string"
                      ? image
                      : image?.url ||
                        image?.secure_url ||
                        "";

                  return (

                    <div
                      key={index}
                      className="image-card"
                    >

                      <img
                        src={imageUrl}
                        alt="Product"
                        className="image-preview"
                      />

                      {/* REMOVE */}

                      <button
                        type="button"
                        className="remove-btn"
                        onClick={() =>
                          handleRemoveImage(
                            index
                          )
                        }
                      >
                        ×
                      </button>

                      {/* UPDATE */}

                      <input
                        type="file"
                        accept="image/*"
                        className="image-upload-input"
                        onChange={(e) =>
                          handleImageChange(
                            e,
                            index
                          )
                        }
                      />

                    </div>

                  );

                }
              )}

          </div>

          {uploading && (
            <p
              style={{
                marginTop: "10px",
              }}
            >
              Uploading image...
            </p>
          )}

        </div>

        {/* SUBMIT */}

        <button
          type="submit"
          disabled={
            loading ||
            uploading
          }
          style={{
            marginTop:
              "25px",
          }}
        >

          {loading
            ? "Updating..."
            : "Update Product"}

          <FaSave
            style={{
              marginLeft:
                "8px",
            }}
          />

        </button>

      </form>

      {/* CANCEL */}

      <button
        type="button"
        className="cancel-btn"
        onClick={() =>
          navigate(
            "/admin/products"
          )
        }
      >
        Cancel
      </button>

    </div>

  );

}