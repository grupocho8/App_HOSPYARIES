import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";

const ModalEdicionReservaciones = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  reservacionEditar,
  setReservacionEditar,
  actualizarReservacion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setReservacionEditar((prev) => ({ ...prev, [name]: value }));
  };

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarReservacion();
    setDeshabilitado(false);
  };

  if (!reservacionEditar) return null;

  return (
    <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Modificar Reservación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <Col xs={12} className="mb-3">
              <h6>Habitación {reservacionEditar.habitaciones?.numero} - {reservacionEditar.clientes?.nombre}</h6>
            </Col>
            <Col xs={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio</Form.Label>
                <Form.Control type="date" name="fecha_inicio" value={reservacionEditar.fecha_inicio} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>
            <Col xs={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin</Form.Label>
                <Form.Control type="date" name="fecha_fin" value={reservacionEditar.fecha_fin} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Estado de la Reserva</Form.Label>
                <Form.Select name="estado" value={reservacionEditar.estado} onChange={manejoCambioInput}>
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
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>Cerrar</Button>
        <Button variant="primary" onClick={handleActualizar} disabled={deshabilitado}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionReservaciones;