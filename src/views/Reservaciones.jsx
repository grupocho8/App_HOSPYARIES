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
  const [reservaciones, setReservaciones] = useState([]);
  const [reservacionesFiltradas, setReservacionesFiltradas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [vistaTarjetas, setVistaTarjetas] = useState(false);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [nuevaReservacion, setNuevaReservacion] = useState({
    id_cliente: "",
    id_habitacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activa"
  });

  const [reservacionEditar, setReservacionEditar] = useState(null);
  const [reservacionAEliminar, setReservacionAEliminar] = useState(null);

  const cargarDatosReferenciales = async () => {
    const resClientes = await supabase.from("clientes").select("id_cliente, nombre");

    const resHabitaciones = await supabase
      .from("habitaciones")
      .select("id_habitacion, numero")
      .eq("estado", "disponible");

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
          clientes (
            nombre,
            apellido,
            cedula
          ),
          habitaciones (
            numero,
            tipo
          )
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

  // ==================== BÚSQUEDA (CORREGIDA) ====================
  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setReservacionesFiltradas(reservaciones);
    } else {
      const texto = textoBusqueda.toLowerCase();

      const filtrados = reservaciones.filter(res => {
        const cliente = res.clientes;
        const habitacion = res.habitaciones;

        return (
          cliente?.nombre?.toLowerCase().includes(texto) ||
          cliente?.apellido?.toLowerCase().includes(texto) || // Búsqueda por apellido
          cliente?.cedula?.includes(texto) ||                // Búsqueda por cédula
          habitacion?.numero?.toString().includes(texto) ||
          habitacion?.tipo?.toLowerCase().includes(texto)    // Búsqueda por tipo de hab
        );
      });

      setReservacionesFiltradas(filtrados);
    }
  }, [textoBusqueda, reservaciones]);

const agregarReservacion = async () => {
  try {
    // Insertar la reservación
    const { error: errorReserva } = await supabase.from("reservaciones").insert([
      {
        id_reservacion: crypto.randomUUID(),
        ...nuevaReservacion
      }
    ]);
    if (errorReserva) throw errorReserva;

    //Actualizar el estado de la habitación a 'ocupada'
    const { error: errorHabitacion } = await supabase
      .from("habitaciones")
      .update({ estado: "ocupada" }) 
      .eq("id_habitacion", nuevaReservacion.id_habitacion);

    if (errorHabitacion) throw errorHabitacion;

    setToast({ mostrar: true, mensaje: "Reservación creada y habitación ocupada", tipo: "exito" });
    setMostrarModal(false);
    setNuevaReservacion({
      id_cliente: "",
      id_habitacion: "",
      fecha_inicio: "",
      fecha_fin: "",
      estado: "Pendiente"
    });

    cargarReservaciones();
  } catch (err) {
    console.error(err);
    setToast({ mostrar: true, mensaje: "Error en la operación", tipo: "error" });
  }
};

const actualizarReservacion = async () => {
  try {
    // Actualizar la reservación
    const { error: errorReserva } = await supabase
      .from("reservaciones")
      .update({
        fecha_inicio: reservacionEditar.fecha_inicio,
        fecha_fin: reservacionEditar.fecha_fin,
        estado: reservacionEditar.estado
      })
      .eq("id_reservacion", reservacionEditar.id_reservacion);

    if (errorReserva) throw errorReserva;

    // LÓGICA DE SINCRONIZACIÓN:
    // Determinamos el nuevo estado de la habitación según el estado de la reserva
    let nuevoEstadoHabitacion = "ocupada"; // por defecto sigue ocupada

    if (reservacionEditar.estado === "finalizada" || reservacionEditar.estado === "cancelada") {
      nuevoEstadoHabitacion = "disponible";
    }

    const { error: errorHabitacion } = await supabase
      .from("habitaciones")
      .update({ estado: nuevoEstadoHabitacion })
      .eq("id_habitacion", reservacionEditar.id_habitacion);

    if (errorHabitacion) throw errorHabitacion;

    setToast({ mostrar: true, mensaje: "Registro y estado de habitación actualizados", tipo: "exito" });
    setMostrarModalEdicion(false);
    cargarReservaciones();
  } catch (err) {
    setToast({ mostrar: true, mensaje: "Error al actualizar", tipo: "error" });
  }
};

const eliminarReservacion = async () => {
  try {
    // Antes de borrar, necesitamos el ID de la habitación
    const idHabitacionLiberar = reservacionAEliminar.id_habitacion;

    const { error: errorBorrado } = await supabase
      .from("reservaciones")
      .delete()
      .eq("id_reservacion", reservacionAEliminar.id_reservacion);

    if (errorBorrado) throw errorBorrado;

    // LIBERAR HABITACIÓN
    await supabase
      .from("habitaciones")
      .update({ estado: "disponible" })
      .eq("id_habitacion", idHabitacionLiberar);

    setToast({ mostrar: true, mensaje: "Reserva eliminada y habitación liberada", tipo: "exito" });
    setMostrarModalEliminacion(false);
    cargarReservaciones();
  } catch (err) {
    setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
  }
};

  const abrirModalEdicion = (res) => {
    setReservacionEditar(res);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (res) => {
    setReservacionAEliminar(res);
    setMostrarModalEliminacion(true);
  };

  return (
    <Container className="mt-5 pt-4">
      <Row className="align-items-center mb-4">
        <Col xs={8}>
          <h3 className="fw-bold">
            <i className="bi bi-calendar-check-fill me-2 text-primary"></i>
            Reservaciones
          </h3>
        </Col>
        <Col xs={4} className="text-end">
          {/* Eliminamos el botón de cambio de vista y dejamos solo el de Nueva Reservación */}
          <Button
            onClick={() => setMostrarModal(true)}
            className="color-navbar border-0 shadow-sm"
          >
            <i className="bi bi-plus-lg me-1"></i>
            <span className="d-none d-sm-inline">Nueva Reservación</span>
          </Button>
        </Col>
      </Row>

      <hr />

      <Row className="mb-4">
        <Col md={6} lg={5}>
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
            placeholder="Buscar por cliente o habitación..."
          />
        </Col>
      </Row>

      {cargando ? (
        <div className="text-center my-5 py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Cargando...</p>
        </div>
      ) : (
        <Row>
          {/* --- VISTA MÓVIL (TARJETAS) --- */}
          {/* Se muestra en pantallas pequeñas (xs, sm, md) y se oculta en grandes (lg) */}
          <Col xs={12} className="d-lg-none">
            <TarjetaReservaciones
              reservaciones={reservacionesFiltradas}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Col>

          {/* --- VISTA PC (TABLA) --- */}
          {/* Se oculta por defecto y se muestra solo desde pantallas grandes (lg) */}
          <Col lg={12} className="d-none d-lg-block">
            <div className="bg-white rounded shadow-sm border">
              <TablaReservaciones
                reservaciones={reservacionesFiltradas}
                abrirModalEdicion={abrirModalEdicion}
                abrirModalEliminacion={abrirModalEliminacion}
              />
            </div>
          </Col>
        </Row>
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
