import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import "./updatebanner.css";

export default function UpdateBanner() {
  const { bannerId } = useParams();
  const { token } = useAuth();

  const [form, setForm] = useState({
    type: "hero",
    title: "",
    subtitle: "",
    link: "",
    order: 1,
  });

  const [existingMedia, setExistingMedia] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // ================= FETCH EXISTING =================
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        setFetching(true);

        const res = await fetch(`${API_BASE_URL}/banners/${bannerId}`);
        const data = await res.json();

        if (data.success) {
          const banner = data.banner;

          setForm({
            type: banner.type || "hero",
            title: banner.title || "",
            subtitle: banner.subtitle || "",
            link: banner.link || "",
            order: banner.order || 1,
          });

          setExistingMedia(banner.mediaItems || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };

    fetchBanner();
  }, [bannerId]);

  // ================= INPUT =================
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleFileChange(e) {
    const selected = Array.from(e.target.files);

    if (selected.length > 5) {
      alert("Max 5 files allowed");
      return;
    }

    setFiles(selected);
  }

  // ================= UPDATE =================
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();

      // TEXT
      Object.keys(form).forEach((key) => {
        formData.append(key, form[key]);
      });

      // NEW FILES (optional)
      files.forEach((file) => {
        formData.append("media", file);
      });

      const res = await fetch(`${API_BASE_URL}/banners/${bannerId}`, {
        method: "PUT", // ⚠️ IMPORTANT
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        alert("Banner updated successfully");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // ================= UI =================
  if (fetching) return <p>Loading banner...</p>;

  return (
    <div className="admin-form-container">
      <h2>Update Banner</h2>

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
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
        />

        {/* SUBTITLE */}
        <input
          type="text"
          name="subtitle"
          value={form.subtitle}
          onChange={handleChange}
          placeholder="Subtitle"
        />

        {/* LINK */}
        <input
          type="text"
          name="link"
          value={form.link}
          onChange={handleChange}
          placeholder="/shop"
        />

        {/* ORDER */}
        <input
          type="number"
          name="order"
          value={form.order}
          onChange={handleChange}
        />

        {/* EXISTING MEDIA */}
        <div className="existing-media">
          <h4>Current Media</h4>

          <div className="media-grid">
            {existingMedia.map((m, i) => (
              <img
                key={i}
                src={m.secure_url}
                alt="banner"
                className="preview-img"
              />
            ))}
          </div>
        </div>

        {/* NEW FILES */}
        <input
          type="file"
          multiple
          accept="image/*,video/*,.svg"
          onChange={handleFileChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update Banner"}
        </button>

      </form>
    </div>
  );
}