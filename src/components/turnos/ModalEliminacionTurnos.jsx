import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionTurnos = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  turno, // Objeto del turno a eliminar
  supabase,
  setToast,
  cargarTurnos,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado || !turno) return;
    setDeshabilitado(true);
    
    try {
      const { error } = await supabase
        .from("turnos")
        .delete()
        .eq("id_turno", turno.id_turno);

      if (error) throw error;

      setMostrarModalEliminacion(false);
      await cargarTurnos();
      
      setToast({
        mostrar: true,
        mensaje: "Turno eliminado exitosamente.",
        tipo: "exito",
      });
    } catch (err) {
      console.error("Error al eliminar turno:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error al eliminar el turno.",
        tipo: "error",
      });
    }
    
    setDeshabilitado(false);
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
        ¿Estás seguro de que deseas eliminar el turno del empleado{" "}
        <strong>{turno?.empleados?.nombre}</strong> del día{" "}
        <strong>{turno?.fecha}</strong>?
        <br />
        <small className="text-danger">
          Esta acción no se puede deshacer. Se eliminará permanentemente del sistema.
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
          {deshabilitado ? "Eliminando..." : "Eliminar Turno"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionTurnos;