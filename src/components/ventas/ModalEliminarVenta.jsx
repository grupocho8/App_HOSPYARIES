import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarVenta = ({ show, onHide, ventaSeleccionada, eliminarVenta }) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0"></Modal.Header>
      <Modal.Body className="text-center">
        <i className="bi bi-exclamation-triangle text-danger fs-1 mb-3"></i>
        <h5 className="fw-bold">¿Eliminar registro?</h5>
        <p className="text-muted small">
          Esta acción no se puede deshacer. Se eliminará la venta de 
          <strong> {ventaSeleccionada?.reservaciones?.clientes?.nombre}</strong>.
        </p>
      </Modal.Body>
      <Modal.Footer className="border-0 d-flex justify-content-center">
        <Button variant="light" onClick={onHide}>No, cancelar</Button>
        <Button variant="danger" onClick={eliminarVenta}>Sí, eliminar</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarVenta;