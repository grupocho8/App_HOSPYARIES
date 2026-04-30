import React from "react";
import { Row, Col, Card, Badge, Button } from "react-bootstrap";

const TarjetaReservaciones = ({ reservaciones, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <Row>
      {reservaciones.map((res) => (
        <Col key={res.id_reservacion} xs={12} md={6} lg={4} className="mb-4">
          <Card className="h-100 shadow-sm border-0">
            <Card.Header className="bg-white d-flex justify-content-between align-items-center border-0 pt-3">
              <Badge bg={res.estado === 'Confirmada' ? 'success' : res.estado === 'Pendiente' ? 'warning' : 'danger'}>
                {res.estado}
              </Badge>
              <small className="text-muted">ID: {res.id_reservacion.substring(0, 8)}</small>
            </Card.Header>
            <Card.Body>
              <Card.Title className="fw-bold mb-3">
                Habitación {res.habitaciones?.numero}
              </Card.Title>
              <div className="mb-2">
                <i className="bi bi-person-fill me-2 text-primary"></i>
                <strong>Cliente:</strong> {res.clientes?.nombre}
              </div>
              <div className="mb-1">
                <i className="bi bi-calendar-event me-2 text-secondary"></i>
                <strong>Desde:</strong> {new Date(res.fecha_inicio).toLocaleDateString()}
              </div>
              <div className="mb-3">
                <i className="bi bi-calendar-check me-2 text-secondary"></i>
                <strong>Hasta:</strong> {new Date(res.fecha_fin).toLocaleDateString()}
              </div>
            </Card.Body>
            <Card.Footer className="bg-white border-0 d-flex gap-2 pb-3">
              <Button variant="outline-warning" size="sm" className="flex-grow-1" onClick={() => abrirModalEdicion(res)}>
                <i className="bi bi-pencil me-1"></i> Editar
              </Button>
              <Button variant="outline-danger" size="sm" className="flex-grow-1" onClick={() => abrirModalEliminacion(res)}>
                <i className="bi bi-trash me-1"></i> Cancelar
              </Button>
            </Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default TarjetaReservaciones;