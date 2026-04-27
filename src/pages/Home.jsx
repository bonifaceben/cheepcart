import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Home.css";
import { ProductGridSkeleton } from "../components/Skeleton";
import loaderIcon from "../assets/onloadicon.png";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔥 MAIN BANNER
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [bannerLoading, setBannerLoading] = useState(true);

  // 🔥 SIDE BANNER
  const [sideBanner, setSideBanner] = useState(null);
  const [sideIndex, setSideIndex] = useState(0);
  const [sideLoading, setSideLoading] = useState(true);

  const navigate = useNavigate();

  // ================= PRODUCTS =================
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_BASE_URL}/products`);
        const data = await res.json();

        if (res.ok) setProducts(data.products);
        else setError("Failed to load products.");
      } catch {
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ================= MAIN BANNERS =================
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannerLoading(true);

        const res = await fetch(`${API_BASE_URL}/banners`);
        const data = await res.json();

        if (data.success) {
          const filtered = data.banners
            .filter(b => b.type === "hero" && b.isActive)
            .sort((a, b) => a.order - b.order);

          setBanners(filtered);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setBannerLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // ================= MAIN SLIDE =================
  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setCurrentBanner(prev => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners]);

  // ================= SIDE BANNER =================
  useEffect(() => {
    const fetchSideBanner = async () => {
      try {
        setSideLoading(true);

        const res = await fetch(`${API_BASE_URL}/side-banners`);
        const data = await res.json();

        if (data.success && data.banner?.isActive) {
          setSideBanner(data.banner);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSideLoading(false);
      }
    };

    fetchSideBanner();
  }, []);

  // ================= SIDE ROTATE =================
  useEffect(() => {
    if (!sideBanner?.mediaItems?.length) return;

    const interval = setInterval(() => {
      setSideIndex(prev => (prev + 1) % sideBanner.mediaItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [sideBanner]);

  // ================= NAVIGATION =================
  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  return (
    <>
      <Container fluid className="cc-home">
        <div className="cc-home-grid">

          {/* LEFT */}
          <aside className="cc-categories">
            {[
              "Appliances",
              "Phones & Tablets",
              "Health & Beauty",
              "Electronics",
              "Fashion",
              "Supermarket",
              "Other categories",
            ].map((cat, i) => (
              <div key={i} className="cc-category-item">
                {cat}
              </div>
            ))}
          </aside>

          {/* ================= MAIN BANNER ================= */}
          <main className="cc-banner">

            {bannerLoading && (
              <div className="cc-banner-loader">
                <img src={loaderIcon} alt="loading" />
              </div>
            )}

            {!bannerLoading && banners.length > 0 && (
              <div className="cc-banner-slider">

                <div
                  className="cc-banner-track"
                  style={{
                    transform: `translateX(-${currentBanner * 100}%)`,
                  }}
                >
                  {banners.map((banner) => {
                    const media = banner.mediaItems?.[0];

                    return (
                      <a key={banner._id} href={banner.link || "#"} className="cc-banner-slide">
                        {media?.resource_type === "video" ? (
                          <video src={media.secure_url} autoPlay muted loop className="cc-banner-media" />
                        ) : (
                          <img src={media?.secure_url} alt="banner" className="cc-banner-media" />
                        )}
                      </a>
                    );
                  })}
                </div>

                {/* DOTS */}
                <div className="cc-banner-dots">
                  {banners.map((_, i) => (
                    <span
                      key={i}
                      className={`dot ${i === currentBanner ? "active" : ""}`}
                      onClick={() => setCurrentBanner(i)}
                    />
                  ))}
                </div>

              </div>
            )}

          </main>

          {/* ================= SIDE BANNER ================= */}
          <aside className="cc-side-cards">

            {sideLoading && (
              <div className="cc-side-loader">
                <img src={loaderIcon} alt="loading" />
              </div>
            )}

            {!sideLoading && sideBanner && (
              <a href={sideBanner.link || "#"} className="cc-side-banner">

                {(() => {
                  const media = sideBanner.mediaItems?.[sideIndex];

                  if (!media) return null;

                  if (media.resource_type === "video") {
                    return (
                      <video src={media.secure_url} autoPlay muted loop className="cc-side-media" />
                    );
                  }

                  return (
                    <img src={media.secure_url} alt="side banner" className="cc-side-media" />
                  );
                })()}

              </a>
            )}

          </aside>

        </div>
      </Container>

      {/* ================= PRODUCTS ================= */}
      <div className="cc-products">
        <h3>Flash Sales</h3>

        <div className="product-grid">
          {loading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            products.map((product) => {
              const discountPercent =
                product.comparePrice &&
                Number(product.comparePrice) > Number(product.price)
                  ? Math.round(
                      ((Number(product.comparePrice) - Number(product.price)) /
                        Number(product.comparePrice)) * 100
                    )
                  : 0;

              return (
                <div
                  key={product._id}
                  className="product-item"
                  onClick={() => handleProductClick(product.slug)}
                >
                  {discountPercent > 0 && (
                    <div className="discount-badge-home">-{discountPercent}%</div>
                  )}

                  <img
                    src={product.images?.[0]?.secure_url || ""}
                    alt={product.name}
                    className="product-image"
                  />

                  <div className="product-name">
                    {product.name.length > 20
                      ? `${product.name.substring(0, 20)}...`
                      : product.name}
                  </div>

                  <div className="product-price">
                    ₦{Number(product.price || 0).toLocaleString()}
                  </div>

                  <div className="product-compare-price">
                    {product.comparePrice && (
                      <s>₦{Number(product.comparePrice).toLocaleString()}</s>
                    )}
                  </div>

                  <div className="product-stock">
                    <div className="stock-progress-bar">
                      <div
                        className="stock-progress"
                        style={{
                          width: `${Math.min((product.stock / 100) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <span>{product.stock} items left</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}