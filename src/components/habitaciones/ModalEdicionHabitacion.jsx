import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

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
    "individual",
    "doble",
    "matrimonial",
    "suite",
    "familiar",
    "deluxe",
  ];

  const estadosHabitacion = [
    "disponible",
    "ocupada",
    "reservada",
    "mantenimiento",
  ];

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setHabitacionAEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);

    try {
      if (
        !habitacionAEditar.numero?.trim() ||
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
          numero: habitacionAEditar.numero.trim(),
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
      console.error(err.details);

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
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Habitación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>

          <Form.Group className="mb-3">
            <Form.Label>Número</Form.Label>
            <Form.Control
              type="text"
              name="numero"
              value={habitacionAEditar.numero}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              name="tipo"
              value={habitacionAEditar.tipo}
              onChange={manejoCambioInputEdicion}
            >
              {tiposHabitacion.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={habitacionAEditar.precio}
              onChange={manejoCambioInputEdicion}
              min="1"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Estado</Form.Label>
            <Form.Select
              name="estado"
              value={habitacionAEditar.estado}
              onChange={manejoCambioInputEdicion}
            >
              {estadosHabitacion.map((estado) => (
                <option key={estado} value={estado}>
                  {estado}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>

        <Button
          variant="primary"
          onClick={handleActualizar}
          disabled={
            !habitacionAEditar.numero?.trim() ||
            !habitacionAEditar.precio ||
            deshabilitado
          }
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionHabitacion;
