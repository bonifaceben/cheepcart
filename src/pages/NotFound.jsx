import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-page">

      <div className="notfound-card">

        <div className="notfound-icon">
          🔎
        </div>

        <h1>No results found!</h1>

        <p>
          Unfortunately we couldn't find
          any page or product.
        </p>

        <button
          onClick={() => navigate("/")}
        >
          Go to homepage
        </button>

      </div>

    </div>
  );
}