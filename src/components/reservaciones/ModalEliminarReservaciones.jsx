import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarReservaciones = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  reservacionEliminar,
  eliminarReservacion,
  cancelarReservacionCliente,
  esCliente,
}) => {
  return (
    <Modal show={mostrarModalEliminacion} onHide={() => setMostrarModalEliminacion(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{esCliente ? "Confirmar Cancelación" : "Confirmar Eliminación"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {esCliente ? (
          <>
            ¿Estás seguro de que deseas <strong>cancelar</strong> tu reservación para la 
            Habitación {reservacionEliminar?.habitaciones?.numero}?
            <br />
            <small className="text-warning mt-2 d-block">Esta acción liberará la habitación y no se podrá deshacer.</small>
          </>
        ) : (
          <>
            ¿Estás seguro de que deseas eliminar permanentemente la reservación del cliente 
            <strong> {reservacionEliminar?.clientes?.nombre}</strong>?
            <br />
            <small className="text-danger mt-2 d-block">Esta acción borrará el registro de la base de datos.</small>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEliminacion(false)}>Volver</Button>
        <Button variant="danger" onClick={esCliente ? cancelarReservacionCliente : eliminarReservacion}>
          {esCliente ? "Sí, Cancelar Reservación" : "Eliminar Definitivamente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarReservaciones;