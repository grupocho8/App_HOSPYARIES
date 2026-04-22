import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TablaClientes from "../components/clientes/TablaClientes";
import TarjetaCliente from "../components/clientes/TarjetaCliente";

import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";
import ModalEdicionCliente from "../components/clientes/ModalEdicionCliente";
import ModalEliminacionCliente from "../components/clientes/ModalEliminarCliente";

const Clientes = () => {
  // ==================== ESTADOS ====================
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Estado del modal de registro (¡este era el que faltaba!)
  const [mostrarModal, setMostrarModal] = useState(false);

  // Estados para modales de edición y eliminación
  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  // Estado del formulario de nuevo cliente
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // ==================== MÉTODOS DE MODALES ====================
  const abrirModalEdicion = (cliente) => {
    setClienteAEditar(cliente);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (cliente) => {
    setClienteAEliminar(cliente);
    setMostrarModalEliminacion(true);
  };

  // ==================== CARGA DE CLIENTES ====================
  const cargarClientes = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("fecha_registro", { ascending: false });

      if (error) throw error;

      setClientes(data || []);
    } catch (error) {
      console.error("Error al cargar clientes:", error.message);
      setToast({
        mostrar: true,
        mensaje: "Error al cargar la lista de clientes.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarClientes();
  }, []);

  // ==================== FORMULARIO ====================
  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  const agregarCliente = async () => {
    try {
      if (!nuevoCliente.nombre.trim() || !nuevoCliente.apellido.trim() || !nuevoCliente.cedula.trim()) {
        setToast({ mostrar: true, mensaje: "Debe llenar todos los campos.", tipo: "advertencia" });
        return;
      }

      const { error } = await supabase.from("clientes").insert([
        {
          id_cliente: crypto.randomUUID(),
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          cedula: nuevoCliente.cedula,
          fecha_registro: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: `Cliente "${nuevoCliente.nombre} ${nuevoCliente.apellido}" registrado exitosamente.`,
        tipo: "exito",
      });

      // Limpiar y recargar (exactamente como pide la guía)
      setNuevoCliente({ nombre: "", apellido: "", cedula: "" });
      setMostrarModal(false);
      await cargarClientes();
    } catch (err) {
      console.error(err);
      setToast({ mostrar: true, mensaje: "Error al registrar cliente.", tipo: "error" });
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

      {/* Spinner o contenido (tarjetas + tabla) */}
      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" size="lg" />
          <p className="mt-3">Cargando clientes...</p>
        </div>
      ) : (
        <>
          {/* Tarjetas - Solo en móviles (guía E10) */}
          <Row className="d-lg-none">
            <TarjetaCliente
              clientes={clientes}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>

          {/* Tabla - Solo en pantallas grandes (guía E9) */}
          <Row className="d-none d-lg-block">
            <TablaClientes
              clientes={clientes}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>
        </>
      )}

      {/* Modal de Registro */}
      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />
      {/* Modal de Edición (Agregado) */}
      <ModalEdicionCliente
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        clienteAEditar={clienteAEditar}
        setClienteAEditar={setClienteAEditar}
        supabase={supabase}
        cargarClientes={cargarClientes}
        setToast={setToast}
      />
      <ModalEliminacionCliente
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        cliente={clienteAEliminar}
        supabase={supabase}
        setToast={setToast}
        cargarClientes={cargarClientes}
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