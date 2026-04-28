import React, { useState } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";

const ModalEdicionHabitacion = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  habitacionAEditar,
  setHabitacionAEditar,
  supabase,
  cargarHabitaciones,
  setToast,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const tiposHabitacion = [
    { label: "Unipersonal", value: "unipersonal" },
    { label: "Matrimonial", value: "matrimonial" },
    { label: "Doble", value: "doble" },
    { label: "Triple", value: "triple" },
  ];

  const estadosHabitacion = [
    { label: "Disponible", value: "disponible" },
    { label: "Ocupada", value: "ocupada" },
    { label: "Reservada", value: "reservada" },
  ];

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setHabitacionAEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validamos el rango permitido (1-25)
  const numeroEsValido =
    habitacionAEditar?.numero !== "" &&
    parseInt(habitacionAEditar?.numero) >= 1 &&
    parseInt(habitacionAEditar?.numero) <= 25;

  const handleActualizar = async () => {
    if (!numeroEsValido || deshabilitado) return;

    setDeshabilitado(true);

    try {
      if (
        !habitacionAEditar.numero?.toString().trim() ||
        !habitacionAEditar.precio
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar Número y Precio.",
          tipo: "advertencia",
        });
        setDeshabilitado(false);
        return;
      }

      const { error } = await supabase
        .from("habitaciones")
        .update({
          numero: habitacionAEditar.numero.toString().trim(),
          tipo: habitacionAEditar.tipo,
          precio: parseFloat(habitacionAEditar.precio),
          estado: habitacionAEditar.estado,
        })
        .eq("id_habitacion", habitacionAEditar.id_habitacion);

      if (error) throw error;

      setMostrarModalEdicion(false);
      await cargarHabitaciones();

      setToast({
        mostrar: true,
        mensaje: `Habitación ${habitacionAEditar.numero} actualizada.`,
        tipo: "exito",
      });
    } catch (err) {
      console.error(err.message);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al actualizar",
        tipo: "error",
      });
    }

    setDeshabilitado(false);
  };

  if (!habitacionAEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Habitación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Alerta de límite igual que en el registro */}
        <Alert variant="info" className="py-2 small">
          <i className="bi bi-info-circle me-2"></i>
          Rango de habitaciones permitido: <strong>1 a 25</strong>.
        </Alert>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Número de Habitación</Form.Label>
            <Form.Control
              type="number"
              name="numero"
              value={habitacionAEditar.numero}
              onChange={manejoCambioInputEdicion}
              min="1"
              max="25"
              isInvalid={!numeroEsValido}
              required
            />
            <Form.Control.Feedback type="invalid">
              El número debe estar entre 1 y 25.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Habitación</Form.Label>
            <Form.Select
              name="tipo"
              value={habitacionAEditar.tipo}
              onChange={manejoCambioInputEdicion}
            >
              {tiposHabitacion.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio (C$)</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={habitacionAEditar.precio}
              onChange={manejoCambioInputEdicion}
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado Actual</Form.Label>
            <Form.Select
              name="estado"
              value={habitacionAEditar.estado}
              onChange={manejoCambioInputEdicion}
            >
              {estadosHabitacion.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
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
          disabled={
            !numeroEsValido || !habitacionAEditar.precio || deshabilitado
          }
          className="color-navbar border-0" 
          style={{ backgroundColor: "#0F5C4F" }} 
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionHabitacion;
