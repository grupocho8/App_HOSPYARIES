import React from "react";
import { Card, Badge, Row, Col, Button } from "react-bootstrap";

const TarjetaCatalogo = ({ producto, categoriaNombre }) => {
  
  const getEstadoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'DISPONIBLE': return '#d1e7dd'; // Verde clarito
      case 'OCUPADA': return '#f8d7da';    // Rojo clarito
      case 'RESERVADA': return '#15ff00';  // Amarillo clarito
      default: return '#e2e3e5';
    }
  };

  const getTextoColor = (estado) => {
    switch (estado?.toUpperCase()) {
      case 'DISPONIBLE': return '#00ff40';
      case 'OCUPADA': return '#d9ff00';
      case 'RESERVADA': return '#00ff15';
      default: return '#41464b';
    }
  };

  return (
    <Card className="mb-3 border-0 shadow-sm" style={{ borderRadius: "12px", backgroundColor: "#fff" }}>
      <Card.Body className="p-3">
        <Row className="align-items-center">
          {/* Imagen estilo Figma: Cuadrada y con bordes redondeados */}
          <Col xs={12} md={3} lg={2} className="mb-3 mb-md-0">
            <div style={{ 
              width: "100%", 
              aspectRatio: "1/1", 
              overflow: "hidden", 
              borderRadius: "12px" 
            }}>
              {producto.url_imagen ? (
                <img
                  src={producto.url_imagen}
                  alt={producto.nombre_producto}
                  className="w-100 h-100 object-fit-cover"
                />
              ) : (
                <div className="bg-light d-flex align-items-center justify-content-center h-100">
                  <i className="bi bi-image text-muted fs-2"></i>
                </div>
              )}
            </div>
          </Col>

          {/* Información Principal */}
          <Col xs={12} md={6} lg={7}>
            <div className="ps-md-2">
              <h4 className="fw-bold mb-1" style={{ color: "#333", fontSize: "1.4rem" }}>
                {producto.descripcion_producto} {/* Ej: UniPersonal */}
              </h4>
              <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                {producto.nombre_producto} {/* Ej: Habitaciones: 15 */}
              </p>

              <Row className="g-2 mt-2">
                <Col xs={6} md={4}>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Capacidad:</div>
                  <div className="text-dark d-flex align-items-center">
                    <i className="bi bi-person-fill me-1"></i>
                    <span style={{ fontSize: "0.9rem" }}>
                        {producto.descripcion_producto?.toLowerCase().includes('doble') ? '4 Adultos' : '1 Adulto'}
                    </span>
                  </div>
                </Col>
                <Col xs={12} md={8}>
                  <div className="text-muted small fw-bold text-uppercase" style={{ fontSize: "0.7rem" }}>Amenidades a elección:</div>
                  <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                    TV, AC, Ventilador, Amenities
                  </div>
                </Col>
              </Row>

              <div className="mt-3">
                <Badge 
                  style={{ 
                    backgroundColor: getEstadoColor(categoriaNombre), 
                    color: getTextoColor(categoriaNombre),
                    fontSize: "0.75rem",
                    fontWeight: "500",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "none"
                  }}
                >
                  {categoriaNombre?.toLowerCase()}
                </Badge>
              </div>
            </div>
          </Col>

          {/* Precio y Botón (Alineado a la derecha como Figma) */}
          <Col xs={12} md={3} lg={3} className="text-md-end mt-3 mt-md-0 border-start ps-4">
            <div className="mb-4">
              <h4 className="fw-bold mb-0" style={{ color: "#222" }}>
                C$ {parseFloat(producto.precio_venta).toFixed(0)}<span style={{ fontSize: "0.9rem", fontWeight: "normal" }}>/noche</span>
              </h4>
            </div>
            <Button 
              className="px-4 py-2 fw-bold" 
              style={{ 
                backgroundColor: "#0F5C4F", 
                border: "none",
                borderRadius: "8px",
                fontSize: "0.9rem"
              }}
            >
              Editar
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default TarjetaCatalogo;