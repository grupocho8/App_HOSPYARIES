import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spinner, Alert, Form, Container } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import ModalInfoHabitacion from "../components/catalogo/ModalInfoHabitacion";
import ModalReservaCliente from "../components/catalogo/ModalReservaCliente";
import NotificacionOperacion from "../components/NotificacionOperacion";
import { useAuth } from "../components/context/AuthContext";
import { useNavigate } from "react-router-dom";

const Catalogo = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [habitaciones, setHabitaciones] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState(null);
  const [mostrarModalInfo, setMostrarModalInfo] = useState(false);
  const [mostrarModalReserva, setMostrarModalReserva] = useState(false);
  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const abrirModalInfo = (hab) => {
    setHabitacionSeleccionada(hab);
    setMostrarModalInfo(true);
  };

  const manejarIntentoReserva = (hab) => {
    setMostrarModalInfo(false);
    if (!usuario) {
      setToast({
        mostrar: true,
        mensaje: "Debes iniciar sesión o registrarte para realizar una reserva.",
        tipo: "advertencia"
      });
      setTimeout(() => navigate("/login"), 3000);
    } else {
      setHabitacionSeleccionada(hab);
      setMostrarModalReserva(true);
    }
  };

  const manejarReservaExitosa = () => {
    setToast({
      mostrar: true,
      mensaje: "¡Reserva completada exitosamente!",
      tipo: "exito"
    });
    cargarDatos(); // Recargar para actualizar el estado de la habitación
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from("habitaciones")
        .select("*")
        .order("numero", { ascending: true }); // Ordenar por número de habitación

      if (error) throw error;
      setHabitaciones(data || []);
    } catch (err) {
      console.error("Error al cargar habitaciones:", err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const habitacionesFiltradas = useMemo(() => {
    let filtradas = habitaciones;

    // Filtro por Estado (visto en Supabase como 'disponible', 'ocupada', etc.)
    if (filtroEstado !== "todos") {
      filtradas = filtradas.filter((h) => h.estado.toLowerCase() === filtroEstado.toLowerCase());
    }

    // Filtro por búsqueda de texto
    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();
      filtradas = filtradas.filter((h) => 
        h.numero?.toString().includes(textoLower) || 
        h.tipo?.toLowerCase().includes(textoLower)
      );
    }

    return filtradas;
  }, [habitaciones, filtroEstado, textoBusqueda]);

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <h2 className="fw-bold mb-0">Catálogo de Habitaciones</h2>
          <p className="text-muted">Gestiona y consulta disponibilidad en tiempo real</p>
        </div>
        
        <div className="d-flex gap-2 flex-wrap">
          {/* Filtro por Estado */}
          <Form.Select 
            style={{ width: '200px' }}
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="shadow-sm border-0"
          >
            <option value="todos">Todos los estados</option>
            <option value="disponible">Disponibles</option>
            <option value="ocupada">Ocupadas</option>
            <option value="reservada">Reservadas</option>
          </Form.Select>

          <CuadroBusquedas 
            textoBusqueda={textoBusqueda} 
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)} 
          />
        </div>
      </div>

      {cargando ? (
        <div className="text-center my-5">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : habitacionesFiltradas.length === 0 ? (
        <Alert variant="info" className="text-center shadow-sm">
          No se encontraron habitaciones con estos filtros.
        </Alert>
      ) : (
        <Row className="g-4">
          {habitacionesFiltradas.map((hab) => (
            <Col xs={12} key={hab.id_habitacion}>
              <TarjetaCatalogo habitación={hab} onClick={() => abrirModalInfo(hab)} />
            </Col>
          ))}
        </Row>
      )}

      <ModalInfoHabitacion 
        mostrar={mostrarModalInfo} 
        manejarCerrar={() => setMostrarModalInfo(false)} 
        habitacion={habitacionSeleccionada} 
        manejarReserva={manejarIntentoReserva}
        usuario={usuario}
      />

      <ModalReservaCliente
        mostrarModal={mostrarModalReserva}
        setMostrarModal={setMostrarModalReserva}
        habitacion={habitacionSeleccionada}
        usuario={usuario}
        onReservaExitosa={manejarReservaExitosa}
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

export default Catalogo;