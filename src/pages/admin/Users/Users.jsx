import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../../config/api";
import { useAuth } from "../../../context/AuthContext";
import "./users.css";

export default function Users() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 SEARCH STATE
  const [search, setSearch] = useState("");

  // ================= FETCH USERS =================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/admin/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.users) {
          setUsers(data.users);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // ================= FILTER USERS =================
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  // ================= UPDATE ROLE =================
  const updateRole = async (id, role) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, role } : u
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DEACTIVATE =================
  const deactivateUser = async (id) => {
    if (!window.confirm("Deactivate this user?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/deactivate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isActive: false } : u
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // ================= ACTIVATE =================
  const activateUser = async (id) => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${id}/activate`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === id ? { ...u, isActive: true } : u
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div className="users-container">
      <h2>All Users</h2>

      {/* 🔥 SEARCH BAR */}
      <div className="users-search">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <table className="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>

              <td>
                <select
                  value={user.role}
                  onChange={(e) =>
                    updateRole(user._id, e.target.value)
                  }
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </td>

              <td>
                {user.isActive ? (
                  <span className="active">Active</span>
                ) : (
                  <span className="inactive">Inactive</span>
                )}
              </td>

              <td>
                {user.isActive ? (
                  <button
                    className="deactivate"
                    onClick={() => deactivateUser(user._id)}
                  >
                    Deactivate
                  </button>
                ) : (
                  <button
                    className="activate"
                    onClick={() => activateUser(user._id)}
                  >
                    Activate
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}