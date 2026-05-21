import React, { useState } from "react";
import { Modal, Form, Button, InputGroup, Row, Col } from "react-bootstrap";

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

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const regexCelular = /^[0-9]{8}$/;

  const nombreValido =
    empleadoAEditar?.nombre_empleado === "" ||
    regexNombre.test(empleadoAEditar?.nombre_empleado);

  const apellidoValido =
    empleadoAEditar?.apellido_empleado === "" ||
    regexNombre.test(empleadoAEditar?.apellido_empleado);

  const emailValido =
    empleadoAEditar?.email === "" || regexEmail.test(empleadoAEditar?.email);

  const celularValido =
    empleadoAEditar?.celular === "" ||
    regexCelular.test(empleadoAEditar?.celular);

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
        !empleadoAEditar.nombre_empleado.trim() ||
        !empleadoAEditar.apellido_empleado.trim() ||
        !empleadoAEditar.email.trim() ||
        !empleadoAEditar.tipo_empleado ||
        (empleadoAEditar.tipo_empleado !== "administrador" &&
          !empleadoAEditar.tipo_turno)
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos obligatorios.",
          tipo: "advertencia",
        });

        return;
      }

      if (!nombreValido || !apellidoValido) {
        setToast({
          mostrar: true,
          mensaje: "Nombre y apellido no deben contener números.",
          tipo: "advertencia",
        });

        return;
      }

      if (!emailValido) {
        setToast({
          mostrar: true,
          mensaje: "Ingresa un correo válido.",
          tipo: "advertencia",
        });

        return;
      }

      if (empleadoAEditar.celular && !celularValido) {
        setToast({
          mostrar: true,
          mensaje: "El celular debe tener 8 números.",
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
          nombre_empleado: empleadoAEditar.nombre_empleado.trim(),

          apellido_empleado: empleadoAEditar.apellido_empleado.trim(),

          email: empleadoAEditar.email.trim(),

          celular: empleadoAEditar.celular,

          password: empleadoAEditar.password,

          tipo_empleado: empleadoAEditar.tipo_empleado,

          tipo_turno:
            empleadoAEditar.tipo_empleado === "administrador"
              ? null
              : empleadoAEditar.tipo_turno,
        })
        .eq("id_empleado", empleadoAEditar.id_empleado);

      if (error) throw error;

      setMostrarModalEdicion(false);

      await cargarEmpleados();

      setToast({
        mostrar: true,
        mensaje: `Empleado ${empleadoAEditar.nombre_empleado} actualizado.`,
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
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>

                <Form.Control
                  type="text"
                  name="nombre_empleado"
                  value={empleadoAEditar.nombre_empleado}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={
                    empleadoAEditar.nombre_empleado !== "" && !nombreValido
                  }
                />

                <Form.Control.Feedback type="invalid">
                  El nombre no debe contener números.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Apellido</Form.Label>

                <Form.Control
                  type="text"
                  name="apellido_empleado"
                  value={empleadoAEditar.apellido_empleado}
                  onChange={manejoCambioInputEdicion}
                  isInvalid={
                    empleadoAEditar.apellido_empleado !== "" && !apellidoValido
                  }
                />

                <Form.Control.Feedback type="invalid">
                  El apellido no debe contener números.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>

            <Form.Control
              type="email"
              name="email"
              value={empleadoAEditar.email}
              onChange={manejoCambioInputEdicion}
              isInvalid={empleadoAEditar.email !== "" && !emailValido}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Celular</Form.Label>

            <Form.Control
              type="text"
              name="celular"
              value={empleadoAEditar.celular}
              onChange={(e) => {
                const valor = e.target.value.replace(/\D/g, "");

                manejoCambioInputEdicion({
                  target: {
                    name: "celular",
                    value: valor,
                  },
                });
              }}
              maxLength={8}
              isInvalid={empleadoAEditar.celular !== "" && !celularValido}
            />

            <Form.Control.Feedback type="invalid">
              El celular debe tener 8 números.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo de Empleado</Form.Label>

            <Form.Select
              name="tipo_empleado"
              value={empleadoAEditar.tipo_empleado}
              onChange={(e) => {
                manejoCambioInputEdicion(e);

                if (e.target.value === "administrador") {
                  setEmpleadoAEditar((prev) => ({
                    ...prev,
                    tipo_turno: "",
                  }));
                }
              }}
            >
              <option value="administrador">Administrador</option>

              <option value="recepcionista">Recepcionista</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Turno</Form.Label>

            <Form.Select
              name="tipo_turno"
              value={empleadoAEditar.tipo_turno || ""}
              onChange={manejoCambioInputEdicion}
              disabled={empleadoAEditar.tipo_empleado === "administrador"}
            >
              <option value="">
                {empleadoAEditar.tipo_empleado === "administrador"
                  ? "No aplica para administrador"
                  : "Seleccione turno"}
              </option>

              <option value="dia">Día</option>

              <option value="noche">Noche</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>

            <InputGroup>
              <Form.Control
                type={mostrarPassword ? "text" : "password"}
                name="password"
                value={empleadoAEditar.password}
                onChange={manejoCambioInputEdicion}
                maxLength={8}
                isInvalid={empleadoAEditar.password !== "" && !passwordValido}
              />

              <Button
                variant="outline-secondary"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                <i
                  className={`bi ${
                    mostrarPassword ? "bi-eye-slash" : "bi-eye"
                  }`}
                ></i>
              </Button>
            </InputGroup>

            <Form.Control.Feedback type="invalid">
              Debe tener entre 4 y 8 caracteres.
            </Form.Control.Feedback>
          </Form.Group>
        </Form>
      </Modal.Body>

      {/* AQUÍ ESTABAN FALTANDO LOS BOTONES */}
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => setMostrarModalEdicion(false)}
        >
          Cancelar
        </Button>

        <Button
          onClick={handleActualizar}
          disabled={
            !nombreValido ||
            !apellidoValido ||
            !emailValido ||
            !celularValido ||
            !passwordValido ||
            empleadoAEditar.nombre_empleado.trim() === "" ||
            empleadoAEditar.apellido_empleado.trim() === "" ||
            empleadoAEditar.email.trim() === "" ||
            !empleadoAEditar.tipo_empleado ||
            (empleadoAEditar.tipo_empleado !== "administrador" &&
              !empleadoAEditar.tipo_turno) ||
            deshabilitado
          }
          className="border-0"
          style={{
            backgroundColor: "#0F5C4F",
          }}
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionEmpleados;
