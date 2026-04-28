import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionCliente = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  clienteAEditar,
  setClienteAEditar,
  supabase,
  cargarClientes,
  setToast,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  // ✅ MISMA VALIDACIÓN DE CÉDULA
  const regexCedula = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
  const esCedulaValida = regexCedula.test(clienteAEditar?.cedula || "");

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setClienteAEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizar = async () => {
    if (deshabilitado) return;

    setDeshabilitado(true);

    try {
      // ✅ VALIDACIÓN COMPLETA (igual que registro)
      if (
        !clienteAEditar.nombre.trim() ||
        !clienteAEditar.apellido.trim() ||
        !esCedulaValida
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe completar todos los campos correctamente.",
          tipo: "advertencia",
        });
        setDeshabilitado(false);
        return;
      }

      const { error } = await supabase
        .from("clientes")
        .update({
          nombre: clienteAEditar.nombre.trim(),
          apellido: clienteAEditar.apellido.trim(),
          cedula: clienteAEditar.cedula.trim(),
        })
        .eq("id_cliente", clienteAEditar.id_cliente);

      if (error) throw error;

      setMostrarModalEdicion(false);
      await cargarClientes();

      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteAEditar.nombre} actualizado.`,
        tipo: "exito",
      });

    } catch (err) {
      console.error(err.message);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al actualizar cliente",
        tipo: "error",
      });
    }

    setDeshabilitado(false);
  };

  if (!clienteAEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      centered
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Cliente</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={clienteAEditar.nombre}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={clienteAEditar.apellido}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Cédula</Form.Label>
            <Form.Control
              type="text"
              name="cedula"
              value={clienteAEditar.cedula}
              onChange={manejoCambioInputEdicion}
              placeholder="001-000000-0000A"
              isInvalid={
                clienteAEditar.cedula !== "" && !esCedulaValida
              }
            />
            <Form.Control.Feedback type="invalid">
              Formato de cédula incorrecto (000-000000-0000A).
            </Form.Control.Feedback>
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
            clienteAEditar.nombre.trim() === "" ||
            clienteAEditar.apellido.trim() === "" ||
            !esCedulaValida ||
            deshabilitado
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

export default ModalEdicionCliente;