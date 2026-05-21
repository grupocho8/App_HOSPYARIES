import React from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarVenta = ({
  show,
  onHide,
  ventaSeleccionada,
  eliminarVenta,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      size="sm"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Eliminar Venta</Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-3">
        <div className="mb-3">
          <i
            className="bi bi-exclamation-triangle-fill"
            style={{
              fontSize: "3rem",
              color: "#dc3545",
            }}
          ></i>
        </div>

        <h5 className="fw-bold mb-3">¿Eliminar registro?</h5>

        <p className="text-muted mb-0">Esta acción no se puede deshacer.</p>

        <p className="text-muted">
          Se eliminará la venta de
          <strong>
            {" "}
            {ventaSeleccionada?.reservaciones?.clientes
              ? `${ventaSeleccionada.reservaciones.clientes.nombre} ${
                  ventaSeleccionada.reservaciones.clientes.apellido || ""
                }`
              : ""}
          </strong>
        </p>
      </Modal.Body>

      <Modal.Footer>
        {/* CANCELAR */}
        <Button
          variant="secondary"
          onClick={onHide}
          className="border-0"
          style={{
            borderRadius: "10px",
            minWidth: "120px",
          }}
        >
          Cancelar
        </Button>

        {/* ELIMINAR */}
        <Button
          variant="danger"
          onClick={eliminarVenta}
          className="border-0"
          style={{
            borderRadius: "10px",
            minWidth: "120px",
          }}
        >
          Eliminar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarVenta;
