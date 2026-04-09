import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroCliente = ({
  mostrarModal,
  setMostrarModal,
  nuevoCliente,
  manejoCambioInput,
  agregarCliente,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  // Expresión regular para cédula nicaragüense: 000-000000-0000A
  const regexCedula = /^\d{3}-\d{6}-\d{4}[A-Z]$/;

  // Validamos si la cédula es válida para mostrar error visual y bloquear botón
  const esCedulaValida = regexCedula.test(nuevoCliente.cedula);

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarCliente();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Agregar Cliente</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={nuevoCliente.nombre}
              onChange={manejoCambioInput}
              placeholder="Ingresa el nombre"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa el apellido"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cédula</Form.Label>
            <Form.Control
              type="text"
              name="cedula"
              value={nuevoCliente.cedula}
              onChange={manejoCambioInput}
              placeholder="001-000000-0000A"
              isInvalid={nuevoCliente.cedula !== "" && !esCedulaValida}
            />
            <Form.Control.Feedback type="invalid">
              Formato de cédula incorrecto (000-000000-0000A).
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          // El botón se bloquea si el nombre está vacío o la cédula no es válida
          disabled={
            nuevoCliente.nombre.trim() === "" || 
            !esCedulaValida || 
            deshabilitado
          }
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }} // Usando el color de tu paleta
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCliente;