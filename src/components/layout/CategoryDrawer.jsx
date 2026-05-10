import {
  useEffect,
  useState,
} from "react";

import {
  Offcanvas,
  ListGroup,
} from "react-bootstrap";

import {
  useNavigate,
} from "react-router-dom";

import { API_BASE_URL } from "../../config/api";

export default function CategoryDrawer({
  show,
  onClose,
}) {
  const navigate = useNavigate();

  const [categories, setCategories] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  // ================= FETCH CATEGORIES =================
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `${API_BASE_URL}/categories`
        );

        const data = await res.json();

        if (data.success) {
          const activeCategories =
            data.categories
              ?.filter(
                (cat) => cat.isActive
              )
              ?.sort(
                (a, b) =>
                  a.order - b.order
              );

          setCategories(
            activeCategories || []
          );
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Offcanvas
      show={show}
      onHide={onClose}
      placement="start"
    >

      <Offcanvas.Header closeButton>

        <Offcanvas.Title>
          Categories
        </Offcanvas.Title>

      </Offcanvas.Header>

      <Offcanvas.Body>

        <ListGroup variant="flush">

          {loading ? (
            <ListGroup.Item>
              Loading...
            </ListGroup.Item>
          ) : (
            categories.map((cat) => (
              <ListGroup.Item
                key={cat._id}
                action
                onClick={() => {
                  navigate(
                    `/category/${cat._id}`
                  );

                  onClose();
                }}
              >
                {cat.name}
              </ListGroup.Item>
            ))
          )}

        </ListGroup>

      </Offcanvas.Body>

    </Offcanvas>
  );
}