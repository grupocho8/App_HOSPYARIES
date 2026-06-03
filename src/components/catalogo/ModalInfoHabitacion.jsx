import React from "react";
import { Modal, Button, Badge, Row, Col } from "react-bootstrap";

const ModalInfoHabitacion = ({ mostrar, manejarCerrar, habitacion, manejarReserva, usuario }) => {
  if (!habitacion) return null;

  const colorEstado = {
    disponible: "success",
    ocupada: "danger",
    reservada: "warning",
  };

  return (
    <Modal show={mostrar} onHide={manejarCerrar} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-capitalize d-flex w-100 align-items-center gap-3">
          {habitacion.tipo} - Hab. {habitacion.numero}
          <Badge
            bg={colorEstado[habitacion.estado?.toLowerCase()] || "secondary"}
            className="text-uppercase ms-auto me-3"
            style={{ fontSize: "0.8rem", padding: "8px 12px" }}
          >
            {habitacion.estado}
          </Badge>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row className="g-4">
          <Col md={6}>
            <div style={{ height: "300px", overflow: "hidden", borderRadius: "15px" }}>
              <img
                src={
                  habitacion.url_imagen ||
                  "https://via.placeholder.com/600x400?text=Sin+Imagen"
                }
                alt={`Habitación ${habitacion.numero}`}
                className="w-100 h-100 object-fit-cover shadow-sm"
              />
            </div>
          </Col>
          <Col md={6} className="d-flex flex-column">
            <div>
              <div className="d-flex align-items-baseline mb-3">
                <h2 className="text-success fw-bold mb-0 me-2">C$ {habitacion.precio}</h2>
              </div>
              <p className="text-muted mb-4" style={{ lineHeight: "1.6" }}>
                {habitacion.descripcion || "Esta habitación está equipada para brindar una estancia confortable y relajante. Cuenta con todos los servicios básicos para tu tranquilidad."}
              </p>
              
              <h6 className="fw-bold mb-3 text-dark">Comodidades incluidas:</h6>
              <Row className="g-3 text-muted">
                <Col xs={6}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-circle p-2 d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                      <i className="bi-tv text-primary"></i>
                    </div>
                    <span className="small">Smart TV</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-circle p-2 d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                      <i className="bi-wifi text-primary"></i>
                    </div>
                    <span className="small">Wi-Fi Gratis</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-circle p-2 d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                      <i className="bi-wind text-primary"></i>
                    </div>
                    <span className="small">Ventilador</span>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="d-flex align-items-center gap-2">
                    <div className="bg-light rounded-circle p-2 d-flex justify-content-center align-items-center" style={{width: '35px', height: '35px'}}>
                      <i className="bi-droplet-fill text-primary"></i>
                    </div>
                    <span className="small">Baño Privado</span>
                  </div>
                </Col>
              </Row>
            </div>
            
            <div className="mt-auto pt-4 d-flex flex-column align-items-end gap-2">
               {!usuario && habitacion.estado?.toLowerCase() === "disponible" && (
                 <small className="text-danger fw-bold mb-1">
                   <i className="bi-info-circle me-1"></i>
                   Para poder reservar esta habitación necesitas iniciar sesión o registrarte.
                 </small>
               )}
               <div className="d-flex gap-2 w-100 justify-content-end">
                 <Button 
                   variant="light" 
                   onClick={manejarCerrar} 
                   className="px-4 fw-bold text-muted border"
                 >
                   Cerrar
                 </Button>
                 {habitacion.estado?.toLowerCase() === "disponible" && (!usuario || usuario?.rol === 'cliente') && (
                   <Button 
                     variant="primary" 
                     onClick={() => manejarReserva(habitacion)} 
                     className="px-4 fw-bold"
                     style={{ backgroundColor: "#0F5C4F", borderColor: "#0F5C4F" }}
                   >
                     Reservar
                   </Button>
                 )}
               </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default ModalInfoHabitacion;
