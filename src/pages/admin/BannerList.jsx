import { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { useAuth } from "../../context/AuthContext";
import { NavLink } from "react-router-dom";

export default function BannerList() {
  const { token } = useAuth();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= FETCH =================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${API_BASE_URL}/banners`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setBanners(data.banners);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, [token]);

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;

    try {
      const res = await fetch(`${API_BASE_URL}/banners/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setBanners((prev) => prev.filter((b) => b._id !== id));
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading banners...</p>;

  return (
    <div className="banner-list-container">
      <h2>All Banners</h2>

      <div className="banner-grid">
        {banners.map((banner) => {
          const media = banner.mediaItems?.[0];

          return (
            <div key={banner._id} className="banner-card">

              {/* 🔥 PREVIEW (FIXED) */}
              {media ? (
                media.resource_type === "video" ? (
                  <video
                    src={media.secure_url}
                    className="banner-preview"
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                ) : (
                  <img
                    src={media.secure_url}
                    alt="banner"
                    className="banner-preview"
                  />
                )
              ) : (
                <div className="no-media">No media</div>
              )}

              {/* TYPE */}
              <p className="banner-type">{banner.type}</p>

              {/* ACTIONS */}
              <div className="banner-actions">

                <NavLink
                  to={`/admin/banners/update/${banner._id}`}
                  className="edit-btn"
                >
                  Edit
                </NavLink>

                <button
                  onClick={() => handleDelete(banner._id)}
                  className="delete-btn"
                >
                  Delete
                </button>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}