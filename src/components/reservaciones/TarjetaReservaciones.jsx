import React from "react";
import { Row, Col, Card, Badge, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaReservaciones = ({ reservaciones, abrirModalEdicion, abrirModalEliminacion, generarPDFReservacion, esCliente }) => {
  // Función para definir el color del Badge según el estado exacto de tu DB
  const obtenerColorEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'activa': return 'success';
      case 'finalizada': return 'secondary';
      case 'cancelada': return 'danger';
      case 'pendiente': return 'warning';
      default: return 'dark';
    }
  };

  return (
    <Row className="g-4"> {/* g-4 da un espaciado consistente */}
      {reservaciones.map((res) => (
        <Col key={res.id_reservacion} xs={12} md={6} xl={4}>
          <Card className="h-100 shadow-sm border-0 rounded-3 overflow-hidden translate-hover-y">
            {/* translate-hover-y es una clase CSS opcional para un efecto sutil al pasar el mouse */}
            
            <Card.Body className="p-4">
              {/* CABECERA DE LA TARJETA INTEGRADA */}
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <Card.Title className="fw-bold mb-0 fs-5 text-dark">
                    Habitación {res.habitaciones?.numero || 'N/A'}
                  </Card.Title>
                  <span className="text-muted small text-uppercase fw-normal">
                    {res.habitaciones?.tipo || 'Tipo no especificado'}
                  </span>
                </div>
                <Badge 
                  pill // Bordes redondeados
                  bg={obtenerColorEstado(res.estado)} 
                  className="px-3 py-2 text-uppercase fw-bold" 
                  style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}
                >
                  {res.estado}
                </Badge>
              </div>

              <hr className="text-muted opacity-15 my-3" />

              {/* DETALLES DE LA RESERVACIÓN */}
              <div className="reservacion-detalles d-flex flex-column gap-3">
                {/* CLIENTE */}
                <div className="d-flex align-items-center">
                  <div className="icon-shape bg-light rounded-circle text-muted me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-person-fill fs-5"></i>
                  </div>
                  <div>
                    <div className="text-muted small">Cliente</div>
                    <div className="fw-semibold text-dark">
                      {res.clientes ? `${res.clientes.nombre} ${res.clientes.apellido || ''}` : 'N/A'}
                    </div>
                    {res.clientes?.cedula && (
                      <div className="text-muted small">Cédula: {res.clientes.cedula}</div>
                    )}
                  </div>
                </div>

                {/* FECHAS */}
                <div className="d-flex align-items-center">
                  <div className="icon-shape bg-light rounded-circle text-muted me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <i className="bi bi-calendar-range-fill fs-5"></i>
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-muted small">Estadía</div>
                    <Row className="g-0 align-items-center">
                      <Col xs={5}>
                        <div className="fw-semibold text-dark">
                          {new Date(res.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                        </div>
                      </Col>
                      <Col xs={2} className="text-center text-muted">
                        <i className="bi bi-arrow-right"></i>
                      </Col>
                      <Col xs={5}>
                        <div className="fw-semibold text-dark">
                          {new Date(res.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>

              <hr className="text-muted opacity-15 mt-4 mb-3" />

              {/* ACCIONES Y DATOS TÉCNICOS SUTILES */}
              <div className="d-flex justify-content-end align-items-center mt-3">
                
                <div className="d-flex gap-2">
                  {/* BOTÓN PDF */}
                  <OverlayTrigger placement="top" overlay={<Tooltip>Descargar comprobante</Tooltip>}>
                    <Button 
                      variant="light" 
                      size="sm" 
                      className="rounded-circle text-danger p-2 d-flex align-items-center justify-content-center" 
                      style={{ width: '35px', height: '35px' }}
                      onClick={() => generarPDFReservacion(res)}
                    >
                      <i className="bi bi-file-earmark-pdf-fill"></i>
                    </Button>
                  </OverlayTrigger>

                  {/* BOTÓN EDITAR */}
                  {!esCliente && (
                    <OverlayTrigger placement="top" overlay={<Tooltip>Editar reservación</Tooltip>}>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle text-warning p-2 d-flex align-items-center justify-content-center" 
                        style={{ width: '35px', height: '35px' }}
                        onClick={() => abrirModalEdicion(res)}
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </Button>
                    </OverlayTrigger>
                  )}

                  {/* BOTÓN ELIMINAR/CANCELAR */}
                  {!esCliente && (
                    <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar o Cancelar</Tooltip>}>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle text-danger p-2 d-flex align-items-center justify-content-center" 
                        style={{ width: '35px', height: '35px' }}
                        onClick={() => abrirModalEliminacion(res)}
                      >
                        <i className="bi bi-trash3-fill"></i>
                      </Button>
                    </OverlayTrigger>
                  )}

                  {/* BOTÓN CANCELAR PARA CLIENTES */}
                  {esCliente && (res.estado === 'activa' || res.estado === 'pendiente') && (
                    <OverlayTrigger placement="top" overlay={<Tooltip>Cancelar Reservación</Tooltip>}>
                      <Button 
                        variant="light" 
                        size="sm" 
                        className="rounded-circle text-danger p-2 d-flex align-items-center justify-content-center" 
                        style={{ width: '35px', height: '35px' }}
                        onClick={() => abrirModalEliminacion(res)}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </Button>
                    </OverlayTrigger>
                  )}
                </div>
              </div>

            </Card.Body>
          </Card>
        </Col>
      )
    )}
    
    {/* CSS Adicional para el efecto Hover y la fuente mono (puedes poner esto en tu index.css) */}
    <style>{`
      .translate-hover-y {
        transition: transform 0.25s ease-in-out, shadow 0.25s ease-in-out;
      }
      .translate-hover-y:hover {
        transform: translateY(-5px);
        box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1) !important;
      }
      .opacity-15 {
        opacity: 0.15;
      }
      .fw-mono {
        font-family: var(--bs-font-monospace);
      }
    `}</style>
  </Row>
);
};

export default TarjetaReservaciones;