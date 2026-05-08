import { useState } from "react";
import { API_BASE_URL } from "../config/api";
import { useAuth } from "../context/AuthContext";
import "./shipment-tracker.css";

export default function ShipmentTracker() {
  const { token } = useAuth();

  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!trackingNumber) {
      alert("Please enter tracking number");
      return;
    }

    try {
      setLoading(true);

      // 🔥 ENSURE CORRECT URL (NO DOUBLE /api)
      const url = `${API_BASE_URL}/shipments/track/${encodeURIComponent(
        trackingNumber.trim()
      )}`;

      console.log("Tracking URL:", url);

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Tracking failed");
      }

      setShipment(data.shipment);

    } catch (err) {
      console.error("TRACK ERROR:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tracker-wrapper">

      {/* ===== INPUT ===== */}
      <div className="tracker-input-box">
        <input
          type="text"
          placeholder="Enter tracking number (e.g. RSASB1186443)"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
        />

        <button onClick={handleTrack} disabled={loading}>
          {loading ? "Tracking..." : "Track"}
        </button>
      </div>

      {/* ===== RESULT ===== */}
      {shipment && (
        <div className="tracking-result">

          <h4 className={shipment.status}>
            Status: {shipment.status.replace("_", " ")}
          </h4>

          {/* 🔥 NOT READY YET */}
          {shipment.message && (
            <p className="tracking-warning">{shipment.message}</p>
          )}

          {/* 🔥 FULL DETAILS */}
          {!shipment.message && (
            <>
              <p><strong>Sender:</strong> {shipment.sender}</p>
              <p><strong>Recipient:</strong> {shipment.recipient}</p>
              <p><strong>Delivery Type:</strong> {shipment.deliveryType}</p>

              {/* ===== TIMELINE ===== */}
              <div className="timeline">
                {shipment.timeline?.map((item, i) => (
                  <div key={i} className="timeline-item">
                    <div className={`dot ${item.completed ? "done" : ""}`} />
                    <div>
                      <p className="timeline-title">{item.name}</p>
                      <small>{item.location}</small><br />
                      <small>
                        {new Date(item.date).toLocaleString()}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}