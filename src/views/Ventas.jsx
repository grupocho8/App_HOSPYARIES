import React, { useEffect, useState } from "react";
import { Container, Row, Col, Table, Button, Spinner, Card, Badge } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

// COMPONENTES
import FormularioVenta from "../components/ventas/FormularioVenta";
import ModalEdicionVenta from "../components/ventas/ModalEdicionVenta";
import ModalEliminarVenta from "../components/ventas/ModalEliminarVenta";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [ventasFiltradas, setVentasFiltradas] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const [showEditar, setShowEditar] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [nuevaVenta, setNuevaVenta] = useState({ 
    id_reservacion: "", 
    id_empleado: "", 
    monto: "" 
  });

  // ==================== BÚSQUEDA ====================
  const manejarBusqueda = (e) => {
    setTextoBusqueda(e.target.value);
  };

  useEffect(() => {
    if (!textoBusqueda.trim()) {
      setVentasFiltradas(ventas);
    } else {
      const texto = textoBusqueda.toLowerCase();

      const filtradas = ventas.filter((v) =>
        v.reservaciones?.clientes?.nombre?.toLowerCase().includes(texto) ||
        v.reservaciones?.habitaciones?.numero?.toString().toLowerCase().includes(texto) ||
        v.empleados?.nombre?.toLowerCase().includes(texto) ||
        v.empleados?.tipo_turno?.toLowerCase().includes(texto)
      );

      setVentasFiltradas(filtradas);
    }
  }, [textoBusqueda, ventas]);

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
          id_venta, monto, fecha,
          reservaciones (clientes (nombre), habitaciones (numero)),
          empleados (nombre, tipo_turno)
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

  const agregarVenta = async () => {
    try {
      const { error } = await supabase.from("ventas").insert([{
        id_venta: crypto.randomUUID(),
        id_reservacion: nuevaVenta.id_reservacion,
        id_empleado: nuevaVenta.id_empleado,
        monto: parseFloat(nuevaVenta.monto),
        fecha: new Date().toISOString()
      }]);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Venta registrada", tipo: "exito" });

      setNuevaVenta({ id_reservacion: "", id_empleado: "", monto: "" });

      cargarDatos();

    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error", tipo: "error" });
    }
  };

  const actualizarVenta = async () => {
    try {
      const { error } = await supabase
        .from("ventas")
        .update({ monto: parseFloat(ventaSeleccionada.monto) })
        .eq("id_venta", ventaSeleccionada.id_venta);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Venta actualizada", tipo: "exito" });
      setShowEditar(false);
      cargarDatos();

    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al actualizar", tipo: "error" });
    }
  };

  const eliminarVenta = async () => {
    try {
      const { error } = await supabase
        .from("ventas")
        .delete()
        .eq("id_venta", ventaSeleccionada.id_venta);

      if (error) throw error;

      setToast({ mostrar: true, mensaje: "Venta eliminada", tipo: "exito" });
      setShowEliminar(false);
      cargarDatos();

    } catch (err) {
      setToast({ mostrar: true, mensaje: "Error al eliminar", tipo: "error" });
    }
  };

  useEffect(() => { cargarDatos(); }, []);

return (
  <Container fluid className="mt-5 px-4">
    <Row>
      {/* PANEL IZQUIERDO: FORMULARIO Y TOTAL */}
      <Col lg={3}>
        <FormularioVenta
          nuevaVenta={nuevaVenta}
          setNuevaVenta={setNuevaVenta}
          agregarVenta={agregarVenta}
          reservaciones={reservaciones}
          empleados={empleados}
        />

        <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: "12px" }}>
          <Card.Body className="d-flex justify-content-between align-items-center">
            <span className="fw-bold text-muted">Total General:</span>
            <h4 className="fw-bold mb-0" style={{ color: "#0d6efd" }}>
              C$ {ventasFiltradas.reduce((acc, v) => acc + parseFloat(v.monto || 0), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </h4>
          </Card.Body>
        </Card>
      </Col>

      {/* PANEL DERECHO: BUSCADOR Y TABLA */}
      <Col lg={9}>
        <Row className="mb-3">
          <Col md={6}>
            <CuadroBusquedas
              textoBusqueda={textoBusqueda}
              manejarCambioBusqueda={manejarBusqueda}
            />
          </Col>
        </Row>

        <div className="bg-white p-0 rounded shadow-sm border overflow-hidden" style={{ borderRadius: "12px" }}>
          <Table hover responsive className="align-middle mb-0">
            <thead className="table-light">
              <tr className="small text-uppercase text-muted" style={{ fontSize: "0.75rem" }}>
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
                    <Spinner animation="border" variant="primary" size="sm" className="me-2" />
                    <span className="text-muted">Cargando registros...</span>
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
                    {/* 1. ID ASCENDENTE (Basado en el índice) */}
                    <td className="ps-3 fw-bold text-muted">{index + 1}</td>

                    {/* 2. CLIENTE (Validación de relación) */}
                    <td className="fw-semibold">
                      {v.reservaciones?.clientes?.nombre || v.cliente_nombre || "N/A"}
                    </td>

                    {/* 3. HABITACIÓN */}
                    <td className="text-center">
                      <Badge bg="light" text="dark" className="border">
                        {v.reservaciones?.habitaciones?.numero || v.habitacion_numero || "—"}
                      </Badge>
                    </td>

                    {/* 4. EMPLEADO */}
                    <td>{v.empleados?.nombre || "No asignado"}</td>

                    {/* 5. TURNO (Lógica simplificada) */}
                    <td>
                      <span className={`badge ${v.empleados?.tipo_turno === "dia" ? "bg-info-subtle text-info" : "bg-dark-subtle text-dark"}`}>
                        {v.empleados?.tipo_turno === "dia" ? "Dia" : "Noche"}
                      </span>
                    </td>

                    {/* 6. MONTO */}
                    <td className="fw-bold text-success">
                      C$ {parseFloat(v.monto || 0).toFixed(2)}
                    </td>

                    {/* 7. FECHA */}
                    <td className="text-muted">
                      {v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F"}
                    </td>

                    {/* 8. ACCIONES */}
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
      </Col>
    </Row>

    {/* MODALES Y NOTIFICACIONES */}
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
      onCerrar={() => setToast({ ...toast, mostrar: false })}
    />
  </Container>
);
};

export default Ventas;
