import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminarEmpleado = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  empleado,
  supabase,
  setToast,
  cargarEmpleados,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado || !empleado) return;
    setDeshabilitado(true);
    await ejecutarEliminacion();
    setDeshabilitado(false);
  };

  const ejecutarEliminacion = async () => {
    try {
      const { error } = await supabase
        .from("empleados")
        .delete()
        .eq("id_empleado", empleado.id_empleado);

      if (error) {
        console.error("Error al eliminar empleado:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar el empleado ${empleado.nombre}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEliminacion(false);
      await cargarEmpleados();
      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleado.nombre} eliminado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar empleado.",
        tipo: "error",
      });
      console.error("Excepción al eliminar empleado:", err.message);
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
        ¿Estás seguro de que deseas eliminar al empleado "
        <strong>{empleado?.nombre}</strong>"?
        <br />
        <small className="text-danger">Esta acción no se puede deshacer.</small>
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
          {deshabilitado ? "Eliminando..." : "Eliminar Empleado"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminarEmpleado;