import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../../config/api";
import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import Preloader from "../../../Preloader";

import "./AdminCategory.css";

export default function CategoriesList() {

  const { token } = useAuth();

  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [deleteLoading, setDeleteLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(1);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const categoriesPerPage = 10;

  // ================= FETCH CATEGORIES =================

  useEffect(() => {

    fetchCategories();

  }, [currentPage, searchQuery]);

  const fetchCategories = async () => {

    setLoading(true);

    try {

      const response = await fetch(
        `${API_BASE_URL}/categories?page=${currentPage}&limit=${categoriesPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && Array.isArray(data.categories)) {

        setCategories(data.categories);

        setTotalPages(
          Math.ceil(data.total / categoriesPerPage)
        );

      } else {

        setError("Failed to load categories.");

      }

    } catch (err) {

      setError("Error fetching categories.");

    } finally {

      setLoading(false);

    }

  };

  // ================= SEARCH =================

  const handleSearchChange = (e) => {

    setSearchQuery(e.target.value);

    setCurrentPage(1);

  };

  // ================= PAGINATION =================

  const handlePageChange = (pageNumber) => {

    if (pageNumber < 1 || pageNumber > totalPages) return;

    setCurrentPage(pageNumber);

  };

  // ================= OPEN DELETE =================

  const handleOpenDeleteModal = (categoryId) => {

    setCategoryToDelete(categoryId);

    setIsDeleteModalOpen(true);

  };

  // ================= CLOSE DELETE =================

  const handleCloseDeleteModal = () => {

    setIsDeleteModalOpen(false);

    setCategoryToDelete(null);

    setSuccessMessage("");

  };

  // ================= DELETE CATEGORY =================

  const handleDelete = async () => {

    if (!categoryToDelete) return;

    setDeleteLoading(true);

    setError("");

    try {

      const response = await fetch(
        `${API_BASE_URL}/categories/${categoryToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        setSuccessMessage(
          "Category deleted successfully!"
        );

        // Remove deleted category instantly
        setCategories((prev) =>
          prev.filter(
            (cat) => cat._id !== categoryToDelete
          )
        );

        setTimeout(() => {

          handleCloseDeleteModal();

        }, 1500);

      } else {

        setError(
          data.message || "Error deleting category"
        );

      }

    } catch (error) {

      setError("Error deleting category");

    } finally {

      setDeleteLoading(false);

    }

  };

  // ================= LOADING =================

  if (loading) return <Preloader />;

  // ================= UI =================

  return (

    <div className="categories-list">

      <div className="top-bar">

        <h2>All Categories</h2>

        <Link
          to="/admin/create-category"
          className="add-btn"
        >
          Add Category
        </Link>

      </div>

      {/* SEARCH */}

      <div className="search-bar">

        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search categories..."
        />

      </div>

      {/* ERROR */}

      {error && (
        <p className="error-message">
          {error}
        </p>
      )}

      {/* TABLE */}

      <div className="table-wrapper">

        <table className="categories-table">

          <thead>

            <tr>
              <th>Image</th>
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

                  </td>

                  <td>{category.name}</td>

                  <td className="actions">

                    <Link
  to={`/admin/update-category/${category._id}`}
  state={{ category }}
  className="btn-edit"
>
  Edit
</Link>

                    <button
                      className="btn-delete"
                      onClick={() =>
                        handleOpenDeleteModal(
                          category._id
                        )
                      }
                    >
                      Delete
                    </button>

                  </td>

                </tr>

              ))

            ) : (

              <tr>

                <td colSpan="3" className="empty">

                  No categories available

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

      {/* PAGINATION */}

      <div className="pagination">

        <button
          onClick={() =>
            handlePageChange(currentPage - 1)
          }
          disabled={currentPage === 1}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() =>
            handlePageChange(currentPage + 1)
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>

      </div>

      {/* DELETE MODAL */}

      {isDeleteModalOpen && (

        <div className="modal-overlay">

          <div className="modal-content">

            <h3>
              Are you sure you want to delete
              this category?
            </h3>

            <div className="modal-actions">

              <button
                onClick={handleDelete}
                className="btn-delete"
                disabled={deleteLoading}
              >

                {deleteLoading
                  ? "Deleting..."
                  : "Yes, Delete"}

              </button>

              <button
                onClick={handleCloseDeleteModal}
                className="btn-cancel"
              >
                Cancel
              </button>

            </div>

            {successMessage && (
              <p className="success-message">
                {successMessage}
              </p>
            )}

            {error && (
              <p className="error-message">
                {error}
              </p>
            )}

          </div>

        </div>

      )}

    </div>

  );
}