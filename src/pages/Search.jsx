import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./search.css";

export default function Search() {

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const keyword = searchParams.get("keyword") || "";

  const [search, setSearch] = useState(keyword);

  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(false);

  // ================= FETCH PRODUCTS =================
  useEffect(() => {

    if (!keyword) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {

      try {

        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/products?keyword=${keyword}`
        );

        const data = await res.json();

        if (res.ok) {
          setProducts(data.products || []);
        }

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

  }, [keyword]);

  // ================= HANDLE SEARCH =================
  const handleSearch = (e) => {

    e.preventDefault();

    if (!search.trim()) return;

    setSearchParams({
      keyword: search,
    });
  };

  return (
    <div className="search-page">

      {/* ================= SEARCH BAR ================= */}
      <form
        className="search-form-page"
        onSubmit={handleSearch}
      >

        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button type="submit">
          Search
        </button>

      </form>

      {/* ================= HEADER ================= */}
      {keyword && (
        <div className="search-header">

          <h2>
            Search Results for "{keyword}"
          </h2>

          <p>
            {products.length} product(s) found
          </p>

        </div>
      )}

      {/* ================= LOADING ================= */}
      {loading ? (

        <div className="search-loading">
          Loading products...
        </div>

      ) : (

        <>
          {/* ================= PRODUCTS ================= */}
          <div className="search-grid">

            {products.map((product) => (

              <div
                key={product._id}
                className="search-card"
                onClick={() =>
                  navigate(`/product/${product.slug}`)
                }
              >

                <img
                  src={product.images?.[0]?.secure_url || ""}
                  alt={product.name}
                />

                <div className="search-content">

                  <h4>{product.name}</h4>

                  <p className="search-price">
                    ₦{Number(product.price).toLocaleString()}
                  </p>

                </div>

              </div>
            ))}

          </div>

          {/* ================= EMPTY ================= */}
          {!loading && keyword && products.length === 0 && (
            <div className="empty-search">

              <h3>No products found</h3>

              <p>
                Try another search keyword.
              </p>

            </div>
          )}
        </>
      )}

    </div>
  );
}