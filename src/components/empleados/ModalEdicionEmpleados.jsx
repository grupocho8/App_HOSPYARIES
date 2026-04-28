import React, { useState } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";

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
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
  const nombreValido =
    empleadoAEditar?.nombre === "" ||
    regexNombre.test(empleadoAEditar?.nombre);

  const passwordValido =
    empleadoAEditar?.password?.length >= 4 &&
    empleadoAEditar?.password?.length <= 8;

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

      if (!nombreValido) {
        setToast({
          mostrar: true,
          mensaje: "El nombre no debe contener números.",
          tipo: "advertencia",
        });
        return;
      }

      if (!passwordValido) {
        setToast({
          mostrar: true,
          mensaje: "La contraseña debe tener entre 4 y 8 caracteres.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase
        .from("empleados")
        .update({
          nombre: empleadoAEditar.nombre.trim(),
          rol: empleadoAEditar.rol,
          usuario: empleadoAEditar.usuario.trim(),
          password: empleadoAEditar.password,
        })
        .eq("id_empleado", empleadoAEditar.id_empleado);

      if (error) throw error;

      setMostrarModalEdicion(false);
      await cargarEmpleados();

      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleadoAEditar.nombre} actualizado.`,
        tipo: "exito",
      });

    } catch (err) {
      console.error(err.message);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al actualizar empleado",
        tipo: "error",
      });
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
          {/* NOMBRE */}
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={empleadoAEditar.nombre}
              onChange={manejoCambioInputEdicion}
              isInvalid={!nombreValido}
            />
            <Form.Control.Feedback type="invalid">
              El nombre no debe contener números.
            </Form.Control.Feedback>
          </Form.Group>

          {/* ROL */}
          <Form.Group className="mb-3">
            <Form.Label>Rol</Form.Label>
            <Form.Select
              name="rol"
              value={empleadoAEditar.rol}
              onChange={manejoCambioInputEdicion}
            >
              <option value="administrador">Administrador</option>
              <option value="recepcionista">Recepcionista</option>
            </Form.Select>
          </Form.Group>

          {/* USUARIO */}
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

          {/* PASSWORD CON OJO 👁️ */}
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={empleadoAEditar.password}
                onChange={manejoCambioInputEdicion}
                maxLength={8}
                isInvalid={
                  empleadoAEditar.password !== "" && !passwordValido
                }
              />

              <Button
                variant="outline-secondary"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                <i className={`bi ${mostrarPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
              </Button>

              <Form.Control.Feedback type="invalid">
                Debe tener entre 4 y 8 caracteres.
              </Form.Control.Feedback>
            </InputGroup>
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
            !nombreValido ||
            !passwordValido ||
            empleadoAEditar.nombre.trim() === "" ||
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

export default ModalEdicionEmpleados;