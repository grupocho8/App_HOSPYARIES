import React from "react";
import { Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaHabitaciones = ({ 
  habitaciones, 
  abrirModalEdicion, 
  abrirModalEliminacion 
}) => {

  // --- Tu Lógica de Estadísticas (Sin cambios) ---
  const total = habitaciones?.length || 0;
  const disponibles = habitaciones?.filter(h => h.estado === 'disponible').length || 0;
  const ocupadas = habitaciones?.filter(h => h.estado === 'ocupada').length || 0;
  const reservadas = habitaciones?.filter(h => h.estado === 'reservada').length || 0;
  
  // Cálculo de Ingresos (Suma de precios de habitaciones ocupadas)
  const ingresosOcupadas = habitaciones
    ?.filter(h => h.estado === 'ocupada')
    .reduce((acc, h) => acc + parseFloat(h.precio || 0), 0) || 0;
  
  const tasaOcupacion = total > 0 ? ((ocupadas / total) * 100).toFixed(0) : 0;

  // --- Tu Paleta de Colores ---
  const colores = {
    disponible: "#BFDAD6", 
    reservada: "#a6e8de",  
    ocupada: "#0F5C4F",    
    textoOscuro: "#2F8F84",
    blanco: "#ffffff"
  };

  const getEstiloEstado = (estado) => {
    switch (estado) {
      case 'disponible': return { bg: colores.disponible, text: '#000' };
      case 'ocupada': return { bg: colores.ocupada, text: '#fff' };
      case 'reservada': return { bg: colores.reservada, text: '#000' };
      default: return { bg: '#ccc', text: '#000' };
    }
  };

  return (
    <div className="p-3" style={{ backgroundColor: "#f8f9fa", borderRadius: "15px" }}>
      
      {/* --- Sección de Resumen (Stats) --- */}
      <Row className="mb-4 g-3">
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-2 p-md-3">
              <h6 className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Ocupación</h6>
              <h3 className="fw-bold mb-0" style={{ color: colores.ocupada, fontSize: '1.2rem' }}>{tasaOcupacion}%</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-2 p-md-3">
              <h6 className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Disponibles</h6>
              <h3 className="fw-bold mb-0" style={{ color: colores.textoOscuro, fontSize: '1.2rem' }}>{disponibles}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-2 p-md-3">
              <h6 className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Ingresos</h6>
              <h3 className="fw-bold mb-0" style={{ color: "#28a745", fontSize: '1.1rem' }}>
                C$ {ingresosOcupadas.toLocaleString("es-NI")}
              </h3>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} md={3}>
          <Card className="text-center border-0 shadow-sm h-100">
            <Card.Body className="p-2 p-md-3">
              <h6 className="text-muted small text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>Reservadas</h6>
              <h3 className="fw-bold mb-0" style={{ color: "#6c757d", fontSize: '1.2rem' }}>{reservadas}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* --- Cuadrícula de Habitaciones (Sin imágenes) --- */}
      <h5 className="mb-3 fw-bold">Estado de habitaciones</h5>
      {habitaciones && habitaciones.length > 0 ? (
        <Row className="g-2 g-md-3">
          {habitaciones.map((habitacion) => {
            const estilo = getEstiloEstado(habitacion.estado);
            return (
              <Col key={habitacion.id_habitacion} xs={6} sm={4} md={3} lg={2}>
                <Card 
                  className="h-100 border-0 shadow-sm text-center"
                  style={{ 
                    backgroundColor: estilo.bg, 
                    color: estilo.text,
                    transition: "transform 0.2s",
                    borderRadius: "12px"
                  }}
                >
                  <Card.Body className="d-flex flex-column justify-content-center align-items-center py-3 py-md-4">
                    {/* Número de habitación destacado ante la falta de imagen */}
                    <div className="fs-3 fw-bold mb-1">{habitacion.numero}</div>
                    
                    <div className="fw-bold text-uppercase mb-2" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>
                      {habitacion.estado}
                    </div>
                    
                    <div className="small opacity-75 text-capitalize mb-3" style={{ fontSize: '0.75rem' }}>
                      {habitacion.tipo} <br/>
                      <span className="fw-bold">C$ {parseFloat(habitacion.precio).toLocaleString("es-NI")}</span>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="d-flex gap-2">
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        onClick={() => abrirModalEdicion(habitacion)}
                      >
                        <i className="bi bi-pencil text-dark"></i>
                      </Button>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                        style={{ width: "32px", height: "32px" }}
                        onClick={() => abrirModalEliminacion(habitacion)}
                      >
                        <i className="bi bi-trash text-danger"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <div className="text-center py-5">
          <p className="text-muted">No hay habitaciones registradas para mostrar.</p>
        </div>
      )}
    </div>
  );
};

export default TablaHabitaciones;