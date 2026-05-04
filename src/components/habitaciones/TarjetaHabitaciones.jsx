import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaHabitaciones = ({
  habitaciones,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(habitaciones && habitaciones.length > 0));
  }, [habitaciones]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);
    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

  const getEstadoBadgeClass = (estado) => {
    switch (estado) {
      case "disponible":
        return "bg-success";
      case "ocupada":
        return "bg-danger";
      case "reservada":
        return "bg-warning text-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <>
      {cargando ? (
        <div className="text-center py-5">
          <h5>Cargando habitaciones...</h5>
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {habitaciones.map((habitacion) => {
            const activa = idTarjetaActiva === habitacion.id_habitacion;

            return (
              <Col
                key={habitacion.id_habitacion}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <Card
                  className={`border-0 shadow-sm h-100 ${
                    activa ? "border border-primary" : ""
                  }`}
                  onClick={() =>
                    alternarTarjetaActiva(habitacion.id_habitacion)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {/* 🔥 IMAGEN */}
                  <div className="text-center mt-3">
                    {habitacion.url_imagen ? (
                      <Image
                        src={habitacion.url_imagen}
                        style={{
                          width: "100%",
                          height: "140px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ) : (
                      <div
                        className="bg-light d-flex align-items-center justify-content-center rounded"
                        style={{
                          width: "100%",
                          height: "140px",
                        }}
                      >
                        <i className="bi bi-image fs-1 text-muted"></i>
                      </div>
                    )}
                  </div>

                  <Card.Body className="text-center">
                    <Card.Title>
                      Habitación {habitacion.numero}
                    </Card.Title>

                    <Card.Text className="text-muted small text-capitalize">
                      <strong>Tipo:</strong> {habitacion.tipo}
                    </Card.Text>

                    <div className="d-flex justify-content-between align-items-center mt-2">
                      <span className="fw-bold text-success">
                        C$ {parseFloat(habitacion.precio).toLocaleString("es-NI", {
                          minimumFractionDigits: 2,
                        })}
                      </span>

                      <span
                        className={`badge text-capitalize ${getEstadoBadgeClass(
                          habitacion.estado
                        )}`}
                      >
                        {habitacion.estado}
                      </span>
                    </div>
                  </Card.Body>

                  {/* 🔥 BOTONES OVERLAY */}
                  {activa && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.4)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "10px",
                      }}
                    >
                      <div className="d-flex gap-2">
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalEdicion(habitacion);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>

                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirModalEliminacion(habitacion);
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default TarjetaHabitaciones;
