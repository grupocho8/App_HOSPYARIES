import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TablaTurnos from "../components/turnos/TablaTurnos";
import TarjetaTurnos from "../components/turnos/TarjetaTurnos";

import ModalRegistroTurnos from "../components/turnos/ModalRegistroTurnos";
import ModalEdicionTurnos from "../components/turnos/ModalEdicionTurnos";
import ModalEliminacionTurnos from "../components/turnos/ModalEliminacionTurnos";

import NotificacionOperacion from "../components/NotificacionOperacion";

const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);

  const [turnoAEditar, setTurnoAEditar] = useState(null);
  const [turnoAEliminar, setTurnoAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevoTurno, setNuevoTurno] = useState({
    fecha: "",
    tipo_turno: "Día",
    id_empleado: "",
  });

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const cargarTurnos = async () => {
    const { data, error } = await supabase
      .from("turnos")
      .select(`
        id_turno,
        fecha,
        tipo_turno,
        id_empleado,
        empleados ( nombre )
      `)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error al cargar turnos:", error.message);
    } else {
      setTurnos(data || []);
    }
  };

  const cargarEmpleados = async () => {
    const { data, error } = await supabase
      .from("empleados")
      .select("id_empleado, nombre")
      .order("nombre", { ascending: true });

    if (!error) setEmpleados(data || []);
  };

  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      await Promise.all([cargarTurnos(), cargarEmpleados()]);
      setCargando(false);
    };
    cargarTodo();
  }, []);

  const abrirModalEdicion = (turno) => {
    setTurnoAEditar(turno);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (turno) => {
    setTurnoAEliminar(turno);
    setMostrarModalEliminacion(true);
  };

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevoTurno((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarTurno = async () => {
    try {
      if (!nuevoTurno.fecha || !nuevoTurno.tipo_turno || !nuevoTurno.id_empleado) {
        setToast({
          mostrar: true,
          mensaje: "Por favor, completa todos los campos.",
          tipo: "advertencia",
        });
        return;
      }

      const turnoAInsertar = {
        fecha: nuevoTurno.fecha,
        tipo_turno: nuevoTurno.tipo_turno,
        id_empleado: nuevoTurno.id_empleado,
      };

      const { error } = await supabase
        .from("turnos")
        .insert([turnoAInsertar]);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: "Turno registrado con éxito",
        tipo: "exito",
      });

      setNuevoTurno({
        fecha: "",
        tipo_turno: "Día",
        id_empleado: "",
      });

      setMostrarModal(false);
      await cargarTurnos();

    } catch (err) {
      console.error(err);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al registrar",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={8}>
          <h3 className="fw-bold" style={{ color: "#0F5C4F" }}>
           <i className="bi bi-clock-fill me-2"></i>
            Gestión de Turnos
          </h3>
        </Col>

        <Col xs={4} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
            className="color-navbar border-0"
            style={{ backgroundColor: "#0F5C4F" }}
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nuevo Turno</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <p className="mt-2 text-muted">Cargando...</p>
        </div>
      ) : (
        <>
          {/* MÓVIL */}
          <div className="d-lg-none">
            <TarjetaTurnos
              turnos={turnos}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </div>

          {/* PC */}
          <div className="d-none d-lg-block">
            <TablaTurnos
              turnos={turnos}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </div>
        </>
      )}

      {/* REGISTRAR */}
      <ModalRegistroTurnos
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevoTurno={nuevoTurno}
        manejoCambioInput={manejoCambioInput}
        agregarTurno={agregarTurno}
        empleados={empleados}
      />

      {/* EDITAR */}
      <ModalEdicionTurnos
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        turnoAEditar={turnoAEditar}
        setTurnoAEditar={setTurnoAEditar}
        supabase={supabase}
        cargarTurnos={cargarTurnos}
        setToast={setToast}
        empleados={empleados}
      />

      {/* ELIMINAR */}
      <ModalEliminacionTurnos
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        turno={turnoAEliminar}
        supabase={supabase}
        setToast={setToast}
        cargarTurnos={cargarTurnos}
      />

      {/* NOTIFICACIONES */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Turnos;