import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionVenta = ({ show, onHide, ventaSeleccionada, setVentaSeleccionada, actualizarVenta }) => {
  
  const manejarCambio = (e) => {
    setVentaSeleccionada({
      ...ventaSeleccionada,
      monto: e.target.value
    });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Editar Venta</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">CLIENTE</Form.Label>
            <Form.Control 
              type="text" 
              disabled 
              value={ventaSeleccionada?.reservaciones?.clientes?.nombre || ""} 
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">NUEVO MONTO (C$)</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              value={ventaSeleccionada?.monto || ""}
              onChange={manejarCambio}
              autoFocus
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0">
        <Button variant="light" onClick={onHide}>Cancelar</Button>
        <Button className="color-navbar border-0" onClick={actualizarVenta}>
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionVenta;