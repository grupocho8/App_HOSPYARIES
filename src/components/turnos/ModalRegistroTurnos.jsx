import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const ModalRegistroTurnos = ({
  mostrarModal,
  setMostrarModal,
  nuevoTurno = {},
  manejoCambioInput,
  agregarTurno,
  empleados = []
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const tiposTurno = [
    { label: "Día", value: "dia" },
    { label: "Noche", value: "noche" },
  ];

  useEffect(() => {
    if (!mostrarModal) setDeshabilitado(false);
  }, [mostrarModal]);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);
    await agregarTurno();
    setDeshabilitado(false);
  };

  const esFormularioValido =
    nuevoTurno?.id_empleado &&
    nuevoTurno?.id_empleado !== "" &&
    nuevoTurno?.fecha;

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Nuevo Turno</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="info" className="py-2 small">
          Solo existen turnos: <strong>Día</strong> y <strong>Noche</strong>.
        </Alert>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Empleado *</Form.Label>
            <Form.Select
              name="id_empleado"
              value={nuevoTurno?.id_empleado || ""}
              onChange={manejoCambioInput}
            >
              <option value="">Seleccione un empleado</option>

              {Array.isArray(empleados) &&
                empleados.map((emp) => (
                  <option key={emp.id_empleado} value={emp.id_empleado}>
                    {emp.nombre}
                  </option>
                ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha *</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={nuevoTurno?.fecha || ""}
              onChange={manejoCambioInput}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Turno</Form.Label>
            <Form.Select
              name="tipo_turno"
              value={nuevoTurno?.tipo_turno || "dia"}
              onChange={manejoCambioInput}
            >
              {tiposTurno.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
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
          disabled={!esFormularioValido || deshabilitado}
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          {deshabilitado ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroTurnos;