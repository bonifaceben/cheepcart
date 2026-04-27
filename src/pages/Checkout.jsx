import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./checkout.css";
import { CheckoutSkeleton } from "../components/Skeleton";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cities, setCities] = useState([]);
  const [towns, setTowns] = useState([]);
  const [shippingTowns, setShippingTowns] = useState([]);

  // ✅ CITY NOW OBJECT
  const [selectedCity, setSelectedCity] = useState({ abbr: "", name: "" });
  const [selectedTown, setSelectedTown] = useState("");

  const [shippingCity, setShippingCity] = useState({ abbr: "", name: "" });
  const [shippingTown, setShippingTown] = useState("");

 const [vat, setVat] = useState(0);

  const [deliveryFee, setDeliveryFee] = useState(null);
  const [totalAmount, setTotalAmount] = useState(0);

  const [shipToDifferent, setShipToDifferent] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    postalCode: "",
    country: "Nigeria",
  });

  const [shippingData, setShippingData] = useState({
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    state: "",
    city: "",
    postalCode: "",
    country: "Nigeria",
  });

  // ================= INIT =================
  useEffect(() => {
  const init = async () => {
    const token = localStorage.getItem("cheepcart_token");

    const citiesData = await fetchCities();

    if (token) {
      await fetchCart(token);
      await fetchSavedAddress(citiesData);
    } else {
      setLoading(false);
    }
  };

  init();
}, []);

  // ================= CART =================
  const fetchCart = async (token) => {
    try {
      const res = await fetch(`${API_BASE_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setCartItems(data.cart?.items || []);
      
      else setError(data.message);
    } catch {
      setError("Error loading cart");
    } finally {
      setLoading(false);
    }
  };

  // ================= BILLING =================
  const fetchSavedAddress = async (citiesData = []) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/checkout/billing-address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.billingAddress) {
        const addr = data.billingAddress;

        setFormData({
          name: addr.fullName || addr.name || "",
          phone: addr.phone || "",
          email: addr.email || "",
          addressLine1: addr.addressLine1 || "",
          addressLine2: addr.addressLine2 || "",
          state: addr.state || "",
          city: addr.city || "",
          postalCode: addr.postalCode || "",
          country: addr.country || "Nigeria",
        });

        // ✅ MATCH CITY FROM API
const matchedCity = citiesData.find(
  (c) => c.abbr === addr.redstarCityAbbr
);

if (matchedCity) {
  setSelectedCity({
    abbr: matchedCity.abbr,
    name: matchedCity.name,
  });

  // ✅ LOAD TOWNS FIRST
  await fetchTowns(matchedCity.abbr);

  // ✅ THEN SET TOWN
  setSelectedTown(Number(addr.redstarTownId));
}
      }
    } catch {}
  };

  // ================= CITIES =================
  const fetchCities = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/cities`);
    const data = await res.json();

    const citiesData = data.cities || [];
    setCities(citiesData);

    return citiesData; // ✅ IMPORTANT
  } catch {
    setCities([]);
    return [];
  }
};

  // ================= CLEAN TOWNS =================
  const cleanTowns = (towns) => {
    return Array.from(
      new Map(towns.map((t) => [t.id, { ...t, name: t.name.trim() }])).values()
    );
  };

  // ================= TOWNS =================
  const fetchTowns = async (abbr) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/towns/${abbr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setTowns(cleanTowns(data.towns || []));
    } catch {}
  };

  const fetchShippingTowns = async (abbr) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/towns/${abbr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setShippingTowns(cleanTowns(data.towns || []));
    } catch {}
  };

  // ================= WEIGHT =================
  const getTotalWeight = () => {
    return cartItems.reduce((acc, item) => {
      const p = item.product || item;
      return acc + (p.weight || 1) * item.quantity;
    }, 0);
  };

  // ================= SHIPPING =================
  const calculateShipping = async (cityName, townId) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/calculate-fee`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientCity: cityName, // ✅ FULL NAME
          recipientTownID: Number(townId),
          weight: getTotalWeight(),
        }),
      });

      const data = await res.json();

      if (res.ok && data?.checkout?.pricing) {
        const p = data.checkout.pricing;
        setDeliveryFee(p.deliveryFee);
        setTotalAmount(p.totalAmount);
        setVat(p.vatAmount || 0);
      } else {
        console.error("Shipping error:", data);
        setDeliveryFee(null);
      }
    } catch (err) {
      console.error(err);
      setDeliveryFee(null);
    }
  };

  // ================= HANDLERS =================
  const handleCityChange = (e) => {
  const abbr = e.target.value;
  const selected = cities.find((c) => c.abbr === abbr);

  setSelectedCity({
    abbr: selected.abbr,
    name: selected.name,
  });

  // ✅ FIX: sync city to formData
  setFormData((prev) => ({
    ...prev,
    city: selected.name,
  }));

  setSelectedTown("");
  setDeliveryFee(null);
  setTotalAmount(0);

  fetchTowns(selected.abbr);
};

const handleTownChange = (e) => {
  const townId = Number(e.target.value);
  setSelectedTown(townId);
};

const handleShippingCityChange = (e) => {
  const abbr = e.target.value;
  const selected = cities.find((c) => c.abbr === abbr);

  setShippingCity({
    abbr: selected.abbr,
    name: selected.name,
  });

  // ✅ FIX: sync shipping city
  setShippingData((prev) => ({
    ...prev,
    city: selected.name,
  }));

  setShippingTown("");
  setDeliveryFee(null);
  setTotalAmount(0);

  fetchShippingTowns(selected.abbr);
};

const handleShippingTownChange = (e) => {
  const townId = Number(e.target.value);
  setShippingTown(townId);
};

const handleChange = (e) => {
  setFormData({ ...formData, [e.target.name]: e.target.value });
};

const handleShippingChange = (e) => {
  setShippingData({ ...shippingData, [e.target.name]: e.target.value });
};

  // ================= AUTO SHIPPING =================
  useEffect(() => {
    if (
      !shipToDifferent &&
      selectedCity.name &&
      selectedTown &&
      Number(selectedTown) > 0
    ) {
      calculateShipping(selectedCity.name, selectedTown);
    }
  }, [selectedCity, selectedTown, shipToDifferent]);

  useEffect(() => {
    if (
      shipToDifferent &&
      shippingCity.name &&
      shippingTown &&
      Number(shippingTown) > 0
    ) {
      calculateShipping(shippingCity.name, shippingTown);
    }
  }, [shippingCity, shippingTown, shipToDifferent]);

  // ================= VALIDATION =================
  const isBillingValid =
    formData.name &&
    formData.phone &&
    formData.addressLine1 &&
    selectedCity.name &&
    selectedTown;

  const isShippingValid = shipToDifferent
    ? shippingData.name &&
      shippingData.phone &&
      shippingData.addressLine1 &&
      shippingCity.name &&
      shippingTown
    : true;

  const isFormValid = isBillingValid && isShippingValid;

  // ================= PLACE ORDER =================
  const handlePlaceOrder = async () => {
    const token = localStorage.getItem("cheepcart_token");

    const billingAddress = {
  fullName: formData.name,
  phone: formData.phone,
  email: formData.email,
  addressLine1: formData.addressLine1,
  addressLine2: formData.addressLine2 || "",

  // ✅ FIX: fallback if empty
  state: formData.state || selectedCity.name || "N/A",

  city: formData.city,
  postalCode: formData.postalCode,
  country: formData.country,
  redstarCityAbbr: selectedCity.abbr,
  redstarTownId: Number(selectedTown),
};

    const shippingAddress = shipToDifferent
      ? {
          fullName: shippingData.name,
          phone: shippingData.phone,
          email: shippingData.email,
          addressLine1: shippingData.addressLine1,
          addressLine2: shippingData.addressLine2 || "",
          state: shippingData.state,
          city: shippingData.city,
          postalCode: shippingData.postalCode,
          country: shippingData.country,
          redstarCityAbbr: shippingCity.abbr,
          redstarTownId: Number(shippingTown),
        }
      : billingAddress;

    const payload = {
      shipToDifferentAddress: shipToDifferent,
      recipientCity: shipToDifferent
        ? shippingCity.name
        : selectedCity.name,
      recipientTownID: Number(
        shipToDifferent ? shippingTown : selectedTown
      ),
      billingAddress,
      shippingAddress,
    };

    try {
      const res = await fetch(`${API_BASE_URL}/checkout/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        navigate("/checkout-summary", { state: data.checkout });
      } else {
        alert(data.message);
      }
    } catch {
      alert("Something went wrong");
    }
  };

  // ================= TOTAL =================
  const subtotal = cartItems.reduce((acc, item) => {
    const p = item.product || item;
    return acc + p.price * item.quantity;
  }, 0);

  if (loading) return <CheckoutSkeleton/>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">

        <div className="checkout-left">
          <h2>BILLING DETAILS</h2>

          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="addressLine1" placeholder="Address" value={formData.addressLine1} onChange={handleChange} />

          <select value={selectedCity.abbr} onChange={handleCityChange}>
            <option value="">Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.abbr}>{c.name}</option>
            ))}
          </select>

          <select value={selectedTown} onChange={handleTownChange}>
            <option value="">Select Town</option>
            {towns.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                checked={shipToDifferent}
                onChange={() => setShipToDifferent(!shipToDifferent)}
              />
              <span className="ship-dif">Ship to a different address?</span>
            </label>
          </div>

          {shipToDifferent && (
            <>
              <h3>SHIPPING DETAILS</h3>

              <input name="name" placeholder="Full Name" onChange={handleShippingChange} />
              <input name="phone" placeholder="Phone" onChange={handleShippingChange} />
              <input name="addressLine1" placeholder="Address" onChange={handleShippingChange} />

              <select value={shippingCity.abbr} onChange={handleShippingCityChange}>
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.abbr}>{c.name}</option>
                ))}
              </select>

              <select value={shippingTown} onChange={handleShippingTownChange}>
                <option value="">Select Town</option>
                {shippingTowns.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </>
          )}
        </div>

        <div className="checkout-right">
  <h3>YOUR ORDER</h3>

  {cartItems.map((item, i) => {
    const product = item.product || item;

    const image =
      product.images?.[0]?.secure_url ||
      item.image ||
      "/placeholder.png";

    const name = product.name;
    const price = product.price || item.price || 0;
    const slug = product.slug || item.slug || "";

    return (
      <div key={i} className="order-item">
        <div className="order-item-left">
          <img
            src={image}
            alt={name}
            className="order-item-image"
            onClick={() => navigate(`/product/${slug}`)}
          />

          <span>{name} × {item.quantity}</span>
        </div>

        <p className="price-checkout">₦{(price * item.quantity).toLocaleString()}</p>
      </div>
    );
  })}

 < hr/>

  <p>Subtotal: ₦{subtotal.toLocaleString()}</p>

<p>
  Shipping:{" "}
  {deliveryFee !== null ? `₦${deliveryFee.toLocaleString()}` : "Select location"}
</p>

<p>
  VAT:{" "}
  {deliveryFee !== null ? `₦${vat.toLocaleString()}` : "—"}
</p>

<hr />

<h3>Total: ₦{(totalAmount || subtotal).toLocaleString()}</h3>

  <button
    className={`place-order-btn ${!isFormValid ? "disabled-btn" : ""}`}
    disabled={!isFormValid}
    onClick={handlePlaceOrder}
  >
    Place Order
  </button>
</div>

      </div>
    </div>
  );
}