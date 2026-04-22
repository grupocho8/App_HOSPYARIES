import React, { useState } from "react";
import { Modal, Button } from "react-bootstrap";

const ModalEliminacionCliente = ({
  mostrarModalEliminacion,
  setMostrarModalEliminacion,
  cliente, // Recibe clienteAEliminar desde la vista
  supabase,
  setToast,
  cargarClientes,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const handleEliminar = async () => {
    if (deshabilitado || !cliente) return;
    setDeshabilitado(true);
    await ejecutarEliminacion();
    setDeshabilitado(false);
  };

  const ejecutarEliminacion = async () => {
    try {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id_cliente", cliente.id_cliente);

      if (error) {
        console.error("Error al eliminar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al eliminar el cliente ${cliente.nombre}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEliminacion(false);
      await cargarClientes();
      setToast({
        mostrar: true,
        mensaje: `Cliente ${cliente.nombre} ${cliente.apellido} eliminado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al eliminar cliente.",
        tipo: "error",
      });
      console.error("Excepción al eliminar cliente:", err.message);
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
        ¿Estás seguro de que deseas eliminar al cliente "
        <strong>{cliente?.nombre} {cliente?.apellido}</strong>"?
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
          {deshabilitado ? "Eliminando..." : "Eliminar Cliente"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEliminacionCliente;