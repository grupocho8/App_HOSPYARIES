import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TablaClientes from "../components/clientes/TablaClientes";
import TarjetaCliente from "../components/clientes/TarjetaCliente";

import ModalRegistroCliente from "../components/clientes/ModalRegistroCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";
import ModalEdicionCliente from "../components/clientes/ModalEdicionCliente";
import ModalEliminacionCliente from "../components/clientes/ModalEliminarCliente";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import Paginacion from "../components/ordenamiento/Paginacion"; // ✅ IMPORTADO

const Clientes = () => {
  // ==================== ESTADOS ====================
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [clienteAEditar, setClienteAEditar] = useState(null);
  const [clienteAEliminar, setClienteAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // ✅ PAGINACIÓN
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const clientesPaginados = clientesFiltrados.slice(
    (paginaActual - 1) * registrosPorPagina,
    paginaActual * registrosPorPagina
  );

  const establecerPaginaActual = (pagina) => {
    setPaginaActual(pagina);
  };

  const establecerRegistrosPorPagina = (cantidad) => {
    setRegistrosPorPagina(cantidad);
    setPaginaActual(1);
  };

  // ==================== BÚSQUEDA ====================
  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setClientesFiltrados(clientes);
    } else {
      const texto = textoBusqueda.toLowerCase();

      const filtrados = clientes.filter((c) =>
        c.nombre?.toLowerCase().includes(texto) ||
        c.apellido?.toLowerCase().includes(texto) ||
        c.cedula?.toLowerCase().includes(texto)
      );

      setClientesFiltrados(filtrados);
    }

    setPaginaActual(1); // 🔥 IMPORTANTE
  }, [textoBusqueda, clientes]);

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
      setClientesFiltrados(data || []);
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
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7}>
          <h3><i className="bi-people-fill me-2"></i> Clientes</h3>
        </Col>

        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button onClick={() => setMostrarModal(true)} className="color-navbar border-0">
            Nuevo Cliente
          </Button>
        </Col>
      </Row>

      <hr />

      {/* BUSCADOR */}
      <Row className="mb-3">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={manejarBusqueda}
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row className="d-lg-none">
            <TarjetaCliente
              clientes={clientesPaginados} // ✅ AQUÍ
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>

          <Row className="d-none d-lg-block">
            <TablaClientes
              clientes={clientesPaginados} // ✅ AQUÍ
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
               paginaActual={paginaActual}              // ✅
              registrosPorPagina={registrosPorPagina}  // ✅
            />
          </Row>
        </>
      )}

      {/* ✅ PAGINACIÓN */}
      <Paginacion
        registrosPorPagina={registrosPorPagina}
        totalRegistros={clientesFiltrados.length}
        paginaActual={paginaActual}
        establecerPaginaActual={establecerPaginaActual}
        establecerRegistrosPorPagina={establecerRegistrosPorPagina}
      />

      <ModalRegistroCliente
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoCliente={nuevoCliente}
        manejoCambioInput={manejoCambioInput}
        agregarCliente={agregarCliente}
      />

      <ModalEdicionCliente {...{
        mostrarModalEdicion,
        setMostrarModalEdicion,
        clienteAEditar,
        setClienteAEditar,
        supabase,
        cargarClientes,
        setToast
      }} />

      <ModalEliminacionCliente {...{
        mostrarModalEliminacion,
        setMostrarModalEliminacion,
        cliente: clienteAEliminar,
        supabase,
        setToast,
        cargarClientes
      }} />

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
