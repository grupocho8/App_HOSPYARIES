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

  // Expresión regular para cédula nicaragüense
  const regexCedula = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
  const esCedulaValida = clienteAEditar ? regexCedula.test(clienteAEditar.cedula) : false;

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
    await actualizarClienteLocal();
    setDeshabilitado(false);
  };

  const actualizarClienteLocal = async () => {
    try {
      if (
        !clienteAEditar.nombre.trim() ||
        !clienteAEditar.apellido.trim() ||
        !clienteAEditar.cedula.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      if (!esCedulaValida) {
        setToast({
          mostrar: true,
          mensaje: "El formato de la cédula no es válido.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase
        .from("clientes")
        .update({
          nombre: clienteAEditar.nombre,
          apellido: clienteAEditar.apellido,
          cedula: clienteAEditar.cedula,
        })
        .eq("id_cliente", clienteAEditar.id_cliente);

      if (error) {
        console.error("Error al actualizar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al actualizar el cliente ${clienteAEditar.nombre}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEdicion(false);
      await cargarClientes();
      setToast({
        mostrar: true,
        mensaje: `Cliente ${clienteAEditar.nombre} actualizado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar cliente.",
        tipo: "error",
      });
      console.error("Excepción al actualizar cliente:", err.message);
    }
  };

  if (!clienteAEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
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
              placeholder="Ingresa el nombre"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Apellido</Form.Label>
            <Form.Control
              type="text"
              name="apellido"
              value={clienteAEditar.apellido}
              onChange={manejoCambioInputEdicion}
              placeholder="Ingresa el apellido"
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
              isInvalid={clienteAEditar.cedula !== "" && !esCedulaValida}
            />
            <Form.Control.Feedback type="invalid">
              Formato de cédula incorrecto (000-000000-0000A).
            </Form.Control.Feedback>
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
            clienteAEditar.nombre.trim() === "" || 
            !esCedulaValida || 
            deshabilitado
          }
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionCliente;