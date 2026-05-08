import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./category.css";

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  // ================= FILTER STATES =================
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  // ================= FETCH =================
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);

        // ================= BUILD URL =================
        let url = `${API_BASE_URL}/products?category=${slug}`;

        if (keyword) {
          url += `&keyword=${keyword}`;
        }

        if (sort) {
          url += `&sort=${sort}`;
        }

        if (min) {
          url += `&min=${min}`;
        }

        if (max) {
          url += `&max=${max}`;
        }

        const res = await fetch(url);

        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);

          // CATEGORY NAME
          if (data.products?.length > 0) {
            setCategoryName(
              data.products[0].category?.name || "Category"
            );
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [slug, keyword, sort, min, max]);

  // ================= LOADING =================
  if (loading) {
    return (
      <div className="category-page">

        {/* HEADER SKELETON */}
        <div className="category-header-page skeleton-header">
          <div className="skeleton-heading"></div>
          <div className="skeleton-sub"></div>
        </div>

        {/* PRODUCTS SKELETON */}
        <div className="category-skeleton-grid">

          {[...Array(8)].map((_, i) => (
            <div key={i} className="category-skeleton-card">

              <div className="skeleton-image"></div>

              <div className="skeleton-text title"></div>

              <div className="skeleton-text price"></div>

            </div>
          ))}

        </div>

      </div>
    );
  }

  return (
    <div className="category-page">

      {/* ================= HEADER ================= */}
      <div className="category-header-page">

        <div>
          <h2>{categoryName}</h2>
          <p>{products.length} Products Found</p>
        </div>

      </div>

      {/* ================= MAIN LAYOUT ================= */}
      <div className="category-layout">

        {/* ================= FILTER SIDEBAR ================= */}
        <div className="filter-sidebar">

          <div className="filter-card">

            {/* PRICE TOP */}
            <div className="filter-top">

              <h4>PRICE (₦)</h4>

              <button className="apply-btn">
                Apply
              </button>

            </div>

            

            {/* SEARCH */}
            <input
              type="text"
              placeholder="Search products..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="filter-search"
            />

            {/* SORT */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="">Sort Products</option>

              <option value="price_asc">
                Price: Low to High
              </option>

              <option value="price_desc">
                Price: High to Low
              </option>

              <option value="best_selling">
                Best Selling
              </option>
            </select>

          </div>

        </div>

        {/* ================= PRODUCTS ================= */}
        <div className="products-content">

          <div className="product-grid">

            {products.map((product) => (
              <div
                key={product._id}
                className="product-item"
                onClick={() => navigate(`/product/${product.slug}`)}
              >

                <img
                  src={product.images?.[0]?.secure_url || ""}
                  alt={product.name}
                />

                <div className="product-name">
                  {product.name}
                </div>

                <div className="product-price">
                  ₦{Number(product.price).toLocaleString()}
                </div>

              </div>
            ))}

          </div>

          {/* EMPTY */}
          {products.length === 0 && (
            <div className="empty-category">
              <p>No products found in this category.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}