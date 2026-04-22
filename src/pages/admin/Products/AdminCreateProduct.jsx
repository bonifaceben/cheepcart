import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import "../Products/create-product.css";

export default function AdminCreateProduct() {
  const { token } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [comparePrice, setComparePrice] = useState("");
  const [weight, setWeight] = useState("");
  const [stock, setStock] = useState("");

  // Image states
  const [images, setImages] = useState([]); 
  const [mainImage, setMainImage] = useState("");

  // Other states
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok && data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        } else {
          setError("Failed to load categories.");
        }
      } catch (error) {
        setError("Error fetching categories. Please try again.");
      }
    };

    fetchCategories();
  }, [token]);

  // Handle image selection
  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    if (!files.length) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadedImages = await uploadImages(files);

      // Save only uploaded image objects
      setImages((prevImages) => [...prevImages, ...uploadedImages]);

      // Set first uploaded image as main image if none exists yet
      if (!mainImage && uploadedImages.length > 0) {
        setMainImage(uploadedImages[0].secure_url);
      }

    } catch (error) {
      setError("Error uploading images. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  // Upload multiple images
  const uploadImages = async (imageFiles) => {
    const formData = new FormData();

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    formData.append("type", "products");

    try {
      const response = await fetch(`${API_BASE_URL}/upload/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      

      if (response.ok && data.success) {
        return data.images; // [{ secure_url, public_id, _id }]
      } else {
        throw new Error(data.message || "Image upload failed.");
      }
    } catch (error) {
      
      throw new Error("Error uploading images. Please try again.");
    }
  };

  // Remove image
  const handleRemoveImage = (publicId) => {
    const updatedImages = images.filter((img) => img.public_id !== publicId);
    setImages(updatedImages);

    // If removed image was main image, set another one
    if (mainImage === images.find((img) => img.public_id === publicId)?.secure_url) {
      setMainImage(updatedImages.length > 0 ? updatedImages[0].secure_url : "");
    }
  };

  // Set main image manually
  const handleSetMainImage = (imageUrl) => {
    setMainImage(imageUrl);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !description ||
      !category ||
      !price ||
      !weight ||
      !stock ||
      images.length === 0 ||
      !mainImage
    ) {
      setError("All fields are required, including at least one image.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const productData = {
        name,
        description,
        category,
        brand,
        price,
        comparePrice,
        weight,
        stock,
        images: images.map((img) => ({
          secure_url: img.secure_url,
          public_id: img.public_id,
        })),
        main_image: mainImage,
      };

      

      const response = await fetch(`${API_BASE_URL}/products`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      const jsonResponse = await response.json();

      if (response.ok) {
        
        navigate("/admin/products");
      } else {
        throw new Error(jsonResponse.message || "Failed to create product.");
      }
    } catch (error) {
      setError("Error creating product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-create-product">
      <h2>Create Product</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        {/* Product Name */}
        <div className="form-group">
          <label>Product Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Product name"
            required
          />
        </div>

        {/* Description */}
        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Product description"
            required
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label>Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Brand */}
        <div className="form-group">
          <label>Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Product brand"
          />
        </div>

        {/* Price */}
        <div className="form-group">
          <label>Price *</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Product price"
            required
          />
        </div>

        {/* Compare Price */}
        <div className="form-group">
          <label>Compare Price</label>
          <input
            type="number"
            value={comparePrice}
            onChange={(e) => setComparePrice(e.target.value)}
            placeholder="Compare price"
          />
        </div>

        {/* Weight */}
        <div className="form-group">
          <label>Weight *</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Product weight"
            required
          />
        </div>

        {/* Stock */}
        <div className="form-group">
          <label>Stock *</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            placeholder="Product stock"
            required
          />
        </div>

        {/* Image Upload */}
        <div
          className="upload-container"
          onClick={() => document.getElementById("fileInput").click()}
        >
          <p>{isUploading ? "Uploading..." : "Click or drag to select images"}</p>
        </div>

        <input
          type="file"
          id="fileInput"
          onChange={handleImageChange}
          style={{ display: "none" }}
          accept="image/*"
          multiple
        />

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="image-preview-grid">
            <h3>Uploaded Images</h3>
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
              {images.map((img, index) => (
                <div key={img.public_id || index} style={{ textAlign: "center" }}>
                  <img
                    src={img.secure_url}
                    alt={`Product ${index + 1}`}
                    className="image-preview"
                    style={{
                      width: "120px",
                      height: "120px",
                      objectFit: "cover",
                      border:
                        mainImage === img.secure_url
                          ? "3px solid green"
                          : "1px solid #ddd",
                      borderRadius: "8px",
                    }}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <button
                      type="button"
                      onClick={() => handleSetMainImage(img.secure_url)}
                      style={{ marginRight: "5px" }}
                    >
                      Set Main
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(img.public_id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Image */}
        {mainImage && (
          <div className="main-image" style={{ marginTop: "20px" }}>
            <h3>Main Image</h3>
            <img
              src={mainImage}
              alt="Main product"
              className="image-preview"
              style={{
                width: "200px",
                height: "200px",
                objectFit: "cover",
                borderRadius: "10px",
                border: "2px solid #333",
              }}
            />
          </div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading || isUploading}>
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}