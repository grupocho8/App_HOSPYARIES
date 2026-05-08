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
              <div className="text-success fw-bold h5 mb-0">
                C$ {parseFloat(v.monto || 0).toFixed(2)}
              </div>
              <Badge 
                bg={v.empleados?.tipo_turno === "dia" ? "info" : "secondary"} 
                className="mt-1"
                style={{ fontSize: '0.65rem' }}
              >
                {v.empleados?.tipo_turno === "dia" ? "Turno Día" : "Turno Noche"}
              </Badge>
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