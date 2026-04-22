import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/api"; // Correct API URL
import { useAuth } from "../../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import Preloader from "../../../Preloader"; // Optional pre-loader
import { FaSave } from "react-icons/fa"; // Save icon

export default function AdminUpdateProduct() {
  const { token } = useAuth(); // Get token from AuthContext
  const navigate = useNavigate();
  const { productId } = useParams(); // Get the product ID from the URL

  const [product, setProduct] = useState(null); // Store the product data
  const [loading, setLoading] = useState(true); // Track loading state
  const [error, setError] = useState(""); // Error state
  const [formData, setFormData] = useState({
    price: "",
    stock: "",
    description: "",
    images: [], // To hold the current image and the new ones
  });

  // Fetch the product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(""); // Reset error message

      try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch product. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched product data:", data); // Log the fetched product data

        setProduct(data); // Set the product data
        setFormData({
          price: data.price,
          stock: data.stock,
          description: data.description,
          images: data.images || [], // Populate images
        });
      } catch (error) {
        console.error("Error fetching product:", error); // Log error to the console
        setError(error.message); // Show the error message in the UI
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, token]);

  // Handle form data change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handle file/image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0]; // Get the selected image file
    uploadImage(file); // Upload the image to the server
  };

  // Upload image to server
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file); // The backend expects 'image' as the field name

    try {
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({
          ...formData,
          images: [
            ...formData.images,
            {
              secure_url: data.url, // Add the URL of the new image
              public_id: data.public_id,
            },
          ],
        });
      } else {
        setError("Image upload failed.");
      }
    } catch (error) {
      setError("Error uploading image.");
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedProduct = {
      price: formData.price,
      stock: formData.stock,
      description: formData.description,
      images: formData.images, // Handle image uploads as needed
    };

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProduct),
      });

      const data = await response.json();

      if (response.ok) {
        navigate(`/admin/products`); // Redirect to product list after successful update
      } else {
        setError(data.message || "Failed to update product.");
      }
    } catch (error) {
      setError("Error updating product.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Preloader />; // Show preloader while fetching data
  }

  return (
    <div className="admin-update-product">
      <h2>Update Product</h2>

      {error && <p className="error">{error}</p>}

      {/* Product Update Form */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Images</label>
          <input
            type="file"
            name="images"
            accept="image/*"
            onChange={handleImageChange}
          />
          {/* Optional: Show current image(s) */}
          {formData.images.length > 0 && (
            <div>
              {formData.images.map((image, index) => (
                <img
                  key={index}
                  src={image.secure_url}
                  alt={`Product Image ${index + 1}`}
                  style={{ width: "100px", height: "100px", marginRight: "10px" }}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update Product"} <FaSave />
          </button>
        </div>
      </form>

      <button onClick={() => navigate(`/admin/products`)}>Cancel</button>
    </div>
  );
}