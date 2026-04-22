import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/api"; // Import API_BASE_URL from config
import { Link } from "react-router-dom"; // For navigation to Update category page
import { useAuth } from "../../../context/AuthContext";
import Preloader from "../../../Preloader"; // Import the Preloader spinner component

export default function CategoriesList() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]); // Store categories
  const [loading, setLoading] = useState(true); // Loading state for categories fetch
  const [deleteLoading, setDeleteLoading] = useState(false); // Loading state for deletion
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(""); // Success message for delete
  const [searchQuery, setSearchQuery] = useState(""); // Search query
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Control modal visibility
  const [categoryToDelete, setCategoryToDelete] = useState(null); // Store category to delete

  const categoriesPerPage = 10; // Set the number of categories per page

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true); // Set loading state when fetching starts
      try {
        const response = await fetch(
          `${API_BASE_URL}/categories?page=${currentPage}&limit=${categoriesPerPage}&search=${searchQuery}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure the token is sent for authentication
            },
          }
        );
        const data = await response.json();

        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories); // Set the categories data
          setTotalPages(Math.ceil(data.total / categoriesPerPage)); // Set total pages based on the data
        } else {
          setError("Failed to load categories.");
        }
      } catch (err) {
        setError("Error fetching categories.");
      } finally {
        setLoading(false); // Set loading to false after fetching is done
      }
    };

    fetchCategories();
  }, [currentPage, searchQuery, token]);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when the search query changes
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Open the delete modal
  const handleOpenDeleteModal = (categoryId) => {
    setCategoryToDelete(categoryId);
    setIsDeleteModalOpen(true);
  };

  // Close the delete modal
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCategoryToDelete(null);
    setSuccessMessage(""); // Reset success message when modal is closed
  };

  // Handle delete category
  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setDeleteLoading(true); // Show delete loading spinner
    setError("");
    setSuccessMessage(""); // Reset success message

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${categoryToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`, // Ensure token is sent for authentication
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Category deleted successfully!");
        setTimeout(() => {
          setIsDeleteModalOpen(false); // Close the modal after 2 seconds
          window.location.reload(); // Reload the page to reflect the changes
        }, 2000);
      } else {
        setError("Error deleting category");
      }
    } catch (error) {
      setError("Error deleting category");
    } finally {
      setDeleteLoading(false); // Hide delete loading spinner
    }
  };

  if (loading) return <Preloader />; // Show the pre-loader spinner while fetching categories
  if (error) return <p>{error}</p>;

  return (
    <div className="categories-list">
      <h2>All Categories</h2>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search categories..."
        />
      </div>

      {/* Categories Table */}
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length > 0 ? (
            categories.map((category) => (
              <tr key={category._id}>
                <td>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                  />
                  {category.name}
                </td>
                <td>
                  
                  <button
                    className="btn btn-delete"
                    onClick={() => handleOpenDeleteModal(category._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2">No categories available</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Prev
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Are you sure you want to delete this category?</h3>
            <div className="modal-actions">
              <button onClick={handleDelete} className="btn btn-delete" disabled={deleteLoading}>
                {deleteLoading ? "Deleting..." : "Yes, Delete"}
              </button>
              <button onClick={handleCloseDeleteModal} className="btn btn-cancel">
                Cancel
              </button>
            </div>
            {successMessage && <p className="success">{successMessage}</p>}
            {error && <p className="error">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}