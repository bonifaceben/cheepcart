import "./Skeleton.css";

/* 🔹 BASE (reusable block) */
export const Skeleton = ({ className = "" }) => {
  return <div className={`skeleton ${className}`} />;
};

/* 🔹 PRODUCT CARD */
export const ProductCardSkeleton = () => {
  return (
    <div className="product-item skeleton-card">
      <Skeleton className="skeleton-image" />
      <Skeleton className="skeleton-text title" />
      <Skeleton className="skeleton-text price" />
      <Skeleton className="skeleton-text small" />

      <div className="skeleton-stock">
        <Skeleton className="skeleton-bar" />
      </div>
    </div>
  );
};

/* 🔹 PRODUCT GRID */
export const ProductGridSkeleton = ({ count = 12 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </>
  );
};

/* 🔹 PRODUCT DETAILS */
export const ProductDetailsSkeleton = () => {
  return (
    <div className="pd-container">
      <Skeleton className="pd-image" />

      <div>
        <Skeleton className="title" />
        <Skeleton className="price" />
        <Skeleton className="small" />
        <Skeleton className="small" />
        <Skeleton className="button" />
      </div>
    </div>
  );
};

/* 🔹 CART */
export const CartSkeleton = () => {
  return (
    <div className="cart-container">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="cart-item">
          <Skeleton className="cart-img" />

          <div>
            <Skeleton className="title" />
            <Skeleton className="small" />
          </div>

          <Skeleton className="price" />
        </div>
      ))}
    </div>
  );
};

/* 🔹 CHECKOUT */
export const CheckoutSkeleton = () => {
  return (
    <div className="checkout-container2">
      
      {/* LEFT - FORM */}
      <div className="checkout-form">
        <div className="skeleton form-line"></div>
        <div className="skeleton form-line"></div>

        <div className="form-row">
          <div className="skeleton form-line half"></div>
          <div className="skeleton form-line half"></div>
        </div>

        <div className="skeleton form-line"></div>
        <div className="skeleton form-line"></div>

        <div className="skeleton checkout-button"></div>
      </div>

      {/* RIGHT - SUMMARY */}
      <div className="skeleton summary-box">
        <div className="skeleton summary-line"></div>
        <div className="skeleton summary-line"></div>
        <div className="skeleton summary-line short"></div>
      </div>
    </div>
  );
};