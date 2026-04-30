import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalRegistroReservaciones = ({
  mostrarModal,
  setMostrarModal,
  nuevaReservacion,
  setNuevaReservacion,
  agregarReservacion,
  clientes,
  habitaciones,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaReservacion((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarReservacion();
    setDeshabilitado(false);
  };

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nueva Reservación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {/* Selección de Cliente */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cliente *</Form.Label>
                <Form.Select name="id_cliente" value={nuevaReservacion.id_cliente} onChange={manejoCambioInput}>
                  <option value="">Seleccione un cliente...</option>
                  {clientes.map((c) => (
                    <option key={c.id_cliente} value={c.id_cliente}>{c.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Selección de Habitación */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Habitación *</Form.Label>
                <Form.Select name="id_habitacion" value={nuevaReservacion.id_habitacion} onChange={manejoCambioInput}>
                  <option value="">Seleccione habitación...</option>
                  {habitaciones.map((h) => (
                    <option key={h.id_habitacion} value={h.id_habitacion}>Hab. {h.numero}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Fechas */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio *</Form.Label>
                <Form.Control type="date" name="fecha_inicio" value={nuevaReservacion.fecha_inicio} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin *</Form.Label>
                <Form.Control type="date" name="fecha_fin" value={nuevaReservacion.fecha_fin} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>

            {/* Estado */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Estado Inicial</Form.Label>
                <Form.Select name="estado" value={nuevaReservacion.estado} onChange={manejoCambioInput}>
                  <option value="finalizada">Finalizada</option>
                  <option value="activa">Activa</option>
                  <option value="cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
        <Button onClick={handleAgregar} disabled={deshabilitado} style={{ backgroundColor: "#0F5C4F", border: "none" }}>
          Confirmar Reservación
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroReservaciones;