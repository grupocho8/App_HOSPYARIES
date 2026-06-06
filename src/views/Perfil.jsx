import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col, ListGroup, Button, Badge, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { supabase } from "../database/supabaseconfig";
import "bootstrap-icons/font/bootstrap-icons.css";

const Perfil = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [generoAvatar, setGeneroAvatar] = useState('mujer'); // default
  const [reservaciones, setReservaciones] = useState([]);
  const [mostrarHistorial, setMostrarHistorial] = useState(false);

  useEffect(() => {
    if (usuario?.email) {
      const avatarGuardado = localStorage.getItem(`avatar_${usuario.email}`);
      if (avatarGuardado) {
        setGeneroAvatar(avatarGuardado);
      }
    }
  }, [usuario]);

  const cambiarAvatar = () => {
    const nuevoGenero = generoAvatar === 'mujer' ? 'hombre' : 'mujer';
    setGeneroAvatar(nuevoGenero);
    if (usuario?.email) {
      localStorage.setItem(`avatar_${usuario.email}`, nuevoGenero);
    }
  };

  const cargarHistorial = async () => {
    if (!usuario || usuario.rol !== 'cliente') return;
    
    try {
      const { data, error } = await supabase
        .from('reservaciones')
        .select(`
          *,
          habitaciones!id_habitacion (numero, tipo)
        `)
        .eq('id_cliente', usuario.id_cliente)
        .order('fecha_inicio', { ascending: false });

      if (!error && data) {
        setReservaciones(data);
        setMostrarHistorial(true);
      }
    } catch (err) {
      console.error("Error al cargar historial:", err);
    }
  };

  const cerrarSesion = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error cerrando sesión:", err);
    }
  };

  const obtenerNombreMostrado = () => {
    if (!usuario) return "Usuario";
    if (usuario.nombre_empleado) return `${usuario.nombre_empleado} ${usuario.apellido_empleado || ''}`.trim();
    if (usuario.nombre) return `${usuario.nombre} ${usuario.apellido || ''}`.trim();
    return "Usuario";
  };

  const censurarCorreo = (email) => {
    if (!email) return "";
    const [nombre, dominio] = email.split('@');
    if (!nombre || !dominio) return email;
    if (nombre.length <= 2) return `${nombre}****@${dominio}`;
    return `${nombre.substring(0, 2)}****@${dominio}`;
  };

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", paddingBottom: "3rem" }}>
      {/* Cabecera con degradado y padding extra para la navbar (usualmente 70px) */}
      <div 
        style={{ 
          background: "linear-gradient(135deg, #0F5C4F 0%, #17a2b8 100%)", 
          padding: "100px 20px 80px 20px",
          borderBottomLeftRadius: "2rem",
          borderBottomRightRadius: "2rem",
          color: "white"
        }}
      >
        <Container>
          <div className="d-flex align-items-center mb-3" style={{ cursor: "pointer" }} onClick={() => navigate(-1)}>
            <i className="bi bi-chevron-left fs-4 me-2"></i>
            <h4 className="mb-0 fw-bold">Mi perfil</h4>
          </div>
        </Container>
      </div>

      <Container style={{ marginTop: "-60px" }}>
        {/* Tarjeta de Información del Usuario */}
        <Card className="border-0 shadow-sm rounded-4 mb-4" style={{ overflow: "hidden" }}>
          <Card.Body className="p-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <div 
                className="rounded-circle me-3 d-flex align-items-center justify-content-center bg-light"
                style={{ width: "60px", height: "60px", cursor: "pointer", position: "relative" }}
                onClick={cambiarAvatar}
                title="Toca para cambiar de avatar"
              >
                {generoAvatar === 'mujer' ? (
                  <i className="bi bi-person-standing-dress fs-1" style={{ color: "#0F5C4F" }}></i>
                ) : (
                  <i className="bi bi-person-standing fs-1" style={{ color: "#0F5C4F" }}></i>
                )}
                {/* Indicador sutil de que se puede cambiar */}
                <div 
                  className="position-absolute bottom-0 end-0 bg-white rounded-circle shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: "20px", height: "20px" }}
                >
                  <i className="bi bi-arrow-repeat text-secondary" style={{ fontSize: "0.7rem" }}></i>
                </div>
              </div>
              <div>
                <h5 className="fw-bold mb-0 text-dark">{obtenerNombreMostrado()}</h5>
                <span className="text-muted small">{censurarCorreo(usuario?.email)}</span>
                <br/>
                <Badge bg="secondary" className="mt-1 fw-normal" style={{ fontSize: "0.65rem" }}>
                  {(usuario?.rol || usuario?.tipo_empleado || "USUARIO").toUpperCase()}
                </Badge>
              </div>
            </div>
            <i className="bi bi-chevron-right text-muted"></i>
          </Card.Body>
        </Card>

        {/* Lista de Opciones */}
        <Card className="border-0 shadow-sm rounded-4">
          <ListGroup variant="flush" className="rounded-4">
            
            {usuario?.rol === 'cliente' && (
              <ListGroup.Item 
                action 
                className="p-3 d-flex justify-content-between align-items-center border-bottom"
                onClick={cargarHistorial}
              >
                <div>
                  <i className="bi bi-clock-history fs-5 me-3" style={{ color: "#0F5C4F" }}></i>
                  <strong className="text-dark">Historial de reservaciones</strong>
                </div>
                <i className="bi bi-chevron-right text-muted"></i>
              </ListGroup.Item>
            )}

            <ListGroup.Item 
              action 
              className="p-3 d-flex justify-content-between align-items-center border-bottom"
              onClick={cerrarSesion}
            >
              <div>
                <i className="bi bi-box-arrow-right fs-5 me-3 text-danger"></i>
                <strong className="text-danger">Salir de la sesión</strong>
              </div>
              <i className="bi bi-chevron-right text-muted"></i>
            </ListGroup.Item>

          </ListGroup>
        </Card>
      </Container>

      {/* Modal Historial de Reservaciones (Para Clientes) */}
      <Modal show={mostrarHistorial} onHide={() => setMostrarHistorial(false)} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold" style={{ color: "#0F5C4F" }}>
            <i className="bi bi-journal-text me-2"></i>
            Mis Reservaciones
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-3">
          {reservaciones.length === 0 ? (
            <div className="text-center py-4 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              No tienes reservaciones en tu historial.
            </div>
          ) : (
            <Row className="g-3">
              {reservaciones.map((res) => (
                <Col xs={12} md={6} key={res.id_reservacion}>
                  <Card className="h-100 border-0 shadow-sm rounded-3 border-start border-4" style={{ borderLeftColor: res.estado === 'activa' ? '#0F5C4F' : '#6c757d' }}>
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0">Hab. {res.habitaciones?.numero} <span className="text-muted fw-normal">({res.habitaciones?.tipo})</span></h6>
                        <Badge 
                          bg={
                            res.estado === 'activa' ? 'success' : 
                            res.estado === 'cancelada' ? 'danger' : 
                            res.estado === 'finalizada' ? 'secondary' : 'warning'
                          }
                          pill
                        >
                          {res.estado}
                        </Badge>
                      </div>
                      <div className="small text-muted mb-1">
                        <i className="bi bi-calendar-check me-1"></i>
                        Inicio: {new Date(res.fecha_inicio).toLocaleDateString()}
                      </div>
                      <div className="small text-muted">
                        <i className="bi bi-calendar-x me-1"></i>
                        Fin: {new Date(res.fecha_fin).toLocaleDateString()}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="outline-secondary" onClick={() => setMostrarHistorial(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Perfil;
