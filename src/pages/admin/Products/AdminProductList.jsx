import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/api"; // Replace with the correct import path
import { useAuth } from "../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa"; // Edit and Delete icons
import Preloader from "../../../Preloader"; // Import Preloader component
import "../Products/AdminProductList.css";

export default function AdminProductsList() {
  const { token } = useAuth(); // Get token from AuthContext
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // To handle modal visibility
  const [productToDelete, setProductToDelete] = useState(null); // To store the product to be deleted

  // Fetch product list when the page loads
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/products`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products); // Assuming data.products contains the array of products
        } else {
          setError("Failed to load products.");
        }
      } catch (error) {
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [token]);

  // Show Delete Modal
  const handleDeleteClick = (productId) => {
    setProductToDelete(productId); // Set the product ID to be deleted
    setShowDeleteModal(true); // Show the modal
  };

  // Close the Delete Modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false); // Close the modal
    setProductToDelete(null); // Clear product ID
  };

  // Confirm Deletion of the product
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove the deleted product from the list
        setProducts(products.filter((product) => product._id !== productToDelete));
        closeDeleteModal(); // Close the modal
      } else {
        setError("Failed to delete the product.");
      }
    } catch (error) {
      setError("Error deleting product.");
    }
  };

  return (
    <div className="admin-product-list">
      <h2>All Products</h2>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <Preloader /> // Display the Preloader when loading
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Product ID</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((product) => (
                <tr key={product._id}>
                  <td className="product-name">
                    <img
                      src={product.images[0]?.secure_url}
                      alt={product.name}
                      className="product-image"
                    />
                    {product.name}
                  </td>
                  <td className="product-id">#{product._id}</td>
                  <td className="product-price">₦{product.price}</td>
                  <td className="product-quantity">{product.stock}</td>
                  <td className="product-actions">
                    {/* Edit button */}
                    <button
  onClick={() =>
    navigate(
      `/admin/products/update/${product._id}`,
      {
        state: {
          product: {
            _id: product._id,

            name: product.name,

            price: product.price,

            comparePrice:
              product.comparePrice,

            stock: product.stock,

            isFeatured:
              product.isFeatured,

            isActive:
              product.isActive,

            images:
              product.images || [],
          },
        },
      }
    )
  }
>
  <FaEdit />
</button>
                    {/* Delete button */}
                    <button onClick={() => handleDeleteClick(product._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No products available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button disabled={true} onClick={() => {/* Previous Page Logic */}} >
          Previous
        </button>
        <span>Page 1 of 1</span>
        <button disabled={true} onClick={() => {/* Next Page Logic */}} >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete this product?</h3>
            <div className="modal-actions">
              <button className="btn-delete" onClick={handleConfirmDelete}>
                Yes, Delete
              </button>
              <button className="btn-cancel" onClick={closeDeleteModal}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}