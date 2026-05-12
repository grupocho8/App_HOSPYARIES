import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Spinner, Card, Badge } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import FormularioVenta from "../components/ventas/FormularioVenta";
import ModalEdicionVenta from "../components/ventas/ModalEdicionVenta";
import ModalEliminarVenta from "../components/ventas/ModalEliminarVenta";
import ChatIA from "../components/chat/ChatIA"; // <--- IMPORTACIÓN DE IA
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TarjetaVenta from "../components/ventas/TarjetaVenta";

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

  // ==================== PDF ====================

  const generarPDFVentas = () => {
    const doc = new jsPDF();

    doc.setFillColor(44, 108, 98);
    doc.rect(0, 0, 220, 30, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);

    doc.text(
      "Reporte de Ventas - HospyAries",
      doc.internal.pageSize.getWidth() / 2,
      18,
      { align: "center" }
    );

    const columnas = [
      "#",
      "Cliente",
      "Hab.",
      "Empleado",
      "Turno",
      "Monto",
      "Fecha",
    ];

    const filas = ventasFiltradas.map((v, index) => [
      index + 1,
      v.reservaciones?.clientes?.nombre || "N/A",
      v.reservaciones?.habitaciones?.numero || "—",
      v.empleados?.nombre || "N/A",
      v.empleados?.tipo_turno === "dia" ? "Día" : "Noche",
      `C$ ${parseFloat(v.monto || 0).toFixed(2)}`,
      v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F",
    ]);

    const totalVentas = ventasFiltradas.reduce(
      (acc, v) => acc + parseFloat(v.monto || 0),
      0
    );

    autoTable(doc, {
      head: [columnas],
      body: filas,
      startY: 40,
      theme: "grid",
      headStyles: { fillColor: [44, 108, 98] },
      styles: { fontSize: 9 },

      didDrawPage: (data) => {
        const str = "Página " + doc.internal.getNumberOfPages();

        doc.setFontSize(10);
        doc.setTextColor(40);

        doc.text(
          str,
          data.settings.margin.left,
          doc.internal.pageSize.getHeight() - 10
        );

        doc.text(
          `Total Reportado: C$ ${totalVentas.toFixed(2)}`,
          140,
          doc.internal.pageSize.getHeight() - 10
        );
      },
    });

    const fecha = new Date().toISOString().split("T")[0];

    doc.save(`Reporte_Ventas_${fecha}.pdf`);
  };

  // ==================== BÚSQUEDA ====================

  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const texto = textoBusqueda.toLowerCase();

      const filtradas = ventas.filter(
        (v) =>
          v.reservaciones?.clientes?.nombre
            ?.toLowerCase()
            .includes(texto) ||
          v.reservaciones?.habitaciones?.numero
            ?.toString()
            .toLowerCase()
            .includes(texto) ||
          v.empleados?.nombre?.toLowerCase().includes(texto) ||
          v.empleados?.tipo_turno?.toLowerCase().includes(texto)
      );

      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

  // ==================== CARGAR DATOS ====================

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const { data: resData } = await supabase
        .from("reservaciones")
        .select("id_reservacion, clientes(nombre), habitaciones(numero)");

      const { data: empData } = await supabase
        .from("empleados")
        .select("id_empleado, nombre, tipo_turno");

      const { data: ventasData } = await supabase
        .from("ventas")
        .select(`
          id_venta,
          monto,
          fecha,
          reservaciones (
            clientes (nombre),
            habitaciones (numero)
          ),
          empleados (
            nombre,
            tipo_turno
          )
        `)
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

  // ==================== AGREGAR ====================

  const agregarVenta = async () => {
    try {
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
        mensaje: "Venta registrada",
        tipo: "exito",
      });

      setNuevaVenta({
        id_reservacion: "",
        id_empleado: "",
        monto: "",
      });

      cargarDatos();
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error",
        tipo: "error",
      });
    }
  };

  // ==================== ACTUALIZAR ====================

  const actualizarVenta = async () => {
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
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error al actualizar",
        tipo: "error",
      });
    }
  };

  // ==================== ELIMINAR ====================

  const eliminarVenta = async () => {
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
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: "Error al eliminar",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <Container fluid className="mt-5 px-4">
      <Row>
        {/* PANEL IZQUIERDO */}
        <Col lg={3}>
          <FormularioVenta
            nuevaVenta={nuevaVenta}
            setNuevaVenta={setNuevaVenta}
            agregarVenta={agregarVenta}
            reservaciones={reservaciones}
            empleados={empleados}
          />

          <Card
            className="border-0 shadow-sm mt-3"
            style={{ borderRadius: "12px" }}
          >
            <Card.Body className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-muted">Total General:</span>

              <h4
                className="fw-bold mb-0"
                style={{ color: "#1a9a69" }}
              >
                C${" "}
                {ventasFiltradas
                  .reduce(
                    (acc, v) => acc + parseFloat(v.monto || 0),
                    0
                  )
                  .toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
              </h4>
            </Card.Body>
          </Card>

          <Button
            variant="outline-danger"
            className="w-100 mt-3 shadow-sm"
            style={{ padding: "10px" }}
            onClick={generarPDFVentas}
          >
            <i className="bi bi-file-earmark-pdf me-2"></i>
            Descargar Reporte PDF
          </Button>

          <Button
            className="w-100 mt-3 border-0"
            style={{
              backgroundColor: "#2c6c62",
              padding: "10px",
            }}
            onClick={() => setMostrarChatModal(true)}
          >
            <i className="bi bi-robot me-2"></i>
            Consultar con IA
          </Button>
        </Col>

        {/* PANEL DERECHO */}
        <Col lg={9}>
          <Row className="my-4">
            <Col md={6}>
              <CuadroBusquedas
                textoBusqueda={textoBusqueda}
                manejarCambioBusqueda={manejarBusqueda}
              />
            </Col>
          </Row>

          {/* ==================== TABLA PC ==================== */}

          <div
            className="bg-white p-0 rounded shadow-sm border overflow-hidden d-none d-md-block"
            style={{ borderRadius: "12px" }}
          >
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr
                  className="small text-uppercase text-muted"
                  style={{ fontSize: "0.75rem" }}
                >
                  <th className="ps-3">ID</th>
                  <th>CLIENTE</th>
                  <th className="text-center">HAB</th>
                  <th>EMPLEADO</th>
                  <th>TURNO</th>
                  <th>MONTO</th>
                  <th>FECHA</th>
                  <th className="text-center">ACCIONES</th>
                </tr>
              </thead>

              <tbody className="small">
                {cargando ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <Spinner
                        animation="border"
                        variant="primary"
                        size="sm"
                        className="me-2"
                      />

                      <span className="text-muted">
                        Cargando registros...
                      </span>
                    </td>
                  </tr>
                ) : ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No se encontraron ventas registradas.
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((v, index) => (
                    <tr key={v.id_venta || index}>
                      <td className="ps-3 fw-bold text-muted">
                        {index + 1}
                      </td>

                      <td className="fw-semibold">
                        {v.reservaciones?.clientes?.nombre || "N/A"}
                      </td>

                      <td className="text-center">
                        <Badge
                          bg="light"
                          text="dark"
                          className="border"
                        >
                          {v.reservaciones?.habitaciones?.numero || "—"}
                        </Badge>
                      </td>

                      <td>{v.empleados?.nombre || "No asignado"}</td>

                  <td>
                 <span
                className="badge px-3 py-2"
                style={{
                  backgroundColor:
                    v.empleados?.tipo_turno === "dia"
                      ? "#59cbcb"
                      : "#faec8e",

                  color:
                    v.empleados?.tipo_turno === "dia"
                      ? "#065f46"
                      : "#991b1b",

                  borderRadius: "10px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                {v.empleados?.tipo_turno === "dia"
                  ? "🌞 Día"
                  : "🌙 Noche"}
              </span>
             </td>

                      <td className="fw-bold text-success">
                        C$ {parseFloat(v.monto || 0).toFixed(2)}
                      </td>

                      <td className="text-muted">
                        {v.fecha
                          ? new Date(v.fecha).toLocaleDateString()
                          : "S/F"}
                      </td>

                      <td className="text-center">
                        <Button
                          variant="link"
                          className="text-warning p-1 me-2"
                          onClick={() => {
                            setVentaSeleccionada(v);
                            setShowEditar(true);
                          }}
                        >
                          <i className="bi bi-pencil-square fs-5"></i>
                        </Button>

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
            </Table>
          </div>

          {/* ==================== TARJETAS MOBILE ==================== */}

          <div className="d-block d-md-none">
            {cargando ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : ventasFiltradas.length === 0 ? (
              <div className="text-center text-muted py-5">
                No hay ventas registradas
              </div>
            ) : (
              ventasFiltradas.map((v, index) => (
                <TarjetaVenta
                  key={v.id_venta || index}
                  v={v}
                  index={index}
                  setVentaSeleccionada={setVentaSeleccionada}
                  setShowEditar={setShowEditar}
                  setShowEliminar={setShowEliminar}
                />
              ))
            )}
          </div>
        </Col>
      </Row>

      {/* ==================== MODALES ==================== */}

      <ModalEdicionVenta
        show={showEditar}
        onHide={() => setShowEditar(false)}
        ventaSeleccionada={ventaSeleccionada}
        setVentaSeleccionada={setVentaSeleccionada}
        actualizarVenta={actualizarVenta}
      />

      <ModalEliminarVenta
        show={showEliminar}
        onHide={() => setShowEliminar(false)}
        ventaSeleccionada={ventaSeleccionada}
        eliminarVenta={eliminarVenta}
      />

      <NotificacionOperacion
        {...toast}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false,
          })
        }
      />

      <ChatIA
        mostrarChatModal={mostrarChatModal}
        setMostrarChatModal={setMostrarChatModal}
      />
    </Container>
  );
};

export default Ventas;

