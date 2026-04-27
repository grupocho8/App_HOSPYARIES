import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalRegistroEmpleados = ({
    mostrarModal,
    setMostrarModal,
    nuevoEmpleado,
    manejoCambioInput,
    agregarEmpleado,
}) => {
    const [deshabilitado, setDeshabilitado] = useState(false);

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
                    <Form.Group className="mb-3">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            name="nombre"
                            value={nuevoEmpleado.nombre}
                            onChange={manejoCambioInput}
                            placeholder="Ingresa el nombre"
                        />
                    </Form.Group>

                    {/* Dentro de ModalRegistroEmpleados.jsx */}
                    <Form.Group className="mb-3">
                        <Form.Label>Rol</Form.Label>
                        <Form.Select
                            name="rol"
                            value={nuevoEmpleado.rol}
                            onChange={manejoCambioInput}
                        >
                            <option value="">Selecciona un rol</option>
                            {/* Asegúrate de que estas strings sean EXACTAMENTE igual a tu ENUM de SQL */}
                            <option value="administrador">administrador</option>
                            <option value="recepcionista">recepcionista</option>
                        </Form.Select>
                    </Form.Group>

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

                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={nuevoEmpleado.password}
                            onChange={manejoCambioInput}
                            placeholder="Máximo 8 caracteres"
                            maxLength={8}
                        />
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
                        nuevoEmpleado.rol === "" ||
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