import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";

const Clientes = () => {
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [mostrarModal, setMostrarModal] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
  });

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarCliente = async () => {
    try {
      if (
        !nuevoCliente.nombre.trim() ||
        !nuevoCliente.apellido.trim() ||
        !nuevoCliente.cedula.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("clientes").insert([
        {
          id_cliente: crypto.randomUUID(), // Para cumplir con el CHAR(36) de tu tabla
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          cedula: nuevoCliente.cedula,
          fecha_registro: new Date(),
        },
      ]);

      if (error) {
        console.error("Error al agregar cliente:", error.message);
        setToast({
          mostrar: true,
          mensaje: "Error al registrar cliente.",
          tipo: "error",
        });
        return;
      }

      setToast({
        mostrar: true,
        mensaje: `Cliente "${nuevoCliente.nombre}" registrado exitosamente.`,
        tipo: "exito",
      });

      setNuevoCliente({ nombre: "", apellido: "", cedula: "" });
      setMostrarModal(false);
    } catch (err) {
      console.error("Excepción al agregar cliente:", err.message);
      setToast({
        mostrar: true,
        mensaje: "Error inesperado al registrar cliente.",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      {/* Título y botón Nuevo Cliente */}
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-people-fill me-2"></i> Clientes
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
            className="color-navbar border-0" 
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Cliente</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {/* Modal de Registro */}
      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />

      {/* Notificación */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Clientes;