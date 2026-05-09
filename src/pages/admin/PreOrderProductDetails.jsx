import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { API_BASE_URL } from "../../config/api";

import "./PreOrderProductDetails.css";

export default function PreOrderProductDetails() {
  const { slug } = useParams();

  const navigate = useNavigate();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [selectedImage, setSelectedImage] =
    useState("");

  // ================= ENQUIRY MODAL =================
  const [showModal, setShowModal] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  // ================= SUCCESS MODAL =================
  const [showSuccess, setShowSuccess] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState("");

  // ================= FORM =================
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    quantity: 1,
    location: "",
    message: "",
  });

  // ================= FETCH PRODUCT =================
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/pre-order-products/${slug}`
        );

        // SAFE RESPONSE
        let data = {};

        const text = await res.text();

        try {
          data = text
            ? JSON.parse(text)
            : {};
        } catch {
          data = {};
        }

        if (!res.ok) {
          throw new Error(
            data.message ||
              "Failed to fetch product"
          );
        }

        setProduct(data);

        setSelectedImage(
          data.images?.[0]
            ?.secure_url ||
            data.image?.secure_url ||
            ""
        );

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  // ================= SUBMIT ENQUIRY =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const res = await fetch(
        `${API_BASE_URL}/pre-order-enquiries`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId: product._id,
            ...form,
          }),
        }
      );

      let data = {};

      const text = await res.text();

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to submit enquiry"
        );
      }

      // CLOSE FORM MODAL
      setShowModal(false);

      // SUCCESS MODAL
      setSuccessMessage(
        data.message ||
          "Enquiry submitted successfully"
      );

      setShowSuccess(true);

      // RESET FORM
      setForm({
        fullName: "",
        phone: "",
        email: "",
        quantity: 1,
        location: "",
        message: "",
      });

    } catch (err) {
      console.error(err);

      setSuccessMessage(
        err.message ||
          "Failed to submit enquiry"
      );

      setShowSuccess(true);

    } finally {
      setSubmitting(false);
    }
  };

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="preorder-details-loading">

        <div className="preorder-skeleton">

          {/* IMAGE */}
          <div className="skeleton-image"></div>

          {/* CONTENT */}
          <div className="skeleton-content">

            <div className="skeleton-line skeleton-status"></div>

            <div className="skeleton-line skeleton-title"></div>

            <div className="skeleton-line skeleton-price"></div>

            <div className="skeleton-line skeleton-text"></div>

            <div className="skeleton-line skeleton-text"></div>

            <div className="skeleton-line skeleton-text short"></div>

            <div className="skeleton-button"></div>

          </div>

        </div>

      </div>
    );
  }

  // ================= NOT FOUND =================
  if (!product) {
    return (
      <div className="preorder-details-loading">
        Product not found
      </div>
    );
  }

  return (
    <>
      <div className="preorder-details-page">

        {/* BACK */}
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <div className="preorder-details-container">

          {/* ================= LEFT ================= */}
          <div className="preorder-gallery">

            {/* MAIN IMAGE */}
            <div className="main-image-box">

              <img
                src={selectedImage}
                alt={product.name}
                className="main-image"
              />

            </div>

            {/* THUMBNAILS */}
            <div className="thumbnail-row">

              {product.images?.map(
                (img, index) => (
                  <img
                    key={index}
                    src={img.secure_url}
                    alt={product.name}
                    className={`thumbnail-image ${
                      selectedImage ===
                      img.secure_url
                        ? "active-thumb"
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedImage(
                        img.secure_url
                      )
                    }
                  />
                )
              )}

            </div>

          </div>

          {/* ================= RIGHT ================= */}
          <div className="preorder-info">

            {/* STATUS */}
            <span
              className={`details-status ${product.status}`}
            >
              {product.status?.replace(
                "_",
                " "
              )}
            </span>

            {/* NAME */}
            <h1>{product.name}</h1>

            {/* PRICE */}
            <div className="details-price">
              {product.price
                ? `₦${Number(
                    product.price
                  ).toLocaleString()}`
                : "Price on request"}
            </div>

            {/* DESCRIPTION */}
            <p className="details-description">
              {product.description ||
                "No description available"}
            </p>

            {/* BUTTON */}
            <button
              className="enquiry-btn"
              onClick={() =>
                setShowModal(true)
              }
            >
              Enquire Now
            </button>

          </div>

        </div>

      </div>

      {/* ================= ENQUIRY MODAL ================= */}

      {showModal && (
        <div className="enquiry-modal-overlay">

          <div className="enquiry-modal">

            <button
              className="close-modal-btn"
              onClick={() =>
                setShowModal(false)
              }
            >
              ×
            </button>

            <h2>
              Product Enquiry
            </h2>

            <form
              onSubmit={handleSubmit}
              className="enquiry-form"
            >

              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={form.fullName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
              />

              <input
                type="number"
                name="quantity"
                placeholder="Quantity"
                value={form.quantity}
                onChange={handleChange}
                min="1"
              />

              <input
                type="text"
                name="location"
                placeholder="Location"
                value={form.location}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Message"
                value={form.message}
                onChange={handleChange}
              />

              <button
                type="submit"
                className="submit-enquiry-btn"
                disabled={submitting}
              >
                {submitting
                  ? "Submitting..."
                  : "Submit Enquiry"}
              </button>

            </form>

          </div>

        </div>
      )}

      {/* ================= SUCCESS MODAL ================= */}

      {showSuccess && (
        <div className="success-modal-overlay">

          <div className="success-modal">

            <div className="success-icon">
              ✓
            </div>

            <h2>Success</h2>

            <p>{successMessage}</p>

            <button
              onClick={() =>
                setShowSuccess(false)
              }
            >
              Continue
            </button>

          </div>

        </div>
      )}
    </>
  );
}