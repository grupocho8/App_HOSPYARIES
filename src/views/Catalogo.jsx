import React, { useEffect, useState, useMemo } from "react";
import { Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";
import TarjetaCatalogo from "../components/catalogo/TarjetaCatalogo";

const Catalogo = () => {
  // ==================== ESTADOS ====================
  const [habitaciones, setHabitaciones] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("todos");
  const [cargando, setCargando] = useState(true);

  // ==================== CARGA DE DATOS ====================
  const cargarHabitaciones = async () => {
    try {
      setCargando(true);
      // Intentamos traer todo de la tabla habitaciones
      const { data, error } = await supabase
        .from("habitaciones")
        .select("*"); // Quitamos el .order por ahora para evitar errores de columna

      if (error) throw error;
      setHabitaciones(data || []);
    } catch (err) {
      console.error("Error al cargar habitaciones:", err.message);
    } finally {
      setCargando(false);
    }
  };

  // ==================== FILTRADO ====================
  const habitacionesFiltradas = useMemo(() => {
    let filtradas = habitaciones;

    // Filtro por estado (Disponible, Ocupada, Reservada)
    if (filtroEstado !== "todos") {
      filtradas = filtradas.filter((hab) => hab.estado === filtroEstado);
    }

    // Filtro por texto (Número o Tipo de habitación)
    if (textoBusqueda.trim()) {
      const textoLower = textoBusqueda.toLowerCase().trim();
      filtradas = filtradas.filter((hab) => {
        const numero = hab.numero_habitacion?.toString() || "";
        const tipo = hab.tipo_habitacion?.toLowerCase() || "";
        return numero.includes(textoLower) || tipo.includes(textoLower);
      });
    }

    return filtradas;
  }, [habitaciones, filtroEstado, textoBusqueda]);

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  return (
    <div className="mt-3 px-3">
      <Row className="align-items-center mb-4">
        <Col xs={12} md={4}>
          <h3 className="mb-0">
            <i className="bi-door-open-fill me-2"></i>Catálogo de Habitaciones
          </h3>
          <p className="text-muted small">Consulta disponibilidad y tipos</p>
        </Col>

        <Col xs={12} md={4} className="mt-2 mt-md-0">
          <Form.Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="shadow-sm border-0 bg-light"
          >
            <option value="todos">Todos los estados</option>
            <option value="DISPONIBLE">Disponibles</option>
            <option value="OCUPADA">Ocupadas</option>
            <option value="RESERVADA">Reservadas</option>
          </Form.Select>
        </Col>

        <Col xs={12} md={4} className="mt-2 mt-md-0">
          <CuadroBusquedas
            textoBusqueda={textoBusqueda}
            manejarCambioBusqueda={(e) => setTextoBusqueda(e.target.value)}
          />
        </Col>
      </Row>

      <hr />

      {/* Cambiamos el Row de los productos */}
      {!cargando && habitacionesFiltradas.length > 0 && (
        <Row className="flex-column"> {/* Forzamos dirección de columna */}
          {habitacionesFiltradas.map((hab) => (
            <Col xs={12} key={hab.id_habitacion} className="px-0">
              <TarjetaCatalogo
                producto={{
                  id_producto: hab.id_habitacion,
                  // Usamos hab.numero si numero_habitacion viene vacío
                  nombre_producto: `Habitaciones: ${hab.numero || hab.numero_habitacion || 'S/N'}`,
                  descripcion_producto: hab.tipo_habitacion,
                  precio_venta: hab.precio,
                  url_imagen: hab.url_imagen
                }}
                categoriaNombre={hab.estado}
              />
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
};

export default Catalogo;