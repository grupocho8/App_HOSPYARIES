import React, { useState } from "react";
import { Modal, Form, Button, InputGroup, Row, Col } from "react-bootstrap";

const ModalRegistroEmpleados = ({
  mostrarModal,
  setMostrarModal,
  nuevoEmpleado,
  manejoCambioInput,
  agregarEmpleado,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const [mostrarPassword, setMostrarPassword] = useState(false);

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const regexCelular = /^[0-9]{8}$/;

  const nombreValido =
    nuevoEmpleado.nombre_empleado === "" ||
    regexNombre.test(nuevoEmpleado.nombre_empleado);

  const apellidoValido =
    nuevoEmpleado.apellido_empleado === "" ||
    regexNombre.test(nuevoEmpleado.apellido_empleado);

  const emailValido =
    nuevoEmpleado.email === "" || regexEmail.test(nuevoEmpleado.email);

  const celularValido =
    nuevoEmpleado.celular === "" || regexCelular.test(nuevoEmpleado.celular);

  const passwordValido =
    nuevoEmpleado.password.length >= 4 && nuevoEmpleado.password.length <= 8;

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    if (
      !nuevoEmpleado.nombre_empleado.trim() ||
      !nuevoEmpleado.apellido_empleado.trim() ||
      !nuevoEmpleado.email.trim() ||
      !nuevoEmpleado.tipo_empleado ||
      (nuevoEmpleado.tipo_empleado !== "administrador" &&
        !nuevoEmpleado.tipo_turno) ||
      !nuevoEmpleado.password
    ) {
      alert("Todos los campos obligatorios deben completarse");

      return;
    }

    if (!nombreValido || !apellidoValido) {
      alert("El nombre y apellido no deben contener números");

      return;
    }

    if (!emailValido) {
      alert("Ingresa un correo válido");

      return;
    }

    if (nuevoEmpleado.celular && !celularValido) {
      alert("El celular debe tener exactamente 8 números");

      return;
    }

    if (!passwordValido) {
      alert("La contraseña debe tener entre 4 y 8 caracteres");

      return;
    }

    setDeshabilitado(true);

    await agregarEmpleado();

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
        <Modal.Title>Agregar Empleado</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>

                <Form.Control
                  type="text"
                  name="nombre_empleado"
                  value={nuevoEmpleado.nombre_empleado}
                  onChange={manejoCambioInput}
                  isInvalid={
                    nuevoEmpleado.nombre_empleado !== "" && !nombreValido
                  }
                  placeholder="Ingresa el nombre"
                />

                <Form.Control.Feedback type="invalid">
                  El nombre no debe contener números.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>

                <Form.Control
                  type="text"
                  name="apellido_empleado"
                  value={nuevoEmpleado.apellido_empleado}
                  onChange={manejoCambioInput}
                  isInvalid={
                    nuevoEmpleado.apellido_empleado !== "" && !apellidoValido
                  }
                  placeholder="Ingresa el apellido"
                />

                <Form.Control.Feedback type="invalid">
                  El apellido no debe contener números.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={nuevoEmpleado.email}
              onChange={manejoCambioInput}
              isInvalid={nuevoEmpleado.email !== "" && !emailValido}
              placeholder="ejemplo@correo.com"
            />

            <Form.Control.Feedback type="invalid">
              Ingresa un correo válido.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Celular</Form.Label>

            <Form.Control
              type="text"
              name="celular"
              value={nuevoEmpleado.celular}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "");

                manejoCambioInput({
                  target: {
                    name: "celular",
                    value: valor,
                  },
                });
              }}
              isInvalid={nuevoEmpleado.celular !== "" && !celularValido}
              placeholder="Ingresa celular"
              maxLength={8}
            />

            <Form.Control.Feedback type="invalid">
              El celular debe contener exactamente 8 números.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Empleado</Form.Label>

            <Form.Select
              name="tipo_empleado"
              value={nuevoEmpleado.tipo_empleado}
              onChange={(e) => {
                const valor = e.target.value;

                manejoCambioInput(e);

                // limpiar turno si es administrador
                if (valor === "administrador") {
                  manejoCambioInput({
                    target: {
                      name: "tipo_turno",
                      value: "",
                    },
                  });
                }
              }}
            >
              <option value="">Selecciona un rol</option>

              <option value="administrador">Administrador</option>

              <option value="recepcionista">Recepcionista</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Turno</Form.Label>

            <Form.Select
              name="tipo_turno"
              value={nuevoEmpleado.tipo_turno}
              onChange={manejoCambioInput}
              disabled={nuevoEmpleado.tipo_empleado === "administrador"}
            >
              <option value="">
                {nuevoEmpleado.tipo_empleado === "administrador"
                  ? "No aplica para administrador"
                  : "Selecciona un turno"}
              </option>

              <option value="dia">Día</option>

              <option value="noche">Noche</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>

            <InputGroup>
              <Form.Control
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={nuevoEmpleado.password}
                onChange={manejoCambioInput}
                maxLength={8}
                isInvalid={nuevoEmpleado.password !== "" && !passwordValido}
                placeholder="Máx 8 caracteres"
              />

              <Button
                variant="outline-secondary"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                <i
                  className={`bi ${
                    mostrarPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </Button>

              <Form.Control.Feedback type="invalid">
                Debe tener entre 4 y 8 caracteres.
              </Form.Control.Feedback>
            </InputGroup>
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
            !nombreValido ||
            !apellidoValido ||
            !emailValido ||
            !celularValido ||
            !passwordValido ||
            nuevoEmpleado.nombre_empleado.trim() === "" ||
            nuevoEmpleado.apellido_empleado.trim() === "" ||
            nuevoEmpleado.email.trim() === "" ||
            nuevoEmpleado.tipo_empleado === "" ||
            (nuevoEmpleado.tipo_empleado !== "administrador" &&
              nuevoEmpleado.tipo_turno === "") ||
            deshabilitado
          }
          className="color-navbar border-0"
          style={{
            backgroundColor: "#0F5C4F",
          }}
        >
          {deshabilitado ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroEmpleados;
