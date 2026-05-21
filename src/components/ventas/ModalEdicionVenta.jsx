import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEdicionVenta = ({
  show,
  onHide,
  ventaSeleccionada,
  setVentaSeleccionada,
  actualizarVenta,
}) => {
  const manejarCambio = (e) => {
    setVentaSeleccionada({
      ...ventaSeleccionada,

      monto: e.target.value,
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Venta</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* CLIENTE */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold text-muted">
              CLIENTE
            </Form.Label>

            <Form.Control
              type="text"
              disabled
              value={
                ventaSeleccionada?.reservaciones?.clientes
                  ? `${ventaSeleccionada.reservaciones.clientes.nombre} ${
                      ventaSeleccionada.reservaciones.clientes.apellido || ""
                    }`
                  : ""
              }
            />
          </Form.Group>

          {/* MONTO */}
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

      <Modal.Footer>
        {/* BOTÓN CANCELAR */}
        <Button
          variant="secondary"
          onClick={onHide}
          className="border-0"
          style={{
            borderRadius: "10px",
            minWidth: "110px",
          }}
        >
          Cancelar
        </Button>

        {/* BOTÓN GUARDAR */}
        <Button
          className="color-navbar border-0"
          onClick={actualizarVenta}
          style={{
            borderRadius: "10px",
            minWidth: "150px",
          }}
        >
          Guardar Cambios
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionVenta;
