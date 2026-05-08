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

  // 🔥 CATEGORIES
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  // 🔥 CATEGORY PRODUCTS (NEW)
  const [categoryProducts, setCategoryProducts] = useState({});

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

  // ================= CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCatLoading(true);

        const res = await fetch(`${API_BASE_URL}/categories`);
        const data = await res.json();

        if (data.success) {
          const active = data.categories
            .filter(c => c.isActive)
            .sort((a, b) => a.order - b.order);

          setCategories(active);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setCatLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // ================= CATEGORY PRODUCTS =================
  useEffect(() => {
    if (!categories.length) return;

    const fetchCategoryProducts = async () => {
      try {
        const results = {};

        for (const cat of categories) {
          const res = await fetch(
            `${API_BASE_URL}/products?category=${cat._id}&page=1`
          );

          const data = await res.json();

          if (res.ok) {
            results[cat._id] = data.products?.slice(0, 6) || [];
          }
        }

        setCategoryProducts(results);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCategoryProducts();
  }, [categories]);

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

          {/* ================= CATEGORIES ================= */}
          <aside className="cc-categories">
            {catLoading ? (
              <p style={{ padding: "10px" }}>Loading...</p>
            ) : (
              categories.map((cat) => (
                <div
                  key={cat._id}
                  className="cc-category-item"
                  onClick={() => navigate(`/category/${cat._id}`)} // ✅ FIXED
                >
                  {cat.name}
                </div>
              ))
            )}
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
                    return <video src={media.secure_url} autoPlay muted loop className="cc-side-media" />;
                  }

                  return <img src={media.secure_url} alt="side banner" className="cc-side-media" />;
                })()}
              </a>
            )}
          </aside>

        </div>
      </Container>

      {/* ================= FLASH SALES ================= */}

      <div className="home-sections-bg">

      <div className="cc-products">
        <h3>Flash Sales</h3>

        <div className="product-grid">
          {loading ? (
            <ProductGridSkeleton />
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            products.slice(0, 12).map((product) => {
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




      <div className="cc-category-cards">

  {categories.map((cat) => (
    <div
      key={cat._id}
      className="category-card"
      onClick={() => navigate(`/category/${cat._id}`)}
    >
      <img
        src={cat.image || ""}
        alt={cat.name}
      />

      <p>{cat.name}</p>
    </div>
  ))}

</div>

      {/* ================= CATEGORY PRODUCTS ================= */}
{categories.map((cat) => {
  const catProducts = categoryProducts[cat._id];

  if (!catProducts || catProducts.length === 0) return null;

  return (
    <div className="cc-products" key={cat._id}>

      {/* HEADER */}
      <div className="category-orange-header">

        <h3>{cat.name}</h3>

        <span
          className="see-all-btn"
          onClick={() => navigate(`/category/${cat._id}`)}
        >
          See All
        </span>

      </div>

      {/* PRODUCTS */}
      <div className="product-grid">

        {catProducts.slice(0, 5).map((product) => (
          <div
            key={product._id}
            className="product-item"
            onClick={() => handleProductClick(product.slug)}
          >

            <img
              src={product.images?.[0]?.secure_url || ""}
              alt={product.name}
              className="product-image"
            />

            <div className="product-name">
              {product.name}
            </div>

            <div className="product-price">
              ₦{Number(product.price || 0).toLocaleString()}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
})}
      </div>
    </>
  );
}