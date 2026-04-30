import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Button } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import NotificacionOperacion from "../components/NotificacionOperacion";

// IMPORTACIONES DE COMPONENTES SIGUIENDO EL ESTÁNDAR
import FormularioVenta from "../components/ventas/FormularioVenta";

import ModalEdicionVenta from "../components/ventas/ModalEdicionVenta";
import ModalEliminarVenta from "../components/ventas/ModalEliminarVenta";

const Ventas = () => {
  const [ventas, setVentas] = useState([]);
  const [reservaciones, setReservaciones] = useState([]);
  const [turnos, setTurnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });
  // Estados para Modales
  const [showEditar, setShowEditar] = useState(false);
  const [showEliminar, setShowEliminar] = useState(false);
  const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

  const [nuevaVenta, setNuevaVenta] = useState({ id_reservacion: "", id_turno: "", monto: "" });

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { data: resData } = await supabase.from("reservaciones").select("id_reservacion, clientes(nombre), habitaciones(numero)");
      const { data: turnosData } = await supabase.from("turnos").select("id_turno, tipo_turno, empleados(nombre)");
      const { data: ventasData } = await supabase.from("ventas").select(`
          id_venta, monto, fecha,
          reservaciones (clientes (nombre), habitaciones (numero)),
          turnos (tipo_turno, empleados (nombre))
        `).order("fecha", { ascending: false });

      setReservaciones(resData || []);
      setTurnos(turnosData || []);
      setVentas(ventasData || []);
    } catch (error) { console.error(error); } finally { setCargando(false); }
  };

  const agregarVenta = async () => {
    try {
      const { error } = await supabase.from("ventas").insert([{
        id_venta: crypto.randomUUID(),
        id_reservacion: nuevaVenta.id_reservacion,
        id_turno: nuevaVenta.id_turno,
        monto: parseFloat(nuevaVenta.monto),
        fecha: new Date().toISOString()
      }]);
      if (error) throw error;
      setToast({ mostrar: true, mensaje: "Venta registrada", tipo: "exito" });
      setNuevaVenta({ id_reservacion: "", id_turno: "", monto: "" });
      cargarDatos();
    } catch (err) { setToast({ mostrar: true, mensaje: "Error", tipo: "error" }); }
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
        <Col lg={3}>
          <FormularioVenta
            nuevaVenta={nuevaVenta}
            setNuevaVenta={setNuevaVenta}
            agregarVenta={agregarVenta}
            reservaciones={reservaciones}
            turnos={turnos}
          />
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body className="d-flex justify-content-between align-items-center">
              <span className="fw-bold text-muted">Total:</span>
              <h4 className="fw-bold mb-0 text-primary">
                C$ {ventas.reduce((acc, v) => acc + parseFloat(v.monto || 0), 0).toFixed(2)}
              </h4>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <div className="bg-white p-3 rounded shadow-sm border">
            <Table hover className="align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-uppercase text-muted">
                  <th>ID</th>
                  <th>CLIENTE</th>
                  <th>HAB</th>
                  <th>EMPLEADO</th>
                  <th>TURNO</th>
                  <th>MONTO</th>
                  <th>FECHA</th>
                  <th className="text-center">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="small">
                {cargando ? (
                  <tr><td colSpan="8" className="text-center py-4"><Spinner animation="border" size="sm" variant="primary" /></td></tr>
                ) : (
                  ventas.map((v) => (
                    <tr key={v.id_venta}>
                      <td className="text-muted">{v.id_venta.substring(0, 5)}</td>
                      <td>{v.reservaciones?.clientes?.nombre}</td>
                      <td>{v.reservaciones?.habitaciones?.numero}</td>
                      <td>{v.turnos?.empleados?.nombre}</td>
                      <td>{v.turnos?.tipo_turno}</td>
                      <td className="fw-bold">C$ {parseFloat(v.monto).toFixed(2)}</td>
                      <td className="text-muted">{new Date(v.fecha).toLocaleDateString()}</td>
                      <td className="text-center">
                        {/* Botones de acción siguiendo el estilo de la tabla de clientes */}
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          className="me-2 border-1"
                          onClick={() => { setVentaSeleccionada(v); setShowEditar(true); }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="border-1"
                          onClick={() => { setVentaSeleccionada(v); setShowEliminar(true); }}
                        >
                          <i className="bi bi-trash"></i>
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

      {/* Modales de Operación */}
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