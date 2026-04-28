import React, { useState } from "react";
import { Modal, Form, Button, InputGroup } from "react-bootstrap";

const ModalRegistroEmpleados = ({
    mostrarModal,
    setMostrarModal,
    nuevoEmpleado,
    manejoCambioInput,
    agregarEmpleado,
}) => {
    const [deshabilitado, setDeshabilitado] = useState(false);
    const [mostrarPassword, setMostrarPassword] = useState(false);

    // ❌ No permitir números en nombre
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
    const nombreValido =
        nuevoEmpleado.nombre === "" || regexNombre.test(nuevoEmpleado.nombre);

    // 🔒 Validar password (mínimo 4, máximo 8)
    const passwordValido =
        nuevoEmpleado.password.length >= 4 &&
        nuevoEmpleado.password.length <= 8;

    const handleRegistrar = async () => {
        if (deshabilitado) return;
        setDeshabilitado(true);
        await agregarEmpleado();
        setDeshabilitado(false);
    };

    return (
        <Modal
            show={mostrarModal}
            onHide={() => setMostrarModal(false)}
            backdrop="static"
            keyboard={false}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>Agregar Empleado</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    {/* NOMBRE */}
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={nuevoEmpleado.nombre}
                            onChange={manejoCambioInput}
                            placeholder="Ingresa el nombre"
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
                            value={nuevoEmpleado.rol}
                            onChange={manejoCambioInput}
                        >
                            <option value="">Selecciona un rol</option>
                            <option value="administrador">administrador</option>
                            <option value="recepcionista">recepcionista</option>
                        </Form.Select>
                    </Form.Group>

                    {/* USUARIO */}
                    <Form.Group className="mb-3">
                        <Form.Label>Usuario</Form.Label>
                        <Form.Control
                            type="text"
                            name="usuario"
                            value={nuevoEmpleado.usuario}
                            onChange={manejoCambioInput}
                            placeholder="Ingresa usuario"
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
                                value={nuevoEmpleado.password}
                                onChange={manejoCambioInput}
                                placeholder="4 a 8 caracteres"
                                maxLength={8}
                                isInvalid={
                                    nuevoEmpleado.password !== "" && !passwordValido
                                }
                            />

                            <Button
                                variant="outline-secondary"
                                onClick={() => setMostrarPassword(!mostrarPassword)}
                            >
                                <i className={`bi ${mostrarPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                            </Button>

                            <Form.Control.Feedback type="invalid">
                                La contraseña debe tener entre 4 y 8 caracteres.
                            </Form.Control.Feedback>
                        </InputGroup>
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                </Button>

                <Button
                    variant="primary"
                    onClick={handleRegistrar}
                    disabled={
                        nuevoEmpleado.nombre.trim() === "" ||
                        !nombreValido ||
                        nuevoEmpleado.rol === "" ||
                        !passwordValido ||
                        deshabilitado
                    }
                    className="color-navbar border-0"
                    style={{ backgroundColor: "#0F5C4F" }}
                >
                    Guardar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalRegistroEmpleados;