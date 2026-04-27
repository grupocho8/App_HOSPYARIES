import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroHabitacion = ({
  mostrarModal,
  setMostrarModal,
  nuevaHabitacion,
  manejoCambioInput,
  agregarHabitacion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const tiposHabitacion = [
    "individual",
    "doble",
    "matrimonial",
    "suite",
    "familiar",
    "deluxe",
  ];

  useEffect(() => {
    if (!mostrarModal) {
      setDeshabilitado(false);
    }
  }, [mostrarModal]);

  const handleRegistrar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);

    // 👇 SOLO enviar lo que existe en la BD
    const habitacionLimpia = {
      numero: nuevaHabitacion.numero,
      tipo: nuevaHabitacion.tipo,
      precio: Number(nuevaHabitacion.precio),
      estado: "disponible", // opcional (ya tiene default en BD)
    };

    await agregarHabitacion(habitacionLimpia);

    setDeshabilitado(false);
  };

  // ✅ Validación corregida
  const esFormularioValido =
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
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Número de Habitación *</Form.Label>
            <Form.Control
              type="text"
              name="numero"
              value={nuevaHabitacion.numero || ""}
              onChange={manejoCambioInput}
              placeholder="101, 202, 305"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Habitación *</Form.Label>
            <Form.Select
              name="tipo"
              value={nuevaHabitacion.tipo || "individual"}
              onChange={manejoCambioInput}
            >
              {tiposHabitacion.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
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
        >
          {deshabilitado ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroHabitacion;
