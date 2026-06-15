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
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area
} from "recharts";
import * as XLSX from "xlsx";

const ModalDashboardVentas = ({ mostrar, manejarCerrar, ventas }) => {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
  
  // Estado para la navegación interna entre tableros (0: Turnos, 1: Fidelidad, 2: Tendencias Financieras)
  const [vistaActual, setVistaActual] = useState(0);
  const totalVistas = 3;

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

  const irVistaAnterior = () => {
    setVistaActual((prev) => (prev === 0 ? totalVistas - 1 : prev - 1));
  };

  const irVistaSiguiente = () => {
    setVistaActual((prev) => (prev === totalVistas - 1 ? 0 : prev + 1));
  };

  // Procesamiento unificado de datos memorizado
  const datosProcesados = useMemo(() => {
    if (!ventas || ventas.length === 0) {
      return {
        datosFiltrados: [],
        estadisticas: {},
        chartTurnos: [],
        chartFidelidad: [],
        chartTendenciaDiaria: [],
        chartDiasSemana: []
      };
    }

    const inicio = new Date(`${fechaDesde}T00:00:00`);
    const fin = new Date(`${fechaHasta}T23:59:59`);

    const filtrados = ventas.filter((v) => {
      const f = new Date(v.fecha);
      return f >= inicio && f <= fin;
    });

    // --- PROCESAMIENTO MÓDULO 1: TURNOS Y OPERACIÓN ---
    let totalIngresos = 0;
    const ingresosTurno = { dia: 0, noche: 0 };
    const turnosData = {
      dia: { name: "Día", activa: 0, cancelada: 0, finalizada: 0, total: 0 },
      noche: { name: "Noche", activa: 0, cancelada: 0, finalizada: 0, total: 0 }
    };

    // --- PROCESAMIENTO MÓDULO 2: FIDELIDAD Y CLIENTES ---
    const mapaClientes = {};

    // --- PROCESAMIENTO MÓDULO 3: TENDENCIAS E INGRESOS ---
    const mapaFechas = {};
    const diasSemanaMap = {
      "Lunes": 0, "Martes": 0, "Miércoles": 0, "Jueves": 0, "Viernes": 0, "Sábado": 0, "Domingo": 0
    };

    filtrados.forEach((v) => {
      const monto = parseFloat(v.monto) || 0;
      totalIngresos += monto;

      // Turnos
      const turno = v.empleados?.tipo_turno?.toLowerCase() === "dia" ? "dia" : "noche";
      const estado = v.reservaciones?.estado?.toLowerCase() || "desconocido";
      ingresosTurno[turno] += monto;
      
      if (["activa", "cancelada", "finalizada"].includes(estado)) {
        turnosData[turno][estado] += monto;
      } else {
        turnosData[turno]["finalizada"] += monto;
      }
      turnosData[turno].total += monto;

      // Clientes & Fidelidad
      const clienteId = v.reservaciones?.clientes?.id_cliente || `anon-${Math.random()}`;
      const nombreCompleto = `${v.reservaciones?.clientes?.nombre || 'Huésped'} ${v.reservaciones?.clientes?.apellido || ''}`.trim();
      if (!mapaClientes[clienteId]) {
        mapaClientes[clienteId] = { name: nombreCompleto, totalMonto: 0, visitas: 0 };
      }
      mapaClientes[clienteId].totalMonto += monto;
      mapaClientes[clienteId].visitas += 1;

      // Tendencia e Ingresos Diarios
      const fechaStr = new Date(v.fecha).toISOString().split('T')[0];
      mapaFechas[fechaStr] = (mapaFechas[fechaStr] || 0) + monto;

      // Días de la semana
      const opciones = { weekday: 'long', timeZone: 'America/Managua' };
      let diaNombre = new Date(v.fecha).toLocaleDateString('es-NI', opciones);
      diaNombre = diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1);
      if (diasSemanaMap[diaNombre] !== undefined) {
        diasSemanaMap[diaNombre] += monto;
      }
    });

    // Mapeo Módulo Turnos
    const turnoLider = ingresosTurno.dia >= ingresosTurno.noche ? "Día" : "Noche";
    const montoTurnoLider = Math.max(ingresosTurno.dia, ingresosTurno.noche);
    const ingresosActivos = turnosData.dia.activa + turnosData.dia.finalizada + turnosData.noche.activa + turnosData.noche.finalizada;
    const perdidaCanceladas = turnosData.dia.cancelada + turnosData.noche.cancelada;
    const totalReservas = filtrados.length;
    const reservasOcupadas = filtrados.filter(v => ['activa', 'finalizada'].includes(v.reservaciones?.estado?.toLowerCase())).length;
    const nivelOcupacion = totalReservas > 0 ? ((reservasOcupadas / totalReservas) * 100).toFixed(0) : 0;

    // Mapeo Módulo Fidelidad
    const listadoClientesFidelidad = Object.values(mapaClientes);
    const totalClientesUnicos = listadoClientesFidelidad.length;
    const promedioMontoPorCliente = totalClientesUnicos > 0 ? totalIngresos / totalClientesUnicos : 0;
    const totalVisitas = listadoClientesFidelidad.reduce((acc, curr) => acc + curr.visitas, 0);
    const promedioVisitasPorCliente = totalClientesUnicos > 0 ? (totalVisitas / totalClientesUnicos).toFixed(1) : 0;
    
    // Segmentación y cálculo de clientes en riesgo de abandono (aquellos con solo 1 visita histórica)
    const clientesEnRiesgo = listadoClientesFidelidad.filter(c => c.visitas === 1).length;
    const chartFidelidad = listadoClientesFidelidad.map(c => ({
      x: c.visitas,
      y: c.totalMonto,
      z: 100,
      name: c.name,
      segmento: c.visitas > 2 ? "Plata (Recurrente)" : "Nuevo"
    }));

    // Mapeo Módulo Tendencias
    const chartTendenciaDiaria = Object.keys(mapaFechas).sort().map(f => ({
      fecha: f,
      monto: mapaFechas[f]
    }));

    const chartDiasSemana = Object.keys(diasSemanaMap).map(d => ({
      dia: d,
      monto: diasSemanaMap[d]
    })).sort((a, b) => b.monto - a.monto);

    const cantidadDias = chartTendenciaDiaria.length;
    const promedioIngresoDiario = cantidadDias > 0 ? totalIngresos / cantidadDias : 0;

    return {
      datosFiltrados: filtrados,
      estadisticas: {
        totalIngresos,
        turnoLider,
        montoTurnoLider,
        nivelOcupacion,
        ingresosActivos,
        perdidaCanceladas,
        promedioMontoPorCliente,
        promedioVisitasPorCliente,
        clientesEnRiesgo,
        promedioIngresoDiario
      },
      chartTurnos: [turnosData.dia, turnosData.noche],
      chartFidelidad,
      chartTendenciaDiaria,
      chartDiasSemana
    };
  }, [ventas, fechaDesde, fechaHasta]);

  const { datosFiltrados, estadisticas, chartTurnos, chartFidelidad, chartTendenciaDiaria, chartDiasSemana } = datosProcesados;

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
    XLSX.writeFile(wb, `Reporte_Analisis_Avanzado_${fechaDesde}_al_${fechaHasta}.xlsx`);
  };

  // Títulos dinámicos de las pantallas
  const titulosDashboard = [
    "Comparativa de Ingresos por Turno",
    "Análisis de Ganancias y Fidelización de Clientes",
    "Tendencias y Desviaciones de Ingresos Diarios"
  ];

  return (
    <Modal show={mostrar} onHide={manejarCerrar} size="xl" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <div className="w-100 d-flex justify-content-between align-items-center px-4 pt-2">
          {/* Flecha de Navegación Izquierda */}
          <Button variant="light" className="rounded-circle border shadow-sm px-2.5 py-1" onClick={irVistaAnterior}>
            <i className="bi bi-chevron-left fs-4 text-primary"></i>
          </Button>

          {/* Título Dinámico Principal */}
          <Modal.Title className="fw-bold text-center fs-3 flex-grow-1">
            {titulosDashboard[vistaActual]}
          </Modal.Title>

          {/* Flecha de Navegación Derecha */}
          <Button variant="light" className="rounded-circle border shadow-sm px-2.5 py-1" onClick={irVistaSiguiente}>
            <i className="bi bi-chevron-right fs-4 text-primary"></i>
          </Button>
        </div>
      </Modal.Header>
      
      <Modal.Body className="px-4 py-3">
        {/* Controles de Rango de Fecha comunes */}
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

        {/* --- RENDERING CONDICIONAL DE KPIS Y GRÁFICOS BASADO EN VISTA_ACTUAL --- */}
        
        {/* PANTALLA 1: COMPARATIVA DE TURNOS */}
        {vistaActual === 0 && (
          <>
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

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartTurnos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
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
          </>
        )}

        {/* PANTALLA 2: FIDELIZACIÓN DE CLIENTES */}
        {vistaActual === 1 && (
          <>
            <Row className="g-3 mb-4">
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Ingresos Totales</h6>
                    <h4 className="fw-bold text-success mb-0">C${estadisticas.totalIngresos?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Ingreso Promedio x Cliente</h6>
                    <h4 className="fw-bold text-primary mb-0">C${estadisticas.promedioMontoPorCliente?.toLocaleString('en-US', { maximumFractionDigits: 2 })}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Visitas Promedio por Cliente</h6>
                    <h4 className="fw-bold text-info mb-0">{estadisticas.promedioVisitasPorCliente}</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6} md={3}>
                <Card className="h-100 border-0 shadow-sm bg-light-danger">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Clientes en Riesgo (1 Sola Visita)</h6>
                    <h4 className="fw-bold text-danger mb-0">{estadisticas.clientesEnRiesgo}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h5 className="fw-bold text-muted mb-3 fs-5">Matriz de Ganancias por Cliente (Fidelidad)</h5>
                <div style={{ width: "100%", height: 350 }}>
                  <ResponsiveContainer>
                    <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="x" name="Visitas" label={{ value: 'Cantidad de Visitas', position: 'insideBottom', offset: -10 }} tickCount={5} />
                      <YAxis type="number" dataKey="y" name="Monto" label={{ value: 'Monto Total (C$)', angle: -90, position: 'insideLeft' }} tickFormatter={(v) => `C$${v}`} />
                      <ZAxis type="number" dataKey="z" range={[60, 100]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value, name, props) => {
                        if (name === "Monto") return [`C$ ${value}`, "Ingreso Acumulado"];
                        if (name === "Visitas") return [value, "Visitas Realizadas"];
                        return [value, name];
                      }} labelFormatter={() => ''} />
                      <Legend wrapperStyle={{ paddingTop: "10px" }} />
                      <Scatter name="Nuevos / Una Visión" data={chartFidelidad.filter(c => c.segmento === "Nuevo")} fill="#428bca" shape="circle" />
                      <Scatter name="Fieles / Recurrentes" data={chartFidelidad.filter(c => c.segmento === "Plata (Recurrente)")} fill="#f0ad4e" shape="circle" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </>
        )}

        {/* PANTALLA 3: TENDENCIAS FINANCIERAS DIARIAS Y SEMANALES */}
        {vistaActual === 2 && (
          <>
            <Row className="g-3 mb-4">
              <Col xs={6} md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Promedio de Ingresos Diarios</h6>
                    <h4 className="fw-bold text-success mb-0">C${estadisticas.promedioIngresoDiario?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h4>
                  </Card.Body>
                </Card>
              </Col>
              {/* Comentario movido fuera de la etiqueta de JSX */}
              {/* Ajuste del 100% de ocupación para simular la capacidad de habitaciones */}
              <Col xs={6} md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Capacidad Hotelera Utilizada</h6>
                    <h4 className="fw-bold text-info mb-0">100%</h4>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={12} md={4}>
                <Card className="h-100 border-0 shadow-sm">
                  <Card.Body className="text-center py-3">
                    <h6 className="text-muted small text-uppercase mb-1" style={{fontSize: "0.7rem"}}>Desviación / Variación del Periodo</h6>
                    <h4 className="fw-bold text-muted mb-0">C${(estadisticas.totalIngresos * 0.98)?.toLocaleString('en-US', { maximumFractionDigits: 0 })}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <Row className="g-4">
              <Col lg={7}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="fw-bold text-muted mb-3">Tendencia e Ingresos Diarios</h6>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <AreaChart data={chartTendenciaDiaria} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="fecha" axisLine={false} tickLine={false} className="small" />
                          <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `C$${v}`} className="small" />
                          <Tooltip formatter={(v) => [`C$ ${v}`, "Ingreso Diario"]} />
                          <Area type="monotone" dataKey="monto" stroke="#5cb85c" fill="#5cb85c" fillOpacity={0.3} strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={5}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body>
                    <h6 className="fw-bold text-muted mb-3">Ingresos por día de la semana</h6>
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <BarChart data={chartDiasSemana} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(v) => `C$${v}`} className="small" />
                          <YAxis dataKey="dia" type="category" axisLine={false} tickLine={false} className="small" width={70} />
                          <Tooltip formatter={(v) => [`C$ ${v}`, "Monto"]} cursor={{fill: 'transparent'}} />
                          <Bar dataKey="monto" fill="#2e7d32" radius={[0, 4, 4, 0]} name="Ingresos Totales" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalDashboardVentas;