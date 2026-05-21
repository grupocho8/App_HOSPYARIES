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

import Paginacion from "../components/ordenamiento/Paginacion"; // ✅ NUEVO

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

  // ESTADOS DE PAGINACIÓN ADICIONADOS
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  // SECCIÓN DE CÁLCULO DE REGISTROS PAGINADOS
  const reservacionesPaginadas = reservacionesFiltradas.slice(
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
          habitaciones!id_habitacion (
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

  // ==================== BÚSQUEDA (CON RESET DE PAGINACIÓN) ====================
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
          cliente?.apellido?.toLowerCase().includes(texto) ||
          cliente?.cedula?.includes(texto) ||
          habitacion?.numero?.toString().includes(texto) ||
          habitacion?.tipo?.toLowerCase().includes(texto)
        );
      });

      setReservacionesFiltradas(filtrados);
    }
    // RESETEA A PÁGINA 1 AL BUSCAR
    setPaginaActual(1);
  }, [textoBusqueda, reservaciones]);

const agregarReservacion = async () => {
  try {
    // Generamos el ID único antes para poder usarlo en ambas tablas
    const idNuevaReservacion = crypto.randomUUID();

    // Insertar la reservación
    const { error: errorReserva } = await supabase.from("reservaciones").insert([
      {
        id_reservacion: idNuevaReservacion,
        ...nuevaReservacion
      }
    ]);
    if (errorReserva) throw errorReserva;

    // Actualizar el estado de la habitación a 'ocupada' y guardar el ID de la reserva
    const { error: errorHabitacion } = await supabase
      .from("habitaciones")
      .update({ 
        estado: "ocupada",
        id_reservacion_actual: idNuevaReservacion // 👈 Guardamos el enlace inverso
      }) 
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
      const { error: errorReserva } = await supabase
        .from("reservaciones")
        .update({
          fecha_inicio: reservacionEditar.fecha_inicio,
          fecha_fin: reservacionEditar.fecha_fin,
          estado: reservacionEditar.estado
        })
        .eq("id_reservacion", reservacionEditar.id_reservacion);

      if (errorReserva) throw errorReserva;

      let nuevoEstadoHabitacion = "ocupada";

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
      const idHabitacionLiberar = reservacionAEliminar.id_habitacion;

      const { error: errorBorrado } = await supabase
        .from("reservaciones")
        .delete()
        .eq("id_reservacion", reservacionAEliminar.id_reservacion);

      if (errorBorrado) throw errorBorrado;

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
  <Container className="mt-4">
    {/* Contenedor del título con el borde inferior idéntico al de Clientes */}
    <div className="border-bottom pb-3 mb-4">
      <Row className="align-items-center">
         <Col xs={9} sm={7} md={7} lg={7}>
           <h3><i className="bi-calendar-check-fill me-2"></i> Reservaciones</h3>
         </Col>

               <Col xs={3} sm={5} md={5} lg={5} className="text-end">
                 <Button
                   onClick={() =>
                     setMostrarModal(
                       true
                     )
                   }
                   size="md"
                   className="color-navbar border-0"
                 >
                   <i className="bi-plus-lg"></i>
       
                   <span className="d-none d-sm-inline ms-2">
                     Nueva Reservación
                   </span>
                 </Button>
               </Col>
      </Row>
    </div>

    {/* Buscador */}
    <Row className="mb-4">
      <Col md={6} lg={5}>
        <CuadroBusquedas
          textoBusqueda={textoBusqueda}
          manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
          placeholder="Buscar..."
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
        <Col xs={12} className="d-lg-none">
          <TarjetaReservaciones
            reservaciones={reservacionesPaginadas}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
          />
        </Col>

        {/* --- VISTA PC (TABLA) --- */}
        <Col lg={12} className="d-none d-lg-block">
          <TablaReservaciones
            reservaciones={reservacionesPaginadas}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
            paginaActual={paginaActual}
            registrosPorPagina={registrosPorPagina}
          />
        </Col>
      </Row>
    )}

    {/* COMPONENTE DE PAGINACIÓN */}
    <Paginacion
      registrosPorPagina={registrosPorPagina}
      totalRegistros={reservacionesFiltradas.length}
      paginaActual={paginaActual}
      establecerPaginaActual={establecerPaginaActual}
      establecerRegistrosPorPagina={establecerRegistrosPorPagina}
    />

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