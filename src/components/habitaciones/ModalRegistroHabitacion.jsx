import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const ModalRegistroHabitacion = ({
  mostrarModal,
  setMostrarModal,
  nuevaHabitacion,
  manejoCambioInput,
  agregarHabitacion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const tiposHabitacion = [
    { label: "Unipersonal", value: "unipersonal" },
    { label: "Matrimonial", value: "matrimonial" },
    { label: "Doble", value: "doble" },
    { label: "Triple", value: "triple" },
  ];

  useEffect(() => {
    if (!mostrarModal) {
      setDeshabilitado(false);
    }
  }, [mostrarModal]);

  const handleRegistrar = async () => {
    // Validación extra de seguridad antes de enviar
    const num = parseInt(nuevaHabitacion.numero);
    if (isNaN(num) || num < 1 || num > 25) return;

    if (deshabilitado) return;
    setDeshabilitado(true);

    const habitacionLimpia = {
      numero: nuevaHabitacion.numero,
      tipo: nuevaHabitacion.tipo,
      precio: Number(nuevaHabitacion.precio),
      estado: "disponible",
    };

    await agregarHabitacion(habitacionLimpia);
    setDeshabilitado(false);
  };

  // Validamos que el número esté entre 1 y 25
  const numeroValido =
    nuevaHabitacion.numero !== "" &&
    parseInt(nuevaHabitacion.numero) >= 1 &&
    parseInt(nuevaHabitacion.numero) <= 25;

  const esFormularioValido =
    numeroValido &&
    nuevaHabitacion.numero?.trim() !== "" &&
    nuevaHabitacion.precio !== "" &&
    Number(nuevaHabitacion.precio) > 0;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Nueva Habitación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Alerta visual para que el usuario sepa el límite */}
        <Alert variant="info" className="py-2 small">
          <i className="bi bi-info-circle me-2"></i>
          El hotel solo cuenta con <strong>25 habitaciones</strong> (1 - 25).
        </Alert>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Número de Habitación *</Form.Label>
            <Form.Control
              type="number" 
              name="numero"
              value={nuevaHabitacion.numero || ""}
              onChange={manejoCambioInput}
              placeholder="Ej: 15"
              min="1"
              max="25"
              isInvalid={nuevaHabitacion.numero !== "" && !numeroValido}
              required
            />
            <Form.Control.Feedback type="invalid">
              El número debe estar entre 1 y 25.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Habitación *</Form.Label>
            <Form.Select
              name="tipo"
              value={nuevaHabitacion.tipo || "unipersonal"}
              onChange={manejoCambioInput}
            >
              {tiposHabitacion.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio (C$) *</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={nuevaHabitacion.precio || ""}
              onChange={manejoCambioInput}
              placeholder="1500"
              min="1"
              required
            />
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

export default ModalRegistroHabitacion;
