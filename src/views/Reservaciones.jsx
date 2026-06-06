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
import jsPDF from "jspdf";
import { useAuth } from "../components/context/AuthContext";
import ModalEnvioCorreoReservaciones from "../components/reservaciones/ModalEnvioCorreoReservaciones";
import emailjs from '@emailjs/browser';

const Reservaciones = () => {
  const { usuario } = useAuth();
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

  const [mostrarModalCorreo, setMostrarModalCorreo] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const [nuevaReservacion, setNuevaReservacion] = useState({
    id_cliente: "",
    id_habitacion: "",
    fecha_inicio: "",
    fecha_fin: "",
    estado: "activa"
  });

  const cancelarBusqueda = () => {
    setTextoBusqueda("");
  };

  const generarPDFReservacion = (res) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200]
    });

    const generarCuerpoPDF = (img = null) => {
      let y = 10;
      if (img) {
        doc.addImage(img, 'JPEG', 25, y, 30, 30);
        y += 35;
      } else {
        y += 10;
      }

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("HOTEL 2 ARIES", 40, y, { align: "center" });
      
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Tel: +505 8287-8481", 40, y, { align: "center" });
      
      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y); 
      doc.setLineDashPattern([], 0);

      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE RESERVA", 40, y, { align: "center" });
      
      y += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const fechaActual = new Date();
      doc.text(`Generado: ${fechaActual.toLocaleDateString()} ${fechaActual.toLocaleTimeString()}`, 5, y);
      
      y += 5;
      doc.text(`ID: ${res.id_reservacion.substring(0, 8).toUpperCase()}`, 5, y);

      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      y += 8;
      const clienteNombre = `${res.clientes?.nombre || "N/A"} ${res.clientes?.apellido || ""}`.trim();
      
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL CLIENTE", 5, y);
      
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre: ${clienteNombre}`, 5, y);
      
      y += 5;
      doc.text(`Cédula: ${res.clientes?.cedula || "N/A"}`, 5, y);
      
      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      y += 8;
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DE LA HABITACIÓN", 5, y);

      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Habitación: N° ${res.habitaciones?.numero}`, 5, y);
      
      y += 5;
      doc.text(`Tipo: ${res.habitaciones?.tipo}`, 5, y);

      y += 5;
      doc.text(`Inicio de la estancia: ${new Date(res.fecha_inicio).toLocaleDateString()}`, 5, y);

      y += 5;
      doc.text(`Fin de la estancia: ${new Date(res.fecha_fin).toLocaleDateString()}`, 5, y);

      y += 5;
      doc.text(`Estado: ${res.estado.toUpperCase()}`, 5, y);

      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      y += 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("¡Gracias por preferirnos!", 40, y, { align: "center" });
      
      y += 4;
      doc.text("Este comprobante garantiza su", 40, y, { align: "center" });
      y += 4;
      doc.text("estadía en nuestro hotel.", 40, y, { align: "center" });

      doc.save(`Reserva_${clienteNombre.replace(/\s+/g, "_")}.pdf`);
    };

    const img = new Image();
    img.src = '/LogoHospyAries.jpeg';
    
    img.onload = () => {
      generarCuerpoPDF(img);
    };
    
    img.onerror = () => {
      generarCuerpoPDF(null);
    };
  };

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
    const resClientes = await supabase.from("clientes").select("id_cliente, nombre, apellido");

    const resHabitaciones = await supabase
      .from("habitaciones")
      .select("id_habitacion, numero, tipo")
      .eq("estado", "disponible");

    setClientes(resClientes.data || []);
    setHabitaciones(resHabitaciones.data || []);
  };

