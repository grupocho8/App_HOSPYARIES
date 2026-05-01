import React from "react";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom"; 
import "bootstrap-icons/font/bootstrap-icons.css";

// Assets
import DobleCama from "../assets/doble cama.png";
import TripleCama from "../assets/triple cama.png";
import Unipersonal from "../assets/unipersonal cama.png";
import Matrimonial from "../assets/Matrimonial cama.png";

const Inicio = () => {
  const navigate = useNavigate();

  // Funciones de navegación independientes
  const irAReservaciones = () => navigate("/reservaciones");
  const irAHabitaciones = () => navigate("/habitaciones");

  const habitacionesData = [
    { img: Matrimonial, titulo: "Habitación Matrimonial", desc: "Lujo y privacidad para parejas." },
    { img: DobleCama, titulo: "Habitación Doble", desc: "Espacio perfecto para compartir." },
    { img: TripleCama, titulo: "Habitación Triple", desc: "Comodidad total para grupos o familias." },
    { img: Unipersonal, titulo: "Habitación Unipersonal", desc: "Tranquilidad y confort para tu viaje individual." },
  ];

  return (
    <div style={{ backgroundColor: "#BFDAD6", minHeight: "100vh", paddingBottom: "50px" }}>
      
      {/* HERO SECTION - BOTÓN DE RESERVACIONES */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F5C4F 0%, #2F8F84 100%)",
          color: "white",
          padding: "80px 0",
          borderBottomLeftRadius: "50px",
          borderBottomRightRadius: "50px",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1 style={{ fontWeight: "800", fontSize: "3.5rem" }}>
                Bienvenido a <span style={{ color: "#BFDAD6" }}>HospyAries</span>
              </h1>
              <p style={{ fontSize: "20px", marginTop: "20px" }}>
                Vive una experiencia única de confort y elegancia.
              </p>
              
              {/* ESTE BOTÓN LLEVA A RESERVACIONES */}
              <Button
                size="lg"
                onClick={irAReservaciones}
                style={{
                  backgroundColor: "#0F5C4F",
                  border: "2px solid #BFDAD6",
                  fontWeight: "bold",
                  marginTop: "25px",
                  padding: "12px 40px",
                  borderRadius: "30px",
                }}
              >
                Hacer Reservación
              </Button>
            </Col>
            <Col md={5} className="d-none d-md-block text-center">
              <i className="bi-calendar-check" style={{ fontSize: "140px", color: "#BFDAD6", opacity: "0.6" }}></i>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CARRUSEL */}
      <Container className="mt-5">
        <h3 className="text-center mb-4" style={{ color: "#0F5C4F", fontWeight: "700" }}>
          Nuestras Instalaciones
        </h3>
        <Carousel fade style={{ borderRadius: "25px", overflow: "hidden" }}>
          {habitacionesData.map((hab, idx) => (
            <Carousel.Item key={idx} interval={3000}>
              <img className="d-block w-100" src={hab.img} alt={hab.titulo} style={{ height: "500px", objectFit: "cover" }} />
              <Carousel.Caption style={{ background: "rgba(15, 92, 79, 0.75)", borderRadius: "15px" }}>
                <h3>{hab.titulo}</h3>
                <p>{hab.desc}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>

      {/* SERVICIOS RÁPIDOS */}
      <Container className="mt-5">
        <Row>
          {[
            { icon: "bi-wifi", title: "WiFi Pro" },
            { icon: "bi-snow", title: "Aire Acondicionado" },
            { icon: "bi-tv", title: "Smart TV" },
          ].map((item, index) => (
            <Col md={4} key={index} className="text-center mb-3">
              <div style={{ padding: "20px", background: "white", borderRadius: "20px" }}>
                <i className={item.icon} style={{ fontSize: "40px", color: "#2F8F84" }}></i>
                <h5 className="mt-2" style={{ color: "#0F5C4F" }}>{item.title}</h5>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      <Container className="mt-5 mb-5">
        <Card
          style={{
            background: "linear-gradient(90deg, #78B7AF 0%, #9FC9C3 100%)",
            border: "none",
            borderRadius: "30px",
          }}
          className="text-center p-5"
        >
          <Card.Body>
            <h2 style={{ color: "#0F5C4F", fontWeight: "800" }}>Gestión de Habitaciones</h2>
            <p style={{ fontSize: "1.2rem", color: "#0F5C4F" }}>
              Accede al panel administrativo para ver y editar el estado de las habitaciones.
            </p>
            
            <Button
              size="lg"
              onClick={irAHabitaciones}
              style={{
                backgroundColor: "#0F5C4F",
                padding: "12px 60px",
                borderRadius: "30px",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Ver Habitaciones
            </Button>
          </Card.Body>
        </Card>
      </Container>

    </div>
  );
};

export default Inicio;