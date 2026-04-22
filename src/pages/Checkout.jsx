import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api";
import "./checkout.css";

export default function Checkout() {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cities, setCities] = useState([]);
  const [towns, setTowns] = useState([]);
  const [shippingTowns, setShippingTowns] = useState([]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedTown, setSelectedTown] = useState("");

  const [shippingCity, setShippingCity] = useState("");
  const [shippingTown, setShippingTown] = useState("");

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
    const token = localStorage.getItem("cheepcart_token");

    fetchCities();

    const savedCity = localStorage.getItem("selectedCity");
    const savedTown = localStorage.getItem("selectedTown");

    if (savedCity) {
      setSelectedCity(savedCity);
      fetchTowns(savedCity);
    }

    if (savedTown) {
      setSelectedTown(savedTown);
    }

    if (token) {
      fetchCart(token);
      fetchSavedAddress();
    } else {
      setLoading(false);
    }
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
  const fetchSavedAddress = async () => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/checkout/billing-address`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok && data.billingAddress) {
        const addr = data.billingAddress;

        setFormData({
          name: addr.name || "",
          phone: addr.phone || "",
          email: addr.email || "",
          addressLine1: addr.addressLine1 || "",
          addressLine2: addr.addressLine2 || "",
          state: addr.state || "",
          city: addr.city || "",
          postalCode: addr.postalCode || "",
          country: addr.country || "Nigeria",
        });
      }
    } catch {}
  };

  // ================= CITIES =================
  const fetchCities = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/shipping/cities`);
      const data = await res.json();

      if (Array.isArray(data)) setCities(data);
      else setCities(data.cities || []);
    } catch {
      setCities([]);
    }
  };

  // ================= TOWNS =================
  const fetchTowns = async (abbr) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/towns/${abbr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setTowns(data.towns || []);
    } catch {}
  };

  const fetchShippingTowns = async (abbr) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/towns/${abbr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) setShippingTowns(data.towns || []);
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
  const calculateShipping = async (city, townId) => {
    const token = localStorage.getItem("cheepcart_token");

    try {
      const res = await fetch(`${API_BASE_URL}/shipping/calculate-fee`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientCity: city,
          recipientTownID: Number(townId),
          weight: getTotalWeight(),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const p = data.checkout.pricing;
        setDeliveryFee(p.deliveryFee);
        setTotalAmount(p.totalAmount);
      }
    } catch {}
  };

  // ================= HANDLERS =================
  const handleCityChange = (e) => {
    const abbr = e.target.value;
    setSelectedCity(abbr);
    setSelectedTown("");

    localStorage.setItem("selectedCity", abbr);

    fetchTowns(abbr);
  };

  const handleTownChange = (e) => {
    const townId = e.target.value;
    setSelectedTown(townId);

    localStorage.setItem("selectedTown", townId);

    if (!shipToDifferent) {
      calculateShipping(selectedCity, townId);
    }
  };

  const handleShippingCityChange = (e) => {
    const abbr = e.target.value;
    setShippingCity(abbr);
    setShippingTown("");
    fetchShippingTowns(abbr);
  };

  const handleShippingTownChange = (e) => {
    const townId = e.target.value;
    setShippingTown(townId);
    calculateShipping(shippingCity, townId);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShippingChange = (e) => {
    setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  };

  // ================= AUTO SHIPPING =================
  useEffect(() => {
    if (!shipToDifferent && selectedCity && selectedTown) {
      calculateShipping(selectedCity, selectedTown);
    }
  }, [selectedCity, selectedTown, shipToDifferent]);

  useEffect(() => {
    if (shipToDifferent && shippingCity && shippingTown) {
      calculateShipping(shippingCity, shippingTown);
    }
  }, [shippingCity, shippingTown, shipToDifferent]);

  // ================= VALIDATION =================
  const isBillingValid =
    formData.name &&
    formData.phone &&
    formData.addressLine1 &&
    selectedCity &&
    selectedTown;

  const isShippingValid = shipToDifferent
    ? shippingData.name &&
      shippingData.phone &&
      shippingData.addressLine1 &&
      shippingCity &&
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
      state: formData.state,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
      redstarCityAbbr: selectedCity,
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
          redstarCityAbbr: shippingCity,
          redstarTownId: Number(shippingTown),
        }
      : billingAddress;

    const payload = {
      shipToDifferentAddress: shipToDifferent,
      recipientCity: shipToDifferent ? shippingCity : selectedCity,
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
        navigate("/checkout-summary", {
  state: data.checkout,
});
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">

        {/* LEFT */}
        <div className="checkout-left">
          <h2>BILLING DETAILS</h2>

          <input name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} />
          <input name="phone" placeholder="Phone" value={formData.phone} onChange={handleChange} />
          <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
          <input name="addressLine1" placeholder="Address" value={formData.addressLine1} onChange={handleChange} />

          <select value={selectedCity} onChange={handleCityChange}>
            <option>Select City</option>
            {cities.map((c) => (
              <option key={c.id} value={c.abbr}>{c.name}</option>
            ))}
          </select>

          <select value={selectedTown} onChange={handleTownChange}>
            <option>Select Town</option>
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

              <select value={shippingCity} onChange={handleShippingCityChange}>
                <option>Select City</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.abbr}>{c.name}</option>
                ))}
              </select>

              <select value={shippingTown} onChange={handleShippingTownChange}>
                <option>Select Town</option>
                {shippingTowns.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </>
          )}
        </div>

        {/* RIGHT */}
        <div className="checkout-right">
          <h3>YOUR ORDER</h3>

          {cartItems.map((item, i) => {
            const p = item.product || item;
            return (
              <div key={i}>
                <p>{p.name} × {item.quantity}</p>
                <p>₦{(p.price * item.quantity).toLocaleString()}</p>
              </div>
            );
          })}

          <hr />

          <p>Subtotal: ₦{subtotal.toLocaleString()}</p>
          <p>Shipping: {deliveryFee !== null ? `₦${deliveryFee}` : "Select location"}</p>

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