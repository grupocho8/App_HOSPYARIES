import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

// Componentes del módulo
import ModalRegistroReservaciones from "../components/reservaciones/ModalRegistroReservaciones";
import ModalEdicionReservaciones from "../components/reservaciones/ModalEdicionReservaciones";
import ModalEliminarReservaciones from "../components/reservaciones/ModalEliminarReservaciones";
import TablaReservaciones from "../components/reservaciones/TablaReservaciones";
import TarjetaReservaciones from "../components/reservaciones/TarjetaReservaciones";

const Reservaciones = () => {
  // --- ESTADOS DE DATOS ---
  const [reservaciones, setReservaciones] = useState([]);
  const [reservacionesFiltradas, setReservacionesFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vistaTarjetas, setVistaTarjetas] = useState(false); // Switch opcional de vista

  // --- ESTADOS UI (Modales y Toast) ---
  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  // --- ESTADOS DE OBJETOS ---
  const [nuevaReservacion, setNuevaReservacion] = useState({
    id_cliente: "",
    id_habitacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activa"
  });

  const [reservacionEditar, setReservacionEditar] = useState(null);
  const [reservacionAEliminar, setReservacionAEliminar] = useState(null);

  // --- CARGA DE DATOS ---
  // Dentro de Reservaciones.jsx
  const cargarDatosReferenciales = async () => {
    const resClientes = await supabase.from("clientes").select("id_cliente, nombre");

    // Cambiamos "Disponible" por "disponible"
    const resHabitaciones = await supabase
      .from("habitaciones")
      .select("id_habitacion, numero")
      .eq("estado", "disponible"); // <--- Ajuste aquí

    setClientes(resClientes.data || []);
    setHabitaciones(resHabitaciones.data || []);
  };

  const cargarReservaciones = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("reservaciones")
        .select(`
          *,
          clientes (nombre),
          habitaciones (numero)
        `)
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setReservaciones(data || []);
      setReservacionesFiltradas(data || []);
    } catch (err) {
      console.error("Error al cargar:", err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatosReferenciales();
    cargarReservaciones();
  }, []);

  // --- FILTRADO ---
  useEffect(() => {
    const texto = textoBusqueda.toLowerCase().trim();
    const filtrados = reservaciones.filter(res =>
      res.clientes?.nombre.toLowerCase().includes(texto) ||
      res.habitaciones?.numero.toLowerCase().includes(texto)
    );
    setReservacionesFiltradas(filtrados);
  }, [textoBusqueda, reservaciones]);

  // --- FUNCIONES CRUD ---

  const agregarReservacion = async () => {
    try {
      const { error } = await supabase.from("reservaciones").insert([
        {
          id_reservacion: crypto.randomUUID(), // UUID Manual
          ...nuevaReservacion
        }
      ]);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Reservación creada", tipo: "exito" });
      setMostrarModal(false);
      setNuevaReservacion({ id_cliente: "", id_habitacion: "", fecha_inicio: "", fecha_fin: "", estado: "Pendiente" });
      cargarReservaciones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al crear reservación", tipo: "error" });
    }
  };

  const actualizarReservacion = async () => {
    try {
      const { error } = await supabase
        .from("reservaciones")
        .update({
          fecha_inicio: reservacionEditar.fecha_inicio,
          fecha_fin: reservacionEditar.fecha_fin,
          estado: reservacionEditar.estado
        })
        .eq("id_reservacion", reservacionEditar.id_reservacion);

      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Reservación actualizada", tipo: "exito" });
      setMostrarModalEdicion(false);
      cargarReservaciones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar", tipo: "error" });
    }
  };

  const eliminarReservacion = async () => {
    try {
      const { error } = await supabase
        .from("reservaciones")
        .delete()
        .eq("id_reservacion", reservacionAEliminar.id_reservacion);

      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Registro eliminado", tipo: "exito" });
      setMostrarModalEliminacion(false);
      cargarReservaciones();
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
    }
  };

  // --- HANDLERS PARA ABRIR MODALES ---
  const abrirModalEdicion = (res) => {
    setReservacionEditar(res);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (res) => {
    setReservacionAEliminar(res);
    setMostrarModalEliminacion(true);
  };

  return (
    <Container className="mt-5">
      <Row className="align-items-center mb-4">
        <Col>
          <h3><i className="bi bi-calendar-check-fill me-2"></i> Reservaciones</h3>
        </Col>
        <Col className="text-end">
          <Button
            variant="outline-secondary"
            className="me-2"
            onClick={() => setVistaTarjetas(!vistaTarjetas)}
          >
            {vistaTarjetas ? <i className="bi bi-table"></i> : <i className="bi bi-grid"></i>}
          </Button>
          <Button onClick={() => setMostrarModal(true)} className="color-navbar border-0">
            Nueva Reservación
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por cliente o habitación..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center my-5"><Spinner animation="border" variant="primary" /></div>
      ) : (
        vistaTarjetas ? (
          <TarjetaReservaciones
            reservaciones={reservacionesFiltradas}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
          />
        ) : (
          <TablaReservaciones
            reservaciones={reservacionesFiltradas}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
          />
        )
      )}

      {/* --- MODALES --- */}
      <ModalRegistroReservaciones
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaReservacion={nuevaReservacion}
        setNuevaReservacion={setNuevaReservacion}
        agregarReservacion={agregarReservacion}
        clientes={clientes}
        habitaciones={habitaciones}
      />

      {reservacionEditar && (
        <ModalEdicionReservaciones
          mostrarModalEdicion={mostrarModalEdicion}
          setMostrarModalEdicion={setMostrarModalEdicion}
          reservacionEditar={reservacionEditar}
          setReservacionEditar={setReservacionEditar}
          actualizarReservacion={actualizarReservacion}
        />
      )}

      <ModalEliminarReservaciones
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        reservacionEliminar={reservacionAEliminar}
        eliminarReservacion={eliminarReservacion}
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

export default Reservaciones;