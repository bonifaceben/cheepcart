import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL } from "../config/api";

export default function Category() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/products?category=${slug}`
        );

        const data = await res.json();

        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="category-page">
      <h2>{slug.replace("-", " ").toUpperCase()}</h2>

      <div className="product-grid">
        {products.map((product) => (
          <div key={product._id} className="product-item">
            <img src={product.images?.[0]?.secure_url} alt={product.name} />
            <p>{product.name}</p>
            <p>₦{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}