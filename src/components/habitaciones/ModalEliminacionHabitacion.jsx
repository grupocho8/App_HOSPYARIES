import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionHabitacion = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  habitacion, // Recibe habitacionAEliminar desde la vista
  supabase,
  setToast,
  cargarHabitaciones,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado || !habitacion) return;
    setDeshabilitado(true);
    await ejecutarEliminacion();
    setDeshabilitado(false);
  };

  const ejecutarEliminacion = async () => {
    try {
      const { error } = await supabase
        .from("habitaciones")
        .delete()
        .eq("id_habitacion", habitacion.id_habitacion);

      if (error) {
        console.error("Error al eliminar habitación:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar la habitación ${habitacion.numero}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEliminacion(false);
      await cargarHabitaciones();
      setToast({
        mostrar: true,
        mensaje: `Habitación ${habitacion.numero} eliminada exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar la habitación.",
        tipo: "error",
      });
      console.error("Excepción al eliminar habitación:", err.message);
    }
  };

  return (
    <Modal
      show={mostrarModalEliminacion}
      onHide={() => setMostrarModalEliminacion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Eliminación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        ¿Estás seguro de que deseas eliminar la habitación{" "}
        <strong>#{habitacion?.numero}</strong>?
        <br />
        <small className="text-danger">
          Esta acción no se puede deshacer. 
          Se eliminará permanentemente del sistema.
        </small>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEliminacion(false)}
        >
          Cancelar
        </Button>
        <Button
          variant="danger"
          onClick={handleEliminar}
          disabled={deshabilitado}
        >
          {deshabilitado ? "Eliminando..." : "Eliminar Habitación"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionHabitacion;