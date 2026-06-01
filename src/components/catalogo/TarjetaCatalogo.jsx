import React, { useState } from "react";
import { Card, Badge, Row, Col } from "react-bootstrap";

const TarjetaCatalogo = ({ habitación, onClick }) => {
  const [hover, setHover] = useState(false);

  // Colores para los estados
  const colorEstado = {
    disponible: "success",
    ocupada: "danger",
    reservada: "warning",
  };

  return (
    <Card
      onClick={onClick}
      className={`border-0 shadow-sm overflow-hidden transition-all ${hover ? "shadow-lg" : ""}`}
      style={{
        borderRadius: "15px",
        transition: "all 0.3s ease",
        transform: hover ? "translateY(-5px)" : "none",
        cursor: onClick ? "pointer" : "default",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <Row className="g-0 align-items-center">
        {/* Lado de la Imagen: 4 columnas en desktop, full en móvil */}
        <Col md={4}>
          <div
            style={{
              height: "220px",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src={
                habitación.url_imagen ||
                "https://via.placeholder.com/400x300?text=Sin+Imagen"
              }
              alt={`Habitación ${habitación.numero}`}
              className="w-100 h-100 object-fit-cover"
              style={{ transition: "transform 0.5s ease" }}
            />
            <Badge
              bg={colorEstado[habitación.estado?.toLowerCase()] || "secondary"}
              className="position-absolute top-0 start-0 m-3 shadow-sm text-uppercase"
              style={{ padding: "8px 12px" }}
            >
              {habitación.estado}
            </Badge>
          </div>
        </Col>

        {/* Lado del Contenido: 8 columnas en desktop */}
        <Col md={8}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <h4 className="fw-bold mb-1 text-capitalize">
                  {habitación.tipo}
                </h4>
                <p className="text-muted mb-3">
                  Habitación No. {habitación.numero}
                </p>
              </div>
              <div className="text-end">
                <span className="text-success h4 fw-bold">
                  C$ {habitación.precio}
                </span>
              </div>
            </div>

            <hr className="my-3 opacity-10" />

            <div className="d-flex gap-3 text-muted small">
              <span>
                <i className="bi-tv"></i> Smart TV
              </span>
              <span>
                <i className="bi bi-wifi me-1"></i> Wi-Fi
              </span>
              <span>
                <i className="bi bi-wind me-1"></i> Ventilador
              </span>
            </div>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
};

export default TarjetaCatalogo;
