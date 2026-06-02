import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Spinner,
  Badge,
} from "react-bootstrap";

import { supabase } from "../database/supabaseconfig";

import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import FormularioVenta from "../components/ventas/FormularioVenta";
import ModalEdicionVenta from "../components/ventas/ModalEdicionVenta";
import ModalEliminarVenta from "../components/ventas/ModalEliminarVenta";
import ChatIA from "../components/chat/ChatIA";
import TarjetaVenta from "../components/ventas/TarjetaVenta";
import ModalDashboardVentas from "../components/ventas/ModalDashboardVentas";
import Paginacion from "../components/ordenamiento/Paginacion"; 
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ventas = () => {
  const [mostrarDashboard, setMostrarDashboard] = useState(false);
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);

  const [toast, setToast] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "",
  });

  const [showEditar, setShowEditar] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);

  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [mostrarChatModal, setMostrarChatModal] = useState(false);

  const [nuevaVenta, setNuevaVenta] = useState({
    id_reservacion: "",
    id_empleado: "",
    monto: "",
  });

  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [paginaActual, setPaginaActual] = useState(1);

  const ventasPaginadas = ventasFiltradas.slice(
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

  // ==================== CARGAR DATOS ====================

const cargarDatos = async () => {
    try {
      setCargando(true);

      // 1. Carga de Reservaciones (Se corrigió habitaciones!id_habitacion)
      const { data: resData } = await supabase.from("reservaciones").select(`
          id_reservacion,
          clientes (
            nombre,
            apellido
          ),
          habitaciones!id_habitacion (
            numero,
            tipo
          )
        `);

      const { data: empData } = await supabase
        .from("empleados")
        .select(`
          id_empleado,
          nombre_empleado,
          apellido_empleado,
          tipo_turno,
          tipo_empleado
        `)
        .eq("tipo_empleado", "recepcionista");

      const { data: ventasData } = await supabase
        .from("ventas")
        .select(
          `
          id_venta,
          id_reservacion,
          monto,
          fecha,

          reservaciones (
            estado,
            clientes (
              nombre,
              apellido
            ),

            habitaciones!id_habitacion (
              numero,
              tipo
            )
          ),

          empleados (
            nombre_empleado,
            apellido_empleado,
            tipo_turno
          )
        `,
        )
        .order("fecha", { ascending: false });

      // Extraer IDs de reservaciones que ya tienen una venta
      const reservacionesConVenta = new Set(
        (ventasData || []).map((v) => v.id_reservacion).filter(Boolean)
      );

      // Filtrar reservaciones disponibles (que NO están en reservacionesConVenta)
      const reservacionesDisponibles = (resData || []).filter(
        (r) => !reservacionesConVenta.has(r.id_reservacion)
      );

      setReservaciones(reservacionesDisponibles);
      setEmpleados(empData || []);
      setVentas(ventasData || []);
      setVentasFiltradas(ventasData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  // ==================== AGREGAR VENTA ====================

  const manejarAgregarVenta = async () => {
    if (
      !nuevaVenta.id_reservacion ||
      !nuevaVenta.id_empleado ||
      !nuevaVenta.monto
    ) {
      setToast({
        mostrar: true,
        mensaje: "Complete todos los campos",
        tipo: "error",
      });

      return;
    }

    try {
      // ==================== VALIDAR DUPLICADOS ====================

      const { data: ventaExistente } = await supabase
        .from("ventas")
        .select("id_venta")
        .eq("id_reservacion", nuevaVenta.id_reservacion)
        .maybeSingle();

      // SI YA EXISTE

      if (ventaExistente) {
        setToast({
          mostrar: true,
          mensaje: "Esta reservación ya tiene una venta registrada",
          tipo: "error",
        });

        return;
      }

      // ==================== INSERTAR ====================

      const { error } = await supabase.from("ventas").insert([
        {
          id_venta: crypto.randomUUID(),
          id_reservacion: nuevaVenta.id_reservacion,
          id_empleado: nuevaVenta.id_empleado,
          monto: parseFloat(nuevaVenta.monto),
          fecha: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: "Venta registrada correctamente",
        tipo: "exito",
      });

      // ==================== LIMPIAR FORMULARIO ====================

      setNuevaVenta({
        id_reservacion: "",
        id_empleado: "",
        monto: "",
      });

      cargarDatos();
    } catch (error) {
      console.error(error);

      setToast({
        mostrar: true,
        mensaje: "Error al registrar",
        tipo: "error",
      });
    }
  };

  // ==================== ACTUALIZAR ====================

  const manejarActualizarVenta = async () => {
    try {
      const { error } = await supabase
        .from("ventas")
        .update({
          monto: parseFloat(ventaSeleccionada.monto),
        })
        .eq("id_venta", ventaSeleccionada.id_venta);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: "Venta actualizada",
        tipo: "exito",
      });

      setShowEditar(false);

      cargarDatos();
    } catch (error) {
      console.error(error);

      setToast({
        mostrar: true,
        mensaje: "Error al actualizar",
        tipo: "error",
      });
    }
  };

  // ==================== ELIMINAR ====================

  const manejarEliminarVenta = async () => {
    if (!ventaSeleccionada) return;

    try {
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id_venta", ventaSeleccionada.id_venta);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: "Venta eliminada",
        tipo: "exito",
      });

      setShowEliminar(false);

      cargarDatos();
    } catch (error) {
      console.error(error);

      setToast({
        mostrar: true,
        mensaje: "Error al eliminar",
        tipo: "error",
      });
    }
  };

  // ==================== BUSCADOR ====================

  useEffect(() => {
    const filtradas = ventas.filter((v) => {
      const query = textoBusqueda.toLowerCase();

      const cliente =
        `${v.reservaciones?.clientes?.nombre || ""} ${v.reservaciones?.clientes?.apellido || ""}`.toLowerCase();

      const habitacion =
        v.reservaciones?.habitaciones?.numero?.toString().toLowerCase() || "";

      const empleado =
        `${v.empleados?.nombre_empleado || ""} ${v.empleados?.apellido_empleado || ""}`.toLowerCase();

      return (
        cliente.includes(query) ||
        habitacion.includes(query) ||
        empleado.includes(query)
      );
    });

    setVentasFiltradas(filtradas);
    setPaginaActual(1);
  }, [textoBusqueda, ventas]);

  // ==================== PDF INDIVIDUAL ====================

  const generarPDFIndividual = (v) => {
    // Configuración tipo Voucher/Ticket (80mm ancho x 200mm alto)
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 200]
    });

    const generarCuerpoPDF = (img = null) => {
      let y = 10;

      // 1. Añadir logo si existe
      if (img) {
        doc.addImage(img, 'JPEG', 25, y, 30, 30);
        y += 35;
      } else {
        y += 10;
      }

      // 2. Encabezado del Hotel
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("HOTEL 2 ARIES", 40, y, { align: "center" });
      
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text("Tel: +505 8287-8481", 40, y, { align: "center" });
      
      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y); // Línea divisoria
      doc.setLineDashPattern([], 0);

      // 3. Título y Detalles Básicos
      y += 8;
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE VENTA", 40, y, { align: "center" });
      
      y += 7;
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      const fechaVenta = v.fecha ? new Date(v.fecha) : new Date();
      doc.text(`Fecha: ${fechaVenta.toLocaleDateString()} ${fechaVenta.toLocaleTimeString()}`, 5, y);
      
      y += 5;
      doc.text(`ID: ${v.id_venta.substring(0, 8).toUpperCase()}`, 5, y);

      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      // 4. Datos del Cliente
      y += 8;
      const clienteNombre = `${v.reservaciones?.clientes?.nombre || "N/A"} ${v.reservaciones?.clientes?.apellido || ""}`.trim();
      
      doc.setFont("helvetica", "bold");
      doc.text("DATOS DEL CLIENTE", 5, y);
      
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.text(`Nombre: ${clienteNombre}`, 5, y);
      
      y += 5;
      doc.text(`Habitación: N° ${v.reservaciones?.habitaciones?.numero}`, 5, y);
      
      y += 5;
      doc.text(`Tipo: ${v.reservaciones?.habitaciones?.tipo}`, 5, y);

      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      // 5. Datos del Empleado
      y += 8;
      doc.text(`Atendido por: ${v.empleados?.nombre_empleado} ${v.empleados?.apellido_empleado}`, 5, y);
      y += 5;
      doc.text(`Turno: ${v.empleados?.tipo_turno === "dia" ? "Día" : "Noche"}`, 5, y);

      y += 5;
      doc.setLineDashPattern([2, 1], 0);
      doc.line(5, y, 75, y);
      doc.setLineDashPattern([], 0);

      // 6. TOTAL
      y += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL:", 5, y);
      doc.text(`C$ ${parseFloat(v.monto).toFixed(2)}`, 75, y, { align: "right" });

      // 7. Pie de página
      y += 15;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("¡Gracias por su preferencia!", 40, y, { align: "center" });
      doc.save(`Voucher_${clienteNombre.replace(/\s+/g, "_")}.pdf`);
    };

    // Intentar cargar el logo
    const img = new Image();
    img.src = '/LogoHospyAries.jpeg';
    
    img.onload = () => {
      generarCuerpoPDF(img);
    };
    
    img.onerror = () => {
      // Si falla la carga del logo (por ej, ruta incorrecta), generar sin logo
      generarCuerpoPDF(null);
    };
  };

  // ==================== PDF INDIVIDUAL ====================

  const imprimirTicketRawbt = (venta) => {
    const clienteNombre = `${venta.reservaciones?.clientes?.nombre || "N/A"} ${venta.reservaciones?.clientes?.apellido || ""}`.trim();

    const fechaVenta = venta.fecha ? new Date(venta.fecha) : new Date();
    const fecha = fechaVenta.toLocaleString("es-NI", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const numeroVenta = venta.id_venta ? venta.id_venta.substring(0, 8).toUpperCase() : "-";
    const total = parseFloat(venta.monto || 0).toFixed(2);
    const empleadoNombre = `${venta.empleados?.nombre_empleado || ""} ${venta.empleados?.apellido_empleado || ""}`.trim();
    const habitacionNumero = venta.reservaciones?.habitaciones?.numero || "-";
    const habitacionTipo = venta.reservaciones?.habitaciones?.tipo || "-";
    const turno = venta.empleados?.tipo_turno === "dia" ? "Día" : "Noche";

    let detalleTexto = "DATOS DE RESERVACION:\n";
    detalleTexto += `Habitacion N. ${habitacionNumero}\n`;
    detalleTexto += `Tipo: ${habitacionTipo}\n`;
    detalleTexto += `Atendido por: ${empleadoNombre}\n`;
    detalleTexto += `Turno: ${turno}\n`;

    const texto = `
HOTEL 2 ARIES
Tel: +505 8287-8481
================================
COMPROBANTE DE VENTA
================================
Ticket #${numeroVenta}
Cliente: ${clienteNombre}
Fecha: ${fecha}
================================
${detalleTexto}
================================
TOTAL: C$${total}
================================
Gracias por su preferencia!
`;

    const encoded = encodeURIComponent(texto);
    window.location.href = `rawbt:${encoded}`;
  };

  // ==================== PDF GENERAL ====================

  const generarPDFVentas = () => {
    // Reporte general en formato apaisado (landscape) o retrato (portrait). Usaremos A4 normal.
    const doc = new jsPDF();

    const generarCuerpoPDF = (img = null) => {
      // ==================== ENCABEZADO (Banner Superior) ====================
      doc.setFillColor(44, 108, 98);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), 35, "F");

      // Logo
      if (img) {
        doc.addImage(img, 'JPEG', 15, 5, 25, 25);
      }

      // Nombre del Hotel y Contacto (Texto blanco sobre fondo verde)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("HOTEL 2 ARIES", 50, 15);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("Dirección: Ciudadela, del parque central 2c al sur.", 50, 22);
      doc.text("Tel: +505 8287-8481 | Servicios: Hospedaje y Eventos", 50, 28);

      // ==================== TÍTULO Y FECHA ====================
      doc.setTextColor(44, 108, 98);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("REPORTE GENERAL DE VENTAS", doc.internal.pageSize.getWidth() / 2, 50, { align: "center" });

      doc.setTextColor(90, 90, 90);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Fecha de emisión: ${new Date().toLocaleDateString()}`, 14, 60);

      // ==================== TABLA ====================
      const columnas = [
        "#",
        "Cliente",
        "Hab.",
        "Tipo",
        "Empleado",
        "Turno",
        "Monto",
        "Fecha",
      ];

      const filas = ventasFiltradas.map((v, index) => [
        index + 1,
        `${v.reservaciones?.clientes?.nombre || ""} ${v.reservaciones?.clientes?.apellido || ""}`.trim(),
        v.reservaciones?.habitaciones?.numero || "—",
        v.reservaciones?.habitaciones?.tipo || "—",
        `${v.empleados?.nombre_empleado || ""} ${v.empleados?.apellido_empleado || ""}`.trim(),
        v.empleados?.tipo_turno === "dia" ? "Día" : "Noche",
        `C$ ${parseFloat(v.monto || 0).toFixed(2)}`,
        v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F",
      ]);

      autoTable(doc, {
        head: [columnas],
        body: filas,
        startY: 65,
        theme: "grid",
        headStyles: {
          fillColor: [44, 108, 98],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: () => {
          // ==================== TOTAL GENERAL (Pie de tabla) ====================
          doc.setFontSize(11);
          doc.setTextColor(44, 108, 98);
          doc.setFont("helvetica", "bold");
          doc.text(
            `Total General Recaudado: C$ ${totalCalculado.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}`,
            14,
            doc.internal.pageSize.getHeight() - 10,
          );
        },
      });

      // ==================== GUARDAR ====================
      const fecha = new Date().toISOString().split("T")[0];
      doc.save(`Reporte_General_Ventas_${fecha}.pdf`);
    };

    // Intentar cargar el logo
    const img = new Image();
    img.src = '/LogoHospyAries.jpeg';
    
    img.onload = () => {
      generarCuerpoPDF(img);
    };
    
    img.onerror = () => {
      generarCuerpoPDF(null);
    };
  };

  // ==================== TOTAL ====================

  const totalCalculado = ventasFiltradas.reduce(
    (acc, v) => acc + parseFloat(v.monto || 0),
    0,
  );

  // ==================== USE EFFECT ====================

  useEffect(() => {
    cargarDatos();
  }, []);

  // ==================== RETURN ====================

  return (
    <Container fluid className="mt-5 px-4">
      <Row>
        {/* PANEL IZQUIERDO */}

        <Col lg={3}>
          <FormularioVenta
            nuevaVenta={nuevaVenta}
            setNuevaVenta={setNuevaVenta}
            agregarVenta={manejarAgregarVenta}
            reservaciones={reservaciones}
            empleados={empleados}
          />
        </Col>

        {/* PANEL DERECHO */}

        <Col lg={9}>
          {/* BUSCADOR */}

          <Row className="mb-4 align-items-center gy-3">
            <Col md={6}>
              <CuadroBusquedas
                textoBusqueda={textoBusqueda}
                manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
              />
            </Col>

            <Col
              md={6}
              className="
                  d-flex
                  justify-content-md-end
                  gap-2
                  mt-2
                  mt-md-0
                  flex-wrap
                "
            >
              {/* DASHBOARD */}
              <Button variant="outline-primary" onClick={() => setMostrarDashboard(true)}>
                <i className="bi bi-bar-chart-fill me-2"></i>
                Ver Análisis
              </Button>

              {/* PDF GENERAL */}

              <Button variant="outline-danger" onClick={generarPDFVentas}>
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Reporte
              </Button>

              {/* IA */}

              <Button
                className="border-0"
                style={{
                  backgroundColor: "#2c6c62",
                }}
                onClick={() => setMostrarChatModal(true)}
              >
                <i className="bi bi-robot me-2"></i>
                Consultar IA
              </Button>
            </Col>
          </Row>

          {/* ==================== TABLA ==================== */}

          <div
            className="
              bg-white
              rounded
              shadow-sm
              border
              overflow-hidden
              d-none
              d-md-block
            "
          >
            <Table hover responsive className="align-middle mb-0 text-center">
              {/* HEADER */}

              <thead
                className="
                  table-light
                  small
                  text-muted
                "
              >
                <tr>
                  <th>#</th>

                  <th className="text-start">Clientes</th>
                  <th>Habitaciones</th>
                  <th>Tipos</th>
                  <th>Empleados</th>
                  <th>Turnos</th>
                  <th>Montos</th>
                  <th>Fechas</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>

              {/* BODY */}

              <tbody className="small">
                {cargando ? (
                  <tr>
                    <td colSpan="9">
                      <Spinner animation="border" size="sm" />
                    </td>
                  </tr>
                ) : ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-5 text-muted">
                      No hay ventas registradas
                    </td>
                  </tr>
                ) : (

                  ventasPaginadas.map((v, index) => (
                    <tr key={v.id_venta}>
                      <td>{index + 1}</td>

                      {/* CLIENTE */}

                      <td className="text-start fw-semibold">
                        {v.reservaciones?.clientes?.nombre}{" "}
                        {v.reservaciones?.clientes?.apellido}
                      </td>

                      {/* HAB */}

                      <td>
                        <Badge bg="light" text="dark">
                          {v.reservaciones?.habitaciones?.numero}
                        </Badge>
                      </td>

                      {/* TIPO */}

                      <td className="text-muted small">
                        {v.reservaciones?.habitaciones?.tipo}
                      </td>

                      {/* EMPLEADO */}

                      <td>
                        {v.empleados?.nombre_empleado}{" "}
                        {v.empleados?.apellido_empleado}
                      </td>

                      {/* TURNO */}

                      <td>
                        <span
                          className="badge px-3 py-2"
                          style={{
                            backgroundColor:
                              v.empleados?.tipo_turno === "dia"
                                ? "#faec8e"
                                : "#59cbcb",

                            color:
                              v.empleados?.tipo_turno === "dia"
                                ? "#231717"
                                : "#fbfbfb",

                            borderRadius: "10px",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                          }}
                        >
                          {v.empleados?.tipo_turno === "dia" ? "Día" : "Noche"}
                        </span>
                      </td>

                      {/* MONTO */}

                      <td className="fw-bold text-success">
                        C$ {parseFloat(v.monto || 0).toFixed(2)}
                      </td>

                      {/* FECHA */}

                      <td className="text-muted">
                        {v.fecha
                          ? new Date(v.fecha).toLocaleDateString()
                          : "S/F"}
                      </td>

                      {/* ACCIONES */}

                      <td>
                        {/* RAWBT TICKET */}

                        <Button
                          variant="link"
                          className="text-info p-1"
                          onClick={() => imprimirTicketRawbt(v)}
                          title="Imprimir Ticket Bluetooth"
                        >
                          <i className="bi bi-printer fs-5"></i>
                        </Button>

                        {/* PDF */}

                        <Button
                          variant="link"
                          className="text-danger p-1"
                          onClick={() => generarPDFIndividual(v)}
                        >
                          <i className="bi bi-file-earmark-pdf fs-5"></i>
                        </Button>

                        {/* EDITAR */}

                        <Button
                          variant="link"
                          className="text-warning p-1"
                          onClick={() => {
                            setVentaSeleccionada(v);
                            setShowEditar(true);
                          }}
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </Button>

                        {/* ELIMINAR */}

                        <Button
                          variant="link"
                          className="text-danger p-1"
                          onClick={() => {
                            setVentaSeleccionada(v);
                            setShowEliminar(true);
                          }}
                        >
                          <i className="bi bi-trash3 fs-5"></i>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* FOOTER */}

              <tfoot className="table-light fw-bold">
                <tr>
                  <td colSpan="6" className="text-end">
                    TOTAL GENERAL:
                  </td>

                  <td className="text-success">
                    C${" "}
                    {totalCalculado.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </td>

                  <td></td>

                  <td></td>
                </tr>
              </tfoot>
            </Table>
          </div>

          {/* ==================== MOBILE ==================== */}

          <div className="d-block d-md-none">
            {ventasPaginadas.map((v, index) => (
              <TarjetaVenta
                key={v.id_venta}
                v={v}
                index={index}
                setShowEditar={setShowEditar}
                setShowEliminar={setShowEliminar}
                setVentaSeleccionada={setVentaSeleccionada}
                generarPDFIndividual={generarPDFIndividual}
                imprimirTicketRawbt={imprimirTicketRawbt}
              />
            ))}
          </div>

          <Paginacion
            registrosPorPagina={registrosPorPagina}
            totalRegistros={ventasFiltradas.length}
            paginaActual={paginaActual}
            establecerPaginaActual={establecerPaginaActual}
            establecerRegistrosPorPagina={establecerRegistrosPorPagina}
          />
        </Col>
      </Row>

      {/* ==================== MODALES ==================== */}

      <ModalEliminarVenta
        show={showEliminar}
        onHide={() => setShowEliminar(false)}
        ventaSeleccionada={ventaSeleccionada}
        eliminarVenta={manejarEliminarVenta}
      />

      <ModalEdicionVenta
        show={showEditar}
        onHide={() => setShowEditar(false)}
        ventaSeleccionada={ventaSeleccionada}
        setVentaSeleccionada={setVentaSeleccionada}
        actualizarVenta={manejarActualizarVenta}
      />

      {/* CHAT IA */}

      <ChatIA
        mostrarChatModal={mostrarChatModal}
        setMostrarChatModal={setMostrarChatModal}
      />

      {/* DASHBOARD VENTAS */}
      <ModalDashboardVentas
        mostrar={mostrarDashboard}
        manejarCerrar={() => setMostrarDashboard(false)}
        ventas={ventas}
      />

      {/* TOAST */}

      <NotificacionOperacion
        {...toast}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false,
          })
        }
      />
    </Container>
  );
};

export default Ventas;
