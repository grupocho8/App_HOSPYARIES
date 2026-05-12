import React from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";

const TarjetaVenta = ({ v, index, setVentaSeleccionada, setShowEditar, setShowEliminar }) => {
  return (
    <Card className="border-0 shadow-sm mb-3 overflow-hidden" style={{ borderRadius: "15px" }}>
      <Row className="g-0 align-items-center flex-nowrap">
        
        {/* LADO IZQUIERDO: Info Principal (50%) */}
        <Col xs={6} className="p-3 border-end bg-light">
          <div className="d-flex flex-column h-100">
            <div className="mb-1">
              <Badge bg="dark" className="mb-2" style={{ fontSize: '0.7rem' }}>
                #{index + 1}
              </Badge>
            </div>
            <h6 className="fw-bold mb-1 text-truncate" style={{ color: '#2c6c62' }}>
              {v.reservaciones?.clientes?.nombre || "N/A"}
            </h6>
            <div className="small text-muted">
              <i className="bi bi-door-open me-1"></i>
              Hab: {v.reservaciones?.habitaciones?.numero || "—"}
            </div>
            <div className="small text-muted mt-1">
              <i className="bi bi-calendar3 me-1"></i>
              {v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F"}
            </div>
          </div>
        </Col>

        {/* LADO DERECHO: Monto y Acciones (50%) */}
        <Col xs={6} className="p-3 bg-white text-end">
          <div className="d-flex flex-column justify-content-between h-100">
            <div>
              <div className="text-success fw-bold h5 mb-2">
                C$ {parseFloat(v.monto || 0).toFixed(2)}
              </div>
              
              {/* DISTINTIVO DE TURNO PERSONALIZADO */}
              <span
                className="badge px-3 py-2"
                style={{
                  backgroundColor:
                    v.empleados?.tipo_turno === "dia"
                      ? "#59cbcb"
                      : "#faec8e",
                  color:
                    v.empleados?.tipo_turno === "dia"
                      ? "#065f46"
                      : "#991b1b",
                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  display: "inline-block" // Para asegurar que respete el padding
                }}
              >
                {v.empleados?.tipo_turno === "dia"
                  ? "🌞 Día"
                  : "🌙 Noche"}
              </span>
            </div>

            <div className="mt-3">
              <Button
                variant="outline-warning"
                size="sm"
                className="me-2 border-0"
                onClick={() => {
                  setVentaSeleccionada(v);
                  setShowEditar(true);
                }}
              >
                <i className="bi bi-pencil-square"></i>
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                className="border-0"
                onClick={() => {
                  setVentaSeleccionada(v);
                  setShowEliminar(true);
                }}
              >
                <i className="bi bi-trash3"></i>
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </Card>
  );
};

export default TarjetaVenta;