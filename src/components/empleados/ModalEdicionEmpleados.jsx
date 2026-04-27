import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionEmpleados = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  empleadoAEditar,
  setEmpleadoAEditar,
  supabase,
  cargarEmpleados,
  setToast,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setEmpleadoAEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await actualizarEmpleadoLocal();
    setDeshabilitado(false);
  };

  const actualizarEmpleadoLocal = async () => {
    try {
      if (
        !empleadoAEditar.nombre.trim() ||
        !empleadoAEditar.rol.trim() ||
        !empleadoAEditar.usuario.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase
        .from("empleados")
        .update({
          nombre: empleadoAEditar.nombre,
          rol: empleadoAEditar.rol,
          usuario: empleadoAEditar.usuario,
          password: empleadoAEditar.password,
        })
        .eq("id_empleado", empleadoAEditar.id_empleado);

      if (error) {
        console.error("Error al actualizar empleado:", error.message);
        setToast({
          mostrar: true,
          mensaje: `Error al actualizar el empleado ${empleadoAEditar.nombre}.`,
          tipo: "error",
        });
        return;
      }

      setMostrarModalEdicion(false);
      await cargarEmpleados();
      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleadoAEditar.nombre} actualizado exitosamente.`,
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al actualizar empleado.",
        tipo: "error",
      });
      console.error("Excepción al actualizar empleado:", err.message);
    }
  };

  if (!empleadoAEditar) return null;

  return (
    <Modal
      show={mostrarModalEdicion}
      onHide={() => setMostrarModalEdicion(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Editar Empleado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={empleadoAEditar.nombre}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              name="rol"
              value={empleadoAEditar.rol}
              onChange={manejoCambioInputEdicion}
            >
              <option value="Administrador">Administrador</option>
              <option value="Recepcionista">Recepcionista</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Usuario</Form.Label>
            <Form.Control
              type="text"
              name="usuario"
              value={empleadoAEditar.usuario}
              onChange={manejoCambioInputEdicion}
              maxLength={10}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={empleadoAEditar.password}
              onChange={manejoCambioInputEdicion}
              maxLength={8}
            />
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
          disabled={empleadoAEditar.nombre.trim() === "" || deshabilitado}
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          Actualizar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionEmpleados;