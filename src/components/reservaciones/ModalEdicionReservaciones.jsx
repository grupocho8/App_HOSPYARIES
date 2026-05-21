import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionReservaciones = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  reservacionEditar,
  setReservacionEditar,
  actualizarReservacion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setReservacionEditar((prev) => ({ ...prev, [name]: value }));
  };

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarReservacion();
    setDeshabilitado(false);
  };

  if (!reservacionEditar) return null;

  // Validación rápida para el botón (deshabilitar si las fechas están vacías)
  const camposCompletos =
    reservacionEditar.fecha_inicio !== "" && reservacionEditar.fecha_fin !== "";

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Modificar Reservación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* Información superior */}
          <div className="mb-4 text-center">
            <h6 className="fw-bold text-muted">
              Habitación {reservacionEditar.habitaciones?.numero} —{" "}
              {reservacionEditar.clientes?.nombre}
            </h6>
          </div>

          {/* Fecha Inicio */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control
              type="date"
              name="fecha_inicio"
              value={reservacionEditar.fecha_inicio}
              onChange={manejoCambioInput}
            />
          </Form.Group>

          {/* Fecha Fin */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control
              type="date"
              name="fecha_fin"
              value={reservacionEditar.fecha_fin}
              onChange={manejoCambioInput}
            />
          </Form.Group>

          {/* Estado de la Reserva */}
          <Form.Group className="mb-3">
            <Form.Label>Estado de la Reserva</Form.Label>
            <Form.Select
              name="estado"
              value={reservacionEditar.estado}
              onChange={manejoCambioInput}
            >
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEdicion(false)}
        >
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={!camposCompletos || deshabilitado}
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionReservaciones;
