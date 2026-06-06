import React from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ModalEnvioCorreoReservaciones = ({
  mostrarModalCorreo,
  setMostrarModalCorreo,
  emailDestino,
  setEmailDestino,
  enviandoCorreo,
  enviarCorreoReservaciones,
  totalReservaciones
}) => {
  return (
    <Modal show={mostrarModalCorreo} onHide={() => setMostrarModalCorreo(false)} centered>
      <Modal.Header closeButton className="color-navbar text-white">
        <Modal.Title>Enviar Listado de Reservaciones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Correo Destino</Form.Label>
          <Form.Control
            type="email"
            placeholder="ejemplo@correo.com"
            value={emailDestino}
            onChange={(e) => setEmailDestino(e.target.value)}
          />
        </Form.Group>
        <small className="text-muted">
          Se enviará el reporte con las <strong>{totalReservaciones}</strong> reservaciones actuales.
        </small>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalCorreo(false)}>
          Cancelar
        </Button>
        <Button
          className="color-navbar border-0 text-white"
          onClick={enviarCorreoReservaciones}
          disabled={enviandoCorreo}
        >
          {enviandoCorreo ? "Enviando..." : "Enviar Correo"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEnvioCorreoReservaciones;
