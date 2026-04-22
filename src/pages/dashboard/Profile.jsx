import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  Badge
} from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config/api";
import "../Profile.css";

export default function Profile() {
  const { token, user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [user]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Update failed.");
      }

      setSuccess("Profile updated successfully ✅");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );
  }

  const initials =
    user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <Container className="cc-profile-wrapper">

      <Row>
        {/* LEFT SIDE — USER SUMMARY */}
        <Col md={4}>
          <Card className="cc-profile-card text-center">
            <Card.Body>

              <div className="cc-profile-avatar">
                {initials}
              </div>

              <h5 className="mt-3">{user?.name}</h5>
              <p className="text-muted">{user?.email}</p>

              <div className="mb-2">
                <span className="cc-role-badge me-2">
  {user?.role}
</span>

{user?.isVerified && (
  <span className="cc-verified-badge">
    Verified
  </span>
)}


              </div>

            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT SIDE — EDIT FORM */}
        <Col md={8}>
          <Card className="cc-profile-form-card">
            <Card.Body>

              <h4 className="mb-4">Edit Profile</h4>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">{success}</Alert>}

              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value
                      })
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    disabled
                  />
                  <small className="text-muted">
                    Email cannot be changed
                  </small>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })
                    }
                  />
                </Form.Group>

                <Button
                  type="submit"
                  className="cc-orange-btn"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </Button>

              </Form>

            </Card.Body>
          </Card>
        </Col>
      </Row>

    </Container>
  );
}
