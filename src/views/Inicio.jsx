import React from "react";
import { Container, Row, Col, Button, Card, Carousel } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import DobleCama from "../assets/doble cama.png";
import TripleCama from "../assets/triple cama.png";
import Unipersonal from "../assets/unipersonal cama.png";
import Matrimonial from "../assets/Matrimonial cama.png";

const Inicio = () => {
  const habitaciones = [
    {
      img: Matrimonial,
      titulo: "Habitación Matrimonial",
      desc: "Lujo y privacidad para parejas.",
    },
    {
      img: DobleCama,
      titulo: "Habitación Doble",
      desc: "Espacio perfecto para compartir.",
    },
    {
      img: TripleCama,
      titulo: "Habitación Triple",
      desc: "Comodidad total para grupos o familias.",
    },
    {
      img: Unipersonal,
      titulo: "Habitación Unipersonal",
      desc: "Tranquilidad y confort para tu viaje individual.",
    },
  ];

  return (
    <div
      style={{
        backgroundColor: "#BFDAD6",
        minHeight: "100vh",
        paddingBottom: "50px",
      }}
    >
      {/* HERO SECTION */}
      <div
        style={{
          background: "linear-gradient(135deg, #0F5C4F 0%, #2F8F84 100%)",
          color: "white",
          padding: "80px 0",
          borderBottomLeftRadius: "50px",
          borderBottomRightRadius: "50px",
          boxShadow: "0px 10px 30px rgba(0,0,0,0.1)",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={7}>
              <h1
                style={{
                  fontWeight: "800",
                  fontSize: "3.5rem",
                  lineHeight: "1.2",
                }}
              >
                Bienvenido a{" "}
                <span style={{ color: "#BFDAD6" }}>HospyAries</span>
              </h1>
              <p
                style={{ fontSize: "20px", marginTop: "20px", opacity: "0.9" }}
              >
                Vive una experiencia única de confort, elegancia y tranquilidad.
              </p>
              <Button
                size="lg"
                style={{
                  backgroundColor: "#0F5C4F", // Color corporativo oscuro
                  color: "white",
                  border: "2px solid #BFDAD6",
                  fontWeight: "bold",
                  marginTop: "25px",
                  padding: "12px 40px",
                  borderRadius: "30px",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                }}
              >
                Reservar ahora
              </Button>
            </Col>
            <Col md={5} className="d-none d-md-block text-center">
              {/* Nuevo icono representativo de hotelería */}
              <i
                className="bi-building-up"
                style={{ fontSize: "140px", color: "#BFDAD6", opacity: "0.6" }}
              ></i>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CARRUSEL DINÁMICO */}
      <Container className="mt-5">
        <h3
          className="text-center mb-4"
          style={{ color: "#0F5C4F", fontWeight: "700" }}
        >
          Nuestras Instalaciones
        </h3>
        <Carousel
          fade
          style={{
            borderRadius: "25px",
            overflow: "hidden",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          }}
        >
          {habitaciones.map((hab, idx) => (
            <Carousel.Item key={idx} interval={3000}>
              <img
                className="d-block w-100"
                src={hab.img}
                alt={hab.titulo}
                style={{ height: "500px", objectFit: "cover" }}
              />
              <Carousel.Caption
                style={{
                  background: "rgba(15, 92, 79, 0.75)",
                  borderRadius: "15px",
                  padding: "20px",
                }}
              >
                <h3>{hab.titulo}</h3>
                <p>{hab.desc}</p>
              </Carousel.Caption>
            </Carousel.Item>
          ))}
        </Carousel>
      </Container>

      {/* SERVICIOS / COMODIDADES */}
      <Container className="mt-5 pt-4">
        <h3
          className="mb-5 text-center"
          style={{ color: "#0F5C4F", fontWeight: "700" }}
        >
          Comodidades de la Habitación
        </h3>
        <Row>
          {[
            {
              icon: "bi-lamp",
              title: "Camas amplias y cómodas",
              desc: "Tamaño ideal para dormir a gusto y sábanas de alta calidad.",
            },
            {
              icon: "bi-snow",
              title: "Climatización",
              desc: "Control de temperatura ajustable para tu confort.",
            },
            {
              icon: "bi-tv",
              title: "Entretenimiento",
              desc: "Smart TV con acceso a tus plataformas favoritas.",
            },
            {
              icon: "bi-wifi",
              title: "WiFi de Alta Velocidad",
              desc: "Conexión estable en todas las áreas.",
            },
            {
              icon: "bi-droplet",
              title: "Baño Moderno",
              desc: "Ducha amplia con artículos de higiene personal.",
            },
            {
              icon: "bi-lightbulb",
              title: "Iluminación Ambiental",
              desc: "Ambientes regulables para cada momento.",
            },
          ].map((item, index) => (
            <Col md={4} className="mb-4" key={index}>
              <Card
                className="text-center h-100 item-servicio"
                style={{
                  border: "none",
                  borderRadius: "25px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
                }}
              >
                <Card.Body className="p-4">
                  <i
                    className={`bi ${item.icon}`}
                    style={{ fontSize: "45px", color: "#2F8F84" }}
                  ></i>
                  <Card.Title
                    className="mt-3"
                    style={{ fontWeight: "700", color: "#0F5C4F" }}
                  >
                    {item.title}
                  </Card.Title>
                  <Card.Text
                    className="text-muted"
                    style={{ fontSize: "14px" }}
                  >
                    {item.desc}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CTA FINAL PERSONALIZADO */}
      <Container className="mt-5 mb-5">
        <Card
          style={{
            background: "linear-gradient(90deg, #78B7AF 0%, #9FC9C3 100%)",
            border: "none",
            borderRadius: "30px",
            boxShadow: "0 15px 30px rgba(0,0,0,0.05)",
          }}
          className="text-center p-5"
        >
          <Card.Body>
            <h2 style={{ color: "#0F5C4F", fontWeight: "800" }}>
              ¿Listo para tu próxima estadía?
            </h2>
            <p
              style={{
                fontSize: "1.2rem",
                color: "#0F5C4F",
                marginBottom: "30px",
              }}
            >
              Reserva ahora y disfruta de una experiencia inolvidable.
            </p>
            <Button
              size="lg"
              style={{
                backgroundColor: "#0F5C4F",
                padding: "12px 60px",
                fontSize: "1.1rem",
                borderRadius: "30px",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Ver habitaciones
            </Button>
          </Card.Body>
        </Card>
      </Container>

      {/* Efectos Hover */}
      <style>{`
        .item-servicio:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(15, 92, 79, 0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default Inicio;
