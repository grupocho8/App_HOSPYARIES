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

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Ventas = () => {
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

  // ==================== CARGAR DATOS ====================

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const { data: resData } = await supabase.from("reservaciones").select(`
          id_reservacion,
          clientes (
            nombre,
            apellido
          ),
          habitaciones (
            numero,
            tipo
          )
        `);

      const { data: empData } = await supabase.from("empleados").select(`
          id_empleado,
          nombre,
          tipo_turno
        `);

      const { data: ventasData } = await supabase
        .from("ventas")
        .select(
          `
          id_venta,
          monto,
          fecha,

          reservaciones (
            clientes (
              nombre,
              apellido
            ),

            habitaciones (
              numero,
              tipo
            )
          ),

          empleados (
            nombre,
            tipo_turno
          )
        `,
        )
        .order("fecha", { ascending: false });

      setReservaciones(resData || []);
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

      const empleado = v.empleados?.nombre?.toLowerCase() || "";

      return (
        cliente.includes(query) ||
        habitacion.includes(query) ||
        empleado.includes(query)
      );
    });

    setVentasFiltradas(filtradas);
  }, [textoBusqueda, ventas]);

  // ==================== PDF INDIVIDUAL ====================

  const generarPDFIndividual = (v) => {
    const doc = new jsPDF();

    const clienteNombre = `${v.reservaciones?.clientes?.nombre || "N/A"} ${v.reservaciones?.clientes?.apellido || ""}`;

    doc.setFillColor(44, 108, 98);

    doc.rect(0, 0, 220, 30, "F");

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(20);

    doc.text("Comprobante de Venta", 105, 18, { align: "center" });

    doc.setTextColor(0, 0, 0);

    doc.setFontSize(12);

    doc.text(`Cliente: ${clienteNombre}`, 20, 50);

    doc.text(`Habitación: ${v.reservaciones?.habitaciones?.numero}`, 20, 60);

    doc.text(`Tipo: ${v.reservaciones?.habitaciones?.tipo}`, 20, 70);

    doc.text(`Empleado: ${v.empleados?.nombre}`, 20, 80);

    doc.text(
      `Turno: ${v.empleados?.tipo_turno === "dia" ? "Día" : "Noche"}`,
      20,
      90,
    );

    doc.text(`Monto: C$ ${parseFloat(v.monto).toFixed(2)}`, 20, 100);

    doc.text(
      `Fecha: ${v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F"}`,
      20,
      110,
    );

    doc.save(`Venta_${clienteNombre}.pdf`);
  };

  // ==================== PDF GENERAL ====================

  const generarPDFVentas = () => {
    const doc = new jsPDF();

    // ==================== ENCABEZADO ====================

    doc.setFillColor(44, 108, 98);

    doc.rect(0, 0, 220, 30, "F");

    doc.setTextColor(255, 255, 255);

    doc.setFontSize(22);

    doc.text(
      "Reporte de Ventas - Hotel 2 Aries",
      doc.internal.pageSize.getWidth() / 2,
      18,
      { align: "center" },
    );

    // ==================== FECHA ====================

    doc.setTextColor(90);

    doc.setFontSize(11);

    doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 40);

    // ==================== COLUMNAS ====================

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

    // ==================== FILAS ====================

    const filas = ventasFiltradas.map((v, index) => [
      index + 1,

      `${v.reservaciones?.clientes?.nombre || ""} ${v.reservaciones?.clientes?.apellido || ""}`,

      v.reservaciones?.habitaciones?.numero || "—",

      v.reservaciones?.habitaciones?.tipo || "—",

      v.empleados?.nombre || "—",

      v.empleados?.tipo_turno === "dia" ? "Día" : "Noche",

      `C$ ${parseFloat(v.monto || 0).toFixed(2)}`,

      v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F",
    ]);

    // ==================== TABLA ====================

    autoTable(doc, {
      head: [columnas],

      body: filas,

      startY: 50,

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
        // TOTAL GENERAL

        doc.setFontSize(11);

        doc.setTextColor(44, 108, 98);

        doc.text(
          `Total General: C$ ${totalCalculado.toLocaleString("en-US", {
            minimumFractionDigits: 2,
          })}`,
          14,
          doc.internal.pageSize.getHeight() - 10,
        );
      },
    });

    // ==================== GUARDAR ====================

    const fecha = new Date().toISOString().split("T")[0];

    doc.save(`Reporte_Ventas_${fecha}.pdf`);
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
                  ventasFiltradas.map((v, index) => (
                    <tr key={v.id_venta}>
                      {/* ID */}

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

                      <td>{v.empleados?.nombre}</td>

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
            {ventasFiltradas.map((v, index) => (
              <TarjetaVenta
                key={v.id_venta}
                v={v}
                index={index}
                setShowEditar={setShowEditar}
                setShowEliminar={setShowEliminar}
                setVentaSeleccionada={setVentaSeleccionada}
                generarPDFIndividual={generarPDFIndividual}
              />
            ))}
          </div>
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
