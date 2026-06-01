import React, { useState, useMemo } from "react";
import { Modal, Form, Row, Col, Card, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";

const ModalDashboardVentas = ({ mostrar, manejarCerrar, ventas }) => {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
  
  // Opción rápida de filtro
  const [rango, setRango] = useState("mes");
  const [fechaDesde, setFechaDesde] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-CA")
  );
  const [fechaHasta, setFechaHasta] = useState(hoy);

  const manejarCambioRango = (e) => {
    const val = e.target.value;
    setRango(val);
    const dateHoy = new Date();
    
    if (val === "hoy") {
      setFechaDesde(hoy);
      setFechaHasta(hoy);
    } else if (val === "mes") {
      const primero = new Date(dateHoy.getFullYear(), dateHoy.getMonth(), 1);
      setFechaDesde(primero.toLocaleDateString("en-CA"));
      setFechaHasta(hoy);
    } else if (val === "historico") {
      setFechaDesde("2020-01-01");
      setFechaHasta(hoy);
    }
  };

  // Procesamiento de datos memorizado
  const { datosFiltrados, estadisticas, chartData } = useMemo(() => {
    if (!ventas) return { datosFiltrados: [], estadisticas: {}, chartData: [] };

    const inicio = new Date(`${fechaDesde}T00:00:00`);
    const fin = new Date(`${fechaHasta}T23:59:59`);

    const filtrados = ventas.filter((v) => {
      const f = new Date(v.fecha);
      return f >= inicio && f <= fin;
    });

    let totalIngresos = 0;
    const ingresosTurno = { dia: 0, noche: 0 };
    
    const turnosData = {
      dia: { name: "Día", activa: 0, cancelada: 0, finalizada: 0, total: 0 },
      noche: { name: "Noche", activa: 0, cancelada: 0, finalizada: 0, total: 0 }
    };

    filtrados.forEach((v) => {
      const monto = parseFloat(v.monto) || 0;
      totalIngresos += monto;

      const turno = v.empleados?.tipo_turno?.toLowerCase() === "dia" ? "dia" : "noche";
      const estado = v.reservaciones?.estado?.toLowerCase() || "desconocido";
      
      ingresosTurno[turno] += monto;
      
      if (estado === "activa" || estado === "cancelada" || estado === "finalizada") {
        turnosData[turno][estado] += monto;
      } else {
        turnosData[turno]["finalizada"] += monto;
      }
      turnosData[turno].total += monto;
    });

    const turnoLider = ingresosTurno.dia >= ingresosTurno.noche ? "Día" : "Noche";
    const montoTurnoLider = Math.max(ingresosTurno.dia, ingresosTurno.noche);
    
    const ingresosActivos = 
      turnosData.dia.activa + turnosData.dia.finalizada + 
      turnosData.noche.activa + turnosData.noche.finalizada;

    const perdidaCanceladas = 
      turnosData.dia.cancelada + turnosData.noche.cancelada;

    const totalReservas = filtrados.length;
    const reservasOcupadas = filtrados.filter(
        v => ['activa', 'finalizada'].includes(v.reservaciones?.estado?.toLowerCase())
    ).length;
    const nivelOcupacion = totalReservas > 0 ? ((reservasOcupadas / totalReservas) * 100).toFixed(0) : 0;

    return {
      datosFiltrados: filtrados,
      estadisticas: {
        totalIngresos,
        turnoLider,
        montoTurnoLider,
        nivelOcupacion,
        ingresosActivos,
        perdidaCanceladas
      },
      chartData: [turnosData.dia, turnosData.noche]
    };
  }, [ventas, fechaDesde, fechaHasta]);

  const descargarExcel = () => {
    const dataExcel = datosFiltrados.map((v) => ({
      ID_Venta: v.id_venta,
      Fecha: new Date(v.fecha).toLocaleDateString(),
      Cliente: `${v.reservaciones?.clientes?.nombre || ''} ${v.reservaciones?.clientes?.apellido || ''}`.trim(),
      Habitacion: v.reservaciones?.habitaciones?.numero,
      Tipo_Habitacion: v.reservaciones?.habitaciones?.tipo,
      Estado_Reserva: v.reservaciones?.estado,
      Empleado: `${v.empleados?.nombre_empleado || ''} ${v.empleados?.apellido_empleado || ''}`.trim(),
      Turno: v.empleados?.tipo_turno === "dia" ? "Día" : "Noche",
      Monto_CS: parseFloat(v.monto).toFixed(2),
    }));

    const ws = XLSX.utils.json_to_sheet(dataExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Ventas");
    XLSX.writeFile(wb, `Reporte_Ingresos_Turnos_${fechaDesde}_al_${fechaHasta}.xlsx`);
  };

  return (
    <Modal show={mostrar} onHide={manejarCerrar} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold w-100 text-center fs-3">
          Comparativa de Ingresos por Turno
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3">
        {/* Filtros */}
        <Row className="mb-4 align-items-end g-3">
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Período</Form.Label>
              <Form.Select value={rango} onChange={manejarCambioRango} className="shadow-sm border-0">
                <option value="hoy">Hoy</option>
                <option value="mes">Mes Actual</option>
                <option value="historico">Histórico</option>
                <option value="personalizado">Personalizado</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Desde</Form.Label>
              <Form.Control
                type="date"
                value={fechaDesde}
                onChange={(e) => { setFechaDesde(e.target.value); setRango("personalizado"); }}
                className="shadow-sm border-0"
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label className="small fw-bold text-muted">Hasta</Form.Label>
              <Form.Control
                type="date"
                value={fechaHasta}
                onChange={(e) => { setFechaHasta(e.target.value); setRango("personalizado"); }}
                className="shadow-sm border-0"
              />
            </Form.Group>
          </Col>
          <Col md={3} className="text-md-end">
            <Button variant="success" onClick={descargarExcel} className="shadow-sm w-100 w-md-auto">
              <i className="bi bi-file-earmark-excel me-2"></i> Exportar a Excel
            </Button>
          </Col>
        </Row>

        {/* KPIs Superiores */}
        <Row className="g-3 mb-4">
          <Col xs={6} md={4} lg>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center px-2 py-3">
                <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Ingreso Total General</h6>
                <h4 className="fw-bold mb-0">C${estadisticas.totalIngresos?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={4} lg>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center px-2 py-3">
                <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Turno Líder</h6>
                <div className="d-flex justify-content-center align-items-center gap-1">
                    <span className="fw-bold text-muted small">{estadisticas.turnoLider}</span>
                    <h4 className="fw-bold text-success mb-0">C${estadisticas.montoTurnoLider?.toLocaleString('en-US')}</h4>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={4} lg>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center px-2 py-3">
                <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Nivel de Ocupación</h6>
                <h4 className="fw-bold text-primary mb-0">{estadisticas.nivelOcupacion}%</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={6} md={6} lg>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center px-2 py-3">
                <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Ingresos Activos</h6>
                <h4 className="fw-bold text-info mb-0">C${estadisticas.ingresosActivos?.toLocaleString('en-US')}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} md={6} lg>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center px-2 py-3">
                <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Pérdida (Canceladas)</h6>
                <h4 className="fw-bold text-danger mb-0">C${estadisticas.perdidaCanceladas?.toLocaleString('en-US')}</h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Gráfico */}
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div style={{ width: "100%", height: 350 }}>
              <ResponsiveContainer>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `C$${val}`} />
                  <Tooltip formatter={(value, name) => [`C$ ${value}`, name.charAt(0).toUpperCase() + name.slice(1)]} cursor={{fill: 'transparent'}} />
                  <Legend iconType="square" wrapperStyle={{ paddingTop: "20px" }} />
                  <Bar dataKey="finalizada" stackId="a" fill="#5cb85c" name="Finalizada" />
                  <Bar dataKey="cancelada" stackId="a" fill="#d9534f" name="Cancelada" />
                  <Bar dataKey="activa" stackId="a" fill="#428bca" name="Activa" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Modal.Body>
    </Modal>
  );
};

export default ModalDashboardVentas;
