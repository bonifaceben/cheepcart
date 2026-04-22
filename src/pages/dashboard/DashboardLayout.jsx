import { Container, Row, Col } from "react-bootstrap";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import Header from "../../components/layout/Header";
import "./Dashboard.css";

export default function DashboardLayout() {
  return (
    <>
      <Header />

      <Container fluid className="cc-dashboard">
        <Row>

          {/* Sidebar */}
          <Col md={3} lg={2} className="cc-dashboard-sidebar">
            <DashboardSidebar />
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="cc-dashboard-content">
            <Outlet />
          </Col>

        </Row>
      </Container>
    </>
  );
}
    