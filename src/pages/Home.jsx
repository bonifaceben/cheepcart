import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Fetch product data
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();

        if (response.ok) {
          setProducts(data.products);
        } else {
          setError("Failed to load products.");
        }
      } catch (error) {
        setError("Error fetching products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Navigate to product details page using slug
  const handleProductClick = (slug) => {
    navigate(`/product/${slug}`);
  };

  return (
    <>
    
      <Container fluid className="cc-home">
        <div className="cc-home-grid">
          {/* LEFT – CATEGORY LIST */}
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

          {/* CENTER – BANNER */}
          <main className="cc-banner">
            <div className="cc-banner-box">
              <span className="cc-banner-text">
                CHEEPCART DEALS
                <br />
                UP TO <strong>30% OFF</strong>
              </span>
              <button className="cc-banner-btn">SHOP NOW</button>
            </div>
          </main>

          {/* RIGHT – INFO CARDS */}
          <aside className="cc-side-cards">
            <div className="cc-side-card">
              <strong>CALL TO ORDER</strong>
              <p>0700-CHEEPCART</p>
            </div>
          </aside>
        </div>
      </Container>

      {/* Displaying Products */}
      <div className="cc-products">
        <h3>Flash Sales</h3>
        <div className="product-grid">
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="error">{error}</p>
          ) : (
            products.map((product) => {
              const discountPercent =
                product.comparePrice &&
                Number(product.comparePrice) > Number(product.price)
                  ? Math.round(
                      ((Number(product.comparePrice) - Number(product.price)) /
                        Number(product.comparePrice)) *
                        100
                    )
                  : 0;

              return (
                <div
                  key={product._id}
                  className="product-item"
                  onClick={() => handleProductClick(product.slug)}
                >
                  {/* Discount Badge */}
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
                    {product.comparePrice ? (
                      <s>₦{Number(product.comparePrice).toLocaleString()}</s>
                    ) : null}
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