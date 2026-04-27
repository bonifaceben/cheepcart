// src/components/Footer.jsx

import "./footer.css";
import { FaFacebookF, FaInstagram, FaTwitter, FaWhatsapp } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="cc-footer">

      <div className="footer-container">

        {/* ===== ABOUT ===== */}
        <div className="footer-col">
          <h4>ABOUT CHEEPCART</h4>
          <p>
            CheepCart is built for smart shopping — offering quality products,
            great prices, and a seamless online experience. From everyday
            essentials to trending gadgets, we make it easy to shop better
            and spend less.
          </p>
        </div>

        {/* ===== POLICIES ===== */}
        <div className="footer-col">
          <h4>POLICIES</h4>
          <ul>
            <li>Search</li>
            <li>Terms of service</li>
            <li>Refund policy</li>
            <li>Shipping Policy</li>
            <li>Privacy Policy</li>
            <li>Contact Information</li>
          </ul>
        </div>

        {/* ===== NEWSLETTER ===== */}
        <div className="footer-col">
          <h4>NEWSLETTER</h4>
          <p>
            Subscribe to our newsletter and be the first to receive exclusive offers.
          </p>

          <div className="newsletter-box">
            <input type="email" placeholder="Your email" />
            <button>Subscribe</button>
          </div>
        </div>

      </div>

      {/* ===== BOTTOM ===== */}
      <div className="footer-bottom">

        <p>© 2026 CHEEPCART</p>

        <div className="footer-socials">
          <FaFacebookF />
          <FaTwitter />
          <FaInstagram />
          <FaWhatsapp />
        </div>

      </div>

    </footer>
  );
}