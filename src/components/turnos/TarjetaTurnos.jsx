import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaTurnos = ({
  turnos,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(turnos && turnos.length > 0));
  }, [turnos]);

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

  // Badge según tipo de turno
  const getTurnoBadgeClass = (tipo) => {
    switch (tipo) {
      case "dia":
        return "bg-warning text-dark";
      case "noche":
        return "bg-dark";
      default:
        return "bg-secondary";
    }
  };

  return (
    <>
      {cargando ? (
        <div className="text-center py-5">
          <h5>Cargando turnos...</h5>
          <Spinner animation="border" />
        </div>
      ) : (
        <Row>
          {turnos.map((turno) => {
            const activa = idTarjetaActiva === turno.id_turno;

            return (
              <Col
                key={turno.id_turno}
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
                  onClick={() => alternarTarjetaActiva(turno.id_turno)}
                >
                  {/* ICONO */}
                  <div className="text-center mt-3">
                    <i
                      className={`bi fs-1 ${
                        turno.tipo_turno === "noche"
                          ? "bi-moon-fill"
                          : "bi-sun-fill"
                      }`}
                    ></i>
                  </div>

                  <Card.Body className="text-center">
                    <Card.Title>
                      Turno {turno.tipo_turno}
                    </Card.Title>

                    <Card.Text className="text-muted small">
                      <strong>Fecha:</strong>{" "}
                      {new Date(turno.fecha).toLocaleDateString("es-NI")}
                      <br />
                      <strong>ID Empleado:</strong> {turno.id_empleado}
                    </Card.Text>

                    <div className="mt-2">
                      <span
                        className={`badge text-capitalize ${getTurnoBadgeClass(
                          turno.tipo_turno
                        )}`}
                      >
                        {turno.tipo_turno}
                      </span>
                    </div>
                  </Card.Body>

                  {/* BOTONES */}
                  {activa && (
                    <div className="text-center mb-3">
                      <Button
                        variant="outline-warning"
                        size="sm"
                        className="me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirModalEdicion(turno);
                        }}
                      >
                        <i className="bi bi-pencil"></i>
                      </Button>

                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          abrirModalEliminacion(turno);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </Button>
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

export default TarjetaTurnos;