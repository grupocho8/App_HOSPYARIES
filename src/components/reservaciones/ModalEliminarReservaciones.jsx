import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarReservaciones = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  reservacionEliminar,
  eliminarReservacion,
}) => {
  return (
    <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Registro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar permanentemente la reservación del cliente 
        <strong> {reservacionEliminar?.clientes?.nombre}</strong>?
        <br />
        <small className="text-danger mt-2 d-block">Esta acción borrará el registro de la base de datos.</small>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>Cancelar</Button>
        <Button variant="danger" onClick={eliminarReservacion}>Eliminar Definitivamente</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarReservaciones;