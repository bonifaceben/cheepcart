import { useEffect, useState } from "react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";

export default function AdminCategories() {
  const { token } = useAuth();

  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [showAddCategory, setShowAddCategory] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const data = await getCategories();
    setCategories(data);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) return;

    if (editingId) {
      await updateCategory(editingId, { name }, token);
      setEditingId(null);
    } else {
      await createCategory({ name }, token);
    }

    setName("");
    loadCategories();
  }

  async function handleEdit(cat) {
    setName(cat.name);
    setEditingId(cat.id);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this category?")) return;

    await deleteCategory(id, token);
    loadCategories();
  }

  return (
    <div className="table-card">

      <h2>Categories</h2>

      {/* Category Dropdown */}
      <div className="category-dropdown">
        <select
          onChange={(e) => {
            if (e.target.value === "add") {
              setShowAddCategory(true);
            } else {
              setShowAddCategory(false);
            }
          }}
        >
          <option value="">Select Category</option>
          <option value="all">All Categories</option>
          <option value="add">Add Category</option>
        </select>
      </div>

      {/* Add/Edit Category Form */}
      {showAddCategory && (
        <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit">{editingId ? "Update" : "Create"}</button>
        </form>
      )}

      {/* Categories Table */}
      {!showAddCategory && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>
                  <button onClick={() => handleEdit(cat)}>Edit</button>
                  <button onClick={() => handleDelete(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}