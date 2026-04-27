import { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./createbanner.css"

export default function CreateBanner() {
  const { token } = useAuth();

  const [form, setForm] = useState({
    type: "hero",
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
    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > 5) {
      alert("Max 5 files allowed");
      return;
    }

    setFiles(selectedFiles);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (files.length === 0) {
      alert("Please upload at least one media file");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      // TEXT FIELDS
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // FILES (IMPORTANT: SAME KEY = media)
      files.forEach((file) => {
        formData.append("media", file);
      });

      const res = await fetch(`${API_BASE_URL}/banners`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Banner uploaded successfully");

        // RESET
        setForm({
          type: "hero",
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
      <h2>Create Banner</h2>

      <form onSubmit={handleSubmit} className="admin-form">

        {/* TYPE */}
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="hero">Hero</option>
          <option value="secondary">Secondary</option>
        </select>

        {/* TITLE */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />

        {/* SUBTITLE */}
        <input
          type="text"
          name="subtitle"
          placeholder="Subtitle"
          value={form.subtitle}
          onChange={handleChange}
        />

        {/* LINK */}
        <input
          type="text"
          name="link"
          placeholder="/shop"
          value={form.link}
          onChange={handleChange}
        />

        {/* ORDER */}
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
        />

        {/* FILES */}
        <input
          type="file"
          multiple
          accept="image/*,video/*,.svg"
          onChange={handleFileChange}
        />

        {/* SUBMIT */}
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Create Banner"}
        </button>
      </form>
    </div>
  );
}