const cargarReservaciones = async () => {
    try {
      setCargando(true);
      let query = supabase
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
            tipo,
            estado
          )
        `)
        .order("fecha_creacion", { ascending: false });

      if (usuario?.rol === "cliente") {
        query = query.eq("id_cliente", usuario.id_cliente);
      }

      const { data, error } = await query;

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

      // Determinar el nuevo estado de la habitación
      let estadoHabitacionNuevo = "reservada";
      if (nuevaReservacion.estado === "finalizada" || nuevaReservacion.estado === "cancelada") {
        estadoHabitacionNuevo = "disponible";
      }

      // Actualizar el estado de la habitación
      const { error: errorHabitacion } = await supabase
        .from("habitaciones")
        .update({ 
          estado: estadoHabitacionNuevo,
          id_reservacion_actual: estadoHabitacionNuevo === "disponible" ? null : idNuevaReservacion // Guardamos el enlace inverso si está activa
        }) 
        .eq("id_habitacion", nuevaReservacion.id_habitacion);

      if (errorHabitacion) throw errorHabitacion;

      setToast({ mostrar: true, mensaje: "Reservación creada y habitación actualizada", tipo: "exito" });
      setMostrarModal(false);
      setNuevaReservacion({
        id_cliente: "",
        id_habitacion: "",
        fecha_inicio: "",
        fecha_fin: "",
        estado: "activa"
      });

      cargarReservaciones();
      cargarDatosReferenciales(); // Refrescar lista de habitaciones disponibles
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

      let nuevoEstadoHabitacion = "reservada";

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
      cargarDatosReferenciales(); // Refrescar lista de habitaciones disponibles
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
      cargarDatosReferenciales(); // Refrescar lista de habitaciones disponibles
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
    }
  };

  const cancelarReservacionCliente = async () => {
    try {
      const idHabitacionLiberar = reservacionAEliminar.id_habitacion;

      const { error: errorReserva } = await supabase
        .from("reservaciones")
        .update({ estado: "cancelada" })
        .eq("id_reservacion", reservacionAEliminar.id_reservacion);

      if (errorReserva) throw errorReserva;

      await supabase
        .from("habitaciones")
        .update({ estado: "disponible", id_reservacion_actual: null })
        .eq("id_habitacion", idHabitacionLiberar);

      setToast({ mostrar: true, mensaje: "Reservación cancelada exitosamente", tipo: "exito" });
      setMostrarModalEliminacion(false);
      cargarReservaciones();
      cargarDatosReferenciales(); // Refrescar lista de habitaciones disponibles
    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al cancelar la reservación", tipo: "error" });
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

  const confirmarLlegada = async (res) => {
    try {
      console.log("Intentando confirmar llegada para reserva:", res);
      const { error } = await supabase
        .from("habitaciones")
        .update({ estado: "ocupada" })
        .eq("id_habitacion", res.id_habitacion);

      if (error) {
        console.error("Error de Supabase al actualizar habitación:", error);
        throw error;
      }

      console.log("Habitación actualizada a ocupada exitosamente.");
      setToast({ mostrar: true, mensaje: "Llegada confirmada. Habitación ocupada.", tipo: "exito" });
      cargarReservaciones();
    } catch (err) {
      console.error("Catch block error:", err);
      setToast({ mostrar: true, mensaje: "Error al confirmar llegada", tipo: "error" });
    }
  };

  // Inicializar EmailJS
  useEffect(() => {
    emailjs.init(import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
  }, []);

  const abrirModalCorreo = () => {
    setEmailDestino("");
    setMostrarModalCorreo(true);
  };

  const formatearReservacionesParaCorreo = () => {
    if (reservacionesFiltradas.length === 0) return "No hay reservaciones registradas.";
    let texto = `LISTADO DE RESERVACIONES\n\n`;
    texto += `Fecha: ${new Date().toLocaleDateString("es-NI")}\n`;
    texto += `Total de reservaciones: ${reservacionesFiltradas.length}\n\n`;
    
    reservacionesFiltradas.forEach((res, index) => {
      texto += `${index + 1}. Cliente: ${res.clientes?.nombre} ${res.clientes?.apellido} (Cédula: ${res.clientes?.cedula || 'N/A'})\n`;
      texto += `   Habitación: ${res.habitaciones?.numero} - Tipo: ${res.habitaciones?.tipo}\n`;
      texto += `   Estancia: ${new Date(res.fecha_inicio).toLocaleDateString("es-NI")} al ${new Date(res.fecha_fin).toLocaleDateString("es-NI")}\n`;
      texto += `   Estado: ${res.estado.toUpperCase()}\n\n`;
    });
    return texto;
  };

  const enviarCorreoReservaciones = () => {
    if (!emailDestino.trim()) {
      setToast({
        mostrar: true,
        mensaje: "Por favor ingresa un correo destino.",
        tipo: "advertencia",
      });
      return;
    }
    setEnviandoCorreo(true);
    const mensaje = formatearReservacionesParaCorreo();
    const templateParams = {
      to_name: "Administrador",
      user_email: emailDestino,
      message: mensaje,
      fecha_envio: new Date().toLocaleDateString("es-NI")
    };
    
    emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams
    )
    .then(() => {
      setToast({
        mostrar: true,
        mensaje: "Correo enviado correctamente.",
        tipo: "exito",
      });
      setMostrarModalCorreo(false);
      setEmailDestino("");
    })
    .catch((error) => {
      console.error("Error EmailJS:", error);
      setToast({
        mostrar: true,
        mensaje: "Error al enviar el correo.",
        tipo: "error",
      });
    })
    .finally(() => {
      setEnviandoCorreo(false);
    });
  };

return (
  <Container className="mt-4">
    {/* Contenedor del título con el borde inferior idéntico al de Clientes */}
    <div className="border-bottom pb-3 mb-4">
      <Row className="align-items-center">
         <Col xs={9} sm={7} md={7} lg={7}>
           <h3><i className="bi-calendar-check-fill me-2"></i> Reservaciones</h3>
         </Col>

               <Col xs={3} sm={5} md={5} lg={5} className="text-end d-flex justify-content-end gap-2">
                 {usuario?.rol !== "cliente" && (
                   <>
                     <Button
                       onClick={abrirModalCorreo}
                       size="md"
                       className="color-navbar border-0"
                     >
                       <i className="bi bi-envelope"></i>
                       <span className="d-none d-lg-inline ms-2">
                         Enviar
                       </span>
                     </Button>
                     <Button
                       onClick={() => setMostrarModal(true)}
                       size="md"
                       className="color-navbar border-0"
                     >
                       <i className="bi-plus-lg"></i>
                       <span className="d-none d-sm-inline ms-2">
                         Nueva Reservación
                       </span>
                     </Button>
                   </>
                 )}
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
            generarPDFReservacion={generarPDFReservacion}
            confirmarLlegada={confirmarLlegada}
            esCliente={usuario?.rol === "cliente"}
          />
        </Col>

        {/* --- VISTA PC (TABLA) --- */}
        <Col lg={12} className="d-none d-lg-block">
          <TablaReservaciones
            reservaciones={reservacionesPaginadas}
            abrirModalEdicion={abrirModalEdicion}
            abrirModalEliminacion={abrirModalEliminacion}
            generarPDFReservacion={generarPDFReservacion}
            confirmarLlegada={confirmarLlegada}
            paginaActual={paginaActual}
            registrosPorPagina={registrosPorPagina}
            esCliente={usuario?.rol === "cliente"}
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
      cancelarReservacionCliente={cancelarReservacionCliente}
      esCliente={usuario?.rol === "cliente"}
    />

    <ModalEnvioCorreoReservaciones
      mostrarModalCorreo={mostrarModalCorreo}
      setMostrarModalCorreo={setMostrarModalCorreo}
      emailDestino={emailDestino}
      setEmailDestino={setEmailDestino}
      enviandoCorreo={enviandoCorreo}
      enviarCorreoReservaciones={enviarCorreoReservaciones}
      totalReservaciones={reservacionesFiltradas.length}
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