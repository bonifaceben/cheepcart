import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./banner.css";

export default function CreateSideBanner() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    link: "",
    order: 1,
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);

    if (selected.length > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    setFiles(selected);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!files.length) {
      alert("Please upload at least one file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // TEXT
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // FILES (IMPORTANT: SAME KEY "media")
      files.forEach((file) => {
        formData.append("media", file);
      });

      const res = await fetch(`${API_BASE_URL}/side-banners`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Side banner created successfully");

        // RESET
        setForm({
          title: "",
          subtitle: "",
          link: "",
          order: 1,
        });
        setFiles([]);
      } else {
        alert(data.message || "Upload failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-form-container">
      <h2>Create Side Banner</h2>

      <form onSubmit={handleSubmit} className="admin-form">

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        <input
          type="text"
          name="subtitle"
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={handleChange}
        />

        <input
          type="text"
          name="link"
          placeholder="/shop"
          value={form.link}
          onChange={handleChange}
        />

        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
        />

        <input
          type="file"
          multiple
          accept="image/*,video/*,.svg"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Create Side Banner"}
        </button>

      </form>
    </div>
  );
}