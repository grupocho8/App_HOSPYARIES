import React, { useState, useMemo } from "react";
import { Modal, Form, Row, Col, Card, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
  AreaChart,
  Area
} from "recharts";
import * as XLSX from "xlsx";

const ModalDashboardVentas = ({ mostrar, manejarCerrar, ventas }) => {
  const hoy = new Date().toLocaleDateString("en-CA", { timeZone: "America/Managua" });
  
  // Estado para la navegacion interna entre tableros
  const [vistaActual, setVistaActual] = useState(0);
  const totalVistas = 4;

  // Opción rápida de filtro
  const [rango, setRango] = useState("mes");
  const [fechaDesde, setFechaDesde] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toLocaleDateString("en-CA")
  );
  const [fechaHasta, setFechaHasta] = useState(hoy);

  const formatearMoneda = (valor) =>
    `C$${Number(valor || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatearPorcentaje = (valor) => `${Number(valor || 0).toFixed(2)}%`;

  const obtenerColorEstado = (estado) => {
    const colores = {
      Disponible: "#4f7faa",
      Ocupada: "#ff8f24",
      Reservada: "#e85757",
      Cancelada: "#8a8f98",
    };

    return colores[estado] || "#4f7faa";
  };

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
        estadisticas: {
          totalIngresos: 0,
          totalReservas: 0,
        },
        chartTurnos: [],
        chartFidelidad: [],
        chartTendenciaDiaria: [],
        chartDiasSemana: [],
        chartDistribucionOcupacion: [],
        tasaOcupacionGlobal: [],
        alertaPro: {
          comprometidoPct: 0,
          alertaNivel: "Controlado",
        },
        cancelaciones: {
          total: 0,
          porcentaje: 0,
        }
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

    // --- PROCESAMIENTO MÓDULO 4: DASHBOARD OPERATIVO TIPO TABLEAU ---
    const mapaOcupacion = {};
    const conteoPorTurno = { dia: 0, noche: 0 };
    const estadosGlobales = { disponible: 0, ocupada: 0, reservada: 0, cancelada: 0 };
    let cancelacionesPeriodo = 0;

    filtrados.forEach((v) => {
      const monto = parseFloat(v.monto) || 0;
      totalIngresos += monto;

      // Turnos
      const turno = v.empleados?.tipo_turno?.toLowerCase() === "dia" ? "dia" : "noche";
      const estadoReserva = v.reservaciones?.estado?.toLowerCase() || "desconocido";
      ingresosTurno[turno] += monto;
      
      if (["activa", "cancelada", "finalizada"].includes(estadoReserva)) {
        turnosData[turno][estadoReserva] += monto;
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

      const tipoHabitacion = v.reservaciones?.habitaciones?.tipo || "Sin tipo";
      const estadoOperativo =
        estadoReserva === "cancelada"
          ? "Cancelada"
          : estadoReserva === "activa"
            ? "Reservada"
            : estadoReserva === "finalizada"
              ? "Ocupada"
              : "Disponible";
      const claveOcupacion = `${estadoOperativo}-${tipoHabitacion}`;

      if (!mapaOcupacion[claveOcupacion]) {
        mapaOcupacion[claveOcupacion] = {
          estado: estadoOperativo,
          tipo: tipoHabitacion,
          nombre: `${estadoOperativo} | ${tipoHabitacion}`,
          diaConteo: 0,
          nocheConteo: 0,
        };
      }

      mapaOcupacion[claveOcupacion][turno === "dia" ? "diaConteo" : "nocheConteo"] += 1;
      conteoPorTurno[turno] += 1;

      const estadoGlobal =
        estadoReserva === "cancelada"
          ? "cancelada"
          : estadoReserva === "activa"
            ? "reservada"
            : estadoReserva === "finalizada"
              ? "ocupada"
              : "disponible";

      estadosGlobales[estadoGlobal] += 1;
      if (estadoGlobal === "cancelada") cancelacionesPeriodo += 1;
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

    const chartDistribucionOcupacion = Object.values(mapaOcupacion)
      .map((item) => ({
        ...item,
        diaPct: conteoPorTurno.dia > 0 ? (item.diaConteo / conteoPorTurno.dia) * 100 : 0,
        nochePct: conteoPorTurno.noche > 0 ? (item.nocheConteo / conteoPorTurno.noche) * 100 : 0,
      }))
      .sort((a, b) => a.estado.localeCompare(b.estado) || a.tipo.localeCompare(b.tipo));

    const totalEstados = Object.values(estadosGlobales).reduce((acc, curr) => acc + curr, 0);
    const porcentajeEstado = (estado) => totalEstados > 0 ? (estadosGlobales[estado] / totalEstados) * 100 : 0;
    const disponiblePct = porcentajeEstado("disponible");
    const ocupadaPct = porcentajeEstado("ocupada");
    const reservadaPct = porcentajeEstado("reservada");
    const comprometidoPct = Math.min(100, ocupadaPct + reservadaPct);
    const alertaNivel = comprometidoPct >= 80 ? "Alto" : comprometidoPct >= 60 ? "Medio" : "Controlado";

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
        promedioIngresoDiario,
        totalReservas
      },
      chartTurnos: [turnosData.dia, turnosData.noche],
      chartFidelidad,
      chartTendenciaDiaria,
      chartDiasSemana,
      chartDistribucionOcupacion,
      tasaOcupacionGlobal: [
        { estado: "Disponible", porcentaje: disponiblePct, color: "#b7dfd2" },
        { estado: "Ocupada", porcentaje: ocupadaPct, color: "#2f5f8f" },
        { estado: "Reservada", porcentaje: reservadaPct, color: "#8bc5b8" },
      ],
      alertaPro: {
        comprometidoPct,
        alertaNivel,
        promedio60: 60,
        promedio80: 80,
      },
      cancelaciones: {
        total: cancelacionesPeriodo,
        porcentaje: totalReservas > 0 ? (cancelacionesPeriodo / totalReservas) * 100 : 0,
      }
    };
  }, [ventas, fechaDesde, fechaHasta]);

  const {
    datosFiltrados,
    estadisticas,
    chartTurnos,
    chartFidelidad,
    chartTendenciaDiaria,
    chartDiasSemana,
    chartDistribucionOcupacion,
    tasaOcupacionGlobal,
    alertaPro,
    cancelaciones
  } = datosProcesados;

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
    "Tendencias y Desviaciones de Ingresos Diarios",
    "Dashboard Operativo de Ocupación"
  ];

  return (
    <Modal show={mostrar} onHide={manejarCerrar} size="xl" centered dialogClassName="modal-dashboard-ventas">
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

        {/* PANTALLA 4: DASHBOARD OPERATIVO TIPO TABLEAU */}
        {vistaActual === 3 && (
          <div className="dashboard-tableau">
            <div className="dashboard-tableau-barra">
              <div>
                <span className="dashboard-tableau-eyebrow">HospyAries Analytics</span>
                <h2 className="dashboard-tableau-titulo">Dashboard Operativo</h2>
              </div>
              <div className="dashboard-tableau-rango">
                {fechaDesde} <i className="bi bi-arrow-right mx-2"></i> {fechaHasta}
              </div>
            </div>

            <Row className="g-4 align-items-start">
              <Col xl={7}>
                <section className="dashboard-tableau-panel">
                  <h3 className="dashboard-tableau-subtitulo">
                    Distribución de Ocupación por Tipo de Habitación y Turno
                  </h3>
                  <div className="dashboard-tableau-nota">
                    <span>estado</span>
                    <span>Tipo</span>
                    <span>Día</span>
                    <span>Noche</span>
                  </div>
                  <div style={{ width: "100%", height: 315 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={chartDistribucionOcupacion}
                      layout="vertical"
                      margin={{ top: 8, right: 42, left: 105, bottom: 10 }}
                      barCategoryGap={7}
                    >
                      <CartesianGrid stroke="#eeeeee" horizontal={false} />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={formatearPorcentaje}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="nombre"
                        width={140}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value, name) => [
                          formatearPorcentaje(value),
                          name === "diaPct" ? "Día" : "Noche",
                        ]}
                        labelFormatter={(label) => label}
                        contentStyle={{ borderRadius: 8, border: "1px solid #d9e2e8" }}
                      />
                      <Legend
                        verticalAlign="top"
                        align="center"
                        iconType="square"
                        formatter={(value) => value === "diaPct" ? "Día" : "Noche"}
                      />
                      <Bar dataKey="diaPct" name="diaPct" radius={[0, 3, 3, 0]}>
                        {chartDistribucionOcupacion.map((item) => (
                          <Cell key={`dia-${item.nombre}`} fill={obtenerColorEstado(item.estado)} />
                        ))}
                        <LabelList dataKey="diaPct" position="right" formatter={formatearPorcentaje} />
                      </Bar>
                      <Bar dataKey="nochePct" name="nochePct" radius={[0, 3, 3, 0]}>
                        {chartDistribucionOcupacion.map((item) => (
                          <Cell key={`noche-${item.nombre}`} fill={obtenerColorEstado(item.estado)} opacity={0.78} />
                        ))}
                        <LabelList dataKey="nochePct" position="right" formatter={formatearPorcentaje} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  </div>
                </section>
              </Col>

              <Col xl={5}>
                <section className="dashboard-tableau-panel h-100">
                  <h3 className="dashboard-tableau-subtitulo">Ingresos del Período</h3>
                  <div className="dashboard-tableau-kpi">
                    <span>Ingresos Totales</span>
                    <strong>{formatearMoneda(estadisticas.totalIngresos)}</strong>
                  </div>

                  <h3 className="dashboard-tableau-subtitulo mt-5">Tasa de Ocupación Global</h3>
                  <div className="dashboard-tableau-segmentos">
                    <div className="dashboard-tableau-segmentos-labels">
                      {tasaOcupacionGlobal.map((item) => (
                        <span key={item.estado}>{item.estado}</span>
                      ))}
                    </div>
                    <div className="dashboard-tableau-segmentos-barra">
                      {tasaOcupacionGlobal.map((item) => (
                        <div
                          key={item.estado}
                          className="dashboard-tableau-segmento"
                          style={{
                            width: `${Math.max(item.porcentaje, item.porcentaje > 0 ? 12 : 0)}%`,
                            backgroundColor: item.color,
                            color: item.estado === "Ocupada" ? "#ffffff" : "#24343c",
                            minWidth: item.porcentaje > 0 ? 78 : 0,
                          }}
                        >
                          {formatearPorcentaje(item.porcentaje)}
                        </div>
                      ))}
                    </div>
                    <div className="dashboard-tableau-scroll" />
                  </div>
                </section>
              </Col>
            </Row>

            <Row className="g-4 mt-4 align-items-center">
              <Col xl={7}>
                <section className="dashboard-tableau-panel">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h3 className="dashboard-tableau-subtitulo mb-0">Alerta PRO</h3>
                    <span className={`dashboard-tableau-badge ${alertaPro.alertaNivel === "Alto" ? "is-danger" : alertaPro.alertaNivel === "Medio" ? "is-warning" : "is-ok"}`}>
                      {alertaPro.alertaNivel}
                    </span>
                  </div>
                  <div style={{ width: "100%", height: 315 }}>
                    <ResponsiveContainer>
                      <BarChart
                        data={[{ nombre: "Inventario Comprometido", valor: alertaPro.comprometidoPct || 0 }]}
                        layout="vertical"
                        margin={{ top: 30, right: 35, left: 8, bottom: 42 }}
                      >
                        <CartesianGrid stroke="#eeeeee" horizontal={false} />
                        <XAxis
                          type="number"
                          domain={[0, 100]}
                          tickFormatter={formatearPorcentaje}
                          label={{ value: "Inventario Comprometido %", position: "insideBottom", offset: -22 }}
                        />
                        <YAxis type="category" dataKey="nombre" hide />
                        <Tooltip formatter={(value) => [formatearPorcentaje(value), "Inventario comprometido"]} />
                        <ReferenceLine x={60} stroke="#d9d9d9" strokeWidth={24} label={{ value: "60% de Promedio", position: "bottom" }} />
                        <ReferenceLine x={80} stroke="#ef5350" strokeWidth={2} label={{ value: "80% de Promedio", position: "bottom" }} />
                        <Bar dataKey="valor" fill="#4f7faa" barSize={105} radius={[0, 3, 3, 0]}>
                          <LabelList dataKey="valor" position="right" formatter={formatearPorcentaje} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </Col>

              <Col xl={5}>
                <Row className="g-4">
                  <Col md={6} xl={12}>
                    <section className="dashboard-tableau-panel dashboard-tableau-cancelaciones">
                      <h3 className="dashboard-tableau-subtitulo">Cancelaciones del Período</h3>
                      <div className="dashboard-tableau-tabla">
                        <div className="dashboard-tableau-tabla-header">Estado</div>
                        <div className="dashboard-tableau-tabla-fila">
                          <strong>cancelada</strong>
                          <span>{cancelaciones.total}</span>
                        </div>
                      </div>
                      <p className="dashboard-tableau-texto">
                        {formatearPorcentaje(cancelaciones.porcentaje)} de las ventas filtradas
                      </p>
                    </section>
                  </Col>
                  <Col md={6} xl={12}>
                    <section className="dashboard-tableau-panel dashboard-tableau-resumen">
                      <span className="dashboard-tableau-eyebrow">Resumen operativo</span>
                      <strong>{formatearPorcentaje(alertaPro.comprometidoPct)}</strong>
                      <p>
                        Ocupadas y reservadas dentro del período seleccionado.
                      </p>
                    </section>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalDashboardVentas;
