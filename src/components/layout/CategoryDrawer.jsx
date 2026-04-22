import { Offcanvas, ListGroup } from "react-bootstrap";
import { categories } from "../../data/categories";

export default function CategoryDrawer({ show, onClose }) {
  return (
    <Offcanvas show={show} onHide={onClose} placement="start">
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Categories</Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body>
        <ListGroup variant="flush">
          {categories.map((cat, i) => (
            <ListGroup.Item key={i} action>
              {cat}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
