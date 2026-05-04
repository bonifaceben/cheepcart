import { useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import Header from "../../components/layout/Header";
import { List } from "react-bootstrap-icons"; // 👈 add this
import "./Dashboard.css";

export default function DashboardLayout() {
  const [showSidebar, setShowSidebar] = useState(false);

  const openSidebar = () => setShowSidebar(true);
  const closeSidebar = () => setShowSidebar(false);

  return (
    <>
      {/* MAIN HEADER (UNCHANGED) */}
      <Header />

      {/* 🔥 MOBILE FLOATING TOGGLE (NEW) */}
      <button className="cc-mobile-toggle" onClick={openSidebar}>
        <List size={22} />
      </button>

      <Container fluid className="cc-dashboard">
        <Row>

          {/* OVERLAY */}
          {showSidebar && (
            <div className="cc-overlay" onClick={closeSidebar}></div>
          )}

          {/* MOBILE SIDEBAR */}
          <div className={`cc-sidebar-overlay ${showSidebar ? "show" : ""}`}>
            <DashboardSidebar
              onLinkClick={closeSidebar}
              onClose={closeSidebar}
            />
          </div>

          {/* DESKTOP SIDEBAR */}
          <Col md={3} lg={2} className="cc-dashboard-sidebar d-none d-md-block">
            <DashboardSidebar />
          </Col>

          {/* MAIN CONTENT */}
          <Col md={9} lg={10} className="cc-dashboard-content">
            <Outlet />
          </Col>

        </Row>
      </Container>
    </>
  );
}