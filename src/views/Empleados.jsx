import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TablaEmpleados from "../components/empleados/TablaEmpleados";
import TarjetaEmpleados from "../components/empleados/TarjetaEmpleados";

import ModalRegistroEmpleados from "../components/empleados/ModalRegistroEmpleados";
import NotificacionOperacion from "../components/NotificacionOperacion";
import ModalEdicionEmpleados from "../components/empleados/ModalEdicionEmpleados";
import ModalEliminarEmpleados from "../components/empleados/ModalEliminarEmpleados";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [empleadosFiltrados, setEmpleadosFiltrados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [empleadoAEditar, setEmpleadoAEditar] = useState(null);
  const [empleadoAEliminar, setEmpleadoAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: "",
    rol: "",
    usuario: "",
    password: "",
    tipo_turno: "",
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // ==================== BÚSQUEDA ====================
  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setEmpleadosFiltrados(empleados);
    } else {
      const texto = textoBusqueda.toLowerCase();

      const filtrados = empleados.filter((e) =>
        e.nombre?.toLowerCase().includes(texto) ||
        e.rol?.toLowerCase().includes(texto) ||
        e.usuario?.toLowerCase().includes(texto) ||
        e.tipo_turno?.toLowerCase().includes(texto)
      );

      setEmpleadosFiltrados(filtrados);
    }
  }, [textoBusqueda, empleados]);

  const abrirModalEdicion = (empleado) => {
    setEmpleadoAEditar(empleado);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (empleado) => {
    setEmpleadoAEliminar(empleado);
    setMostrarModalEliminacion(true);
  };

  const cargarEmpleados = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("empleados")
        .select("*");

      if (error) throw error;

      setEmpleados(data || []);
      setEmpleadosFiltrados(data || []);
    } catch (error) {
      console.error("Error al cargar empleados:", error.message);
      setToast({
        mostrar: true,
        mensaje: "Error al cargar la lista de empleados.",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoEmpleado((prev) => ({ ...prev, [name]: value }));
  };

  const agregarEmpleado = async () => {
    try {
      if (
        !nuevoEmpleado.nombre.trim() ||
        !nuevoEmpleado.rol.trim() ||
        !nuevoEmpleado.usuario.trim() ||
        !nuevoEmpleado.password.trim() ||
        !nuevoEmpleado.tipo_turno.trim()
      ) {
        setToast({
          mostrar: true,
          mensaje: "Todos los campos son obligatorios.",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("empleados").insert([
        {
          id_empleado: crypto.randomUUID(),
          nombre: nuevoEmpleado.nombre,
          rol: nuevoEmpleado.rol,
          usuario: nuevoEmpleado.usuario,
          password: nuevoEmpleado.password,
          tipo_turno: nuevoEmpleado.tipo_turno,
        },
      ]);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: `Empleado "${nuevoEmpleado.nombre}" registrado exitosamente.`,
        tipo: "exito",
      });

      setNuevoEmpleado({
        nombre: "",
        rol: "",
        usuario: "",
        password: "",
        tipo_turno: "",
      });

      setMostrarModal(false);
      await cargarEmpleados();

    } catch (err) {
      console.error("Error al insertar:", err);
      setToast({
        mostrar: true,
        mensaje: "Error de servidor al registrar empleado.",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9} sm={7} md={7} lg={7} className="d-flex align-items-center">
          <h3 className="mb-0">
            <i className="bi-person-badge-fill me-2"></i> Empleados
          </h3>
        </Col>
        <Col xs={3} sm={5} md={5} lg={5} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
            className="color-navbar border-0"
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Empleado</span>
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
          <Spinner animation="border" variant="success" size="lg" />
          <p className="mt-3">Cargando empleados...</p>
        </div>
      ) : (
        <>
          <Row className="d-lg-none">
            <TarjetaEmpleados
              empleados={empleadosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>

          <Row className="d-none d-lg-block">
            <TablaEmpleados
              empleados={empleadosFiltrados}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>
        </>
      )}

      <ModalRegistroEmpleados
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoEmpleado={nuevoEmpleado}
        manejoCambioInput={manejoCambioInput}
        agregarEmpleado={agregarEmpleado}
      />
      
      <ModalEdicionEmpleados
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        empleadoAEditar={empleadoAEditar}
        setEmpleadoAEditar={setEmpleadoAEditar}
        supabase={supabase}
        cargarEmpleados={cargarEmpleados}
        setToast={setToast}
      />

      <ModalEliminarEmpleados
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        empleado={empleadoAEliminar}
        supabase={supabase}
        setToast={setToast}
        cargarEmpleados={cargarEmpleados}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Empleados;
