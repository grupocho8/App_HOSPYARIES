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

  // Expresión regular para solo letras (Nombre/Apellido)
  const regexSoloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  // Expresión regular para cédula nicaragüense
  const regexCedula = /^\d{3}-\d{6}-\d{4}[A-Z]$/;

  // Validaciones constantes
  const esNombreValido = regexSoloLetras.test(nuevoCliente.nombre);
  const esApellidoValido = regexSoloLetras.test(nuevoCliente.apellido);
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
              isInvalid={nuevoCliente.nombre !== "" && !esNombreValido}
            />
            <Form.Control.Feedback type="invalid">
              El nombre no puede contener números ni símbolos.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={nuevoCliente.apellido}
              onChange={manejoCambioInput}
              placeholder="Ingresa el apellido"
              isInvalid={nuevoCliente.apellido !== "" && !esApellidoValido}
            />
            <Form.Control.Feedback type="invalid">
              El apellido no puede contener números ni símbolos.
            </Form.Control.Feedback>
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
          disabled={
            !esNombreValido || 
            !esApellidoValido ||
            !esCedulaValida || 
            deshabilitado
          }
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroCliente;