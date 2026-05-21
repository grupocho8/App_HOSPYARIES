import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaEmpleados = ({
  empleados,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);

  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  useEffect(() => {
    setCargando(!(empleados && empleados.length > 0));
  }, [empleados]);

  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") {
      setIdTarjetaActiva(null);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);

    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  return (
    <>
      {cargando ? (
        <div className="text-center py-5">
          <h5>Cargando empleados...</h5>

          <Spinner animation="border" variant="primary" role="status" />
        </div>
      ) : (
        <Row>
          {empleados.map((empleado) => {
            const tarjetaActiva = idTarjetaActiva === empleado.id_empleado;

            return (
              <Col
                key={empleado.id_empleado}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <Card
                  className="border-0 shadow-sm h-100 overflow-hidden"
                  style={{
                    borderRadius: "18px",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                  onMouseEnter={() => setIdTarjetaActiva(empleado.id_empleado)}
                  onMouseLeave={() => setIdTarjetaActiva(null)}
                >
                  <Card.Body
                    style={{
                      position: "relative",
                    }}
                  >
                    <Row className="align-items-center">
                      <Col xs={3}>
                        <div
                          className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                          style={{
                            width: "50px",
                            height: "50px",
                          }}
                        >
                          <i className="bi bi-person-badge-fill text-dark fs-3"></i>
                        </div>
                      </Col>

                      <Col xs={9}>
                        <div className="fw-bold text-truncate">
                          {empleado.nombre_empleado}{" "}
                          {empleado.apellido_empleado}
                        </div>

                        <div className="small text-muted">{empleado.email}</div>

                        <div className="small text-muted">
                          {empleado.tipo_empleado}
                        </div>

                        <div className="small text-muted">
                          {empleado.celular || "-"}
                        </div>

                        <div className="mt-1">
                          {empleado.tipo_turno ? (
                            <span
                              className="badge px-2 py-1"
                              style={{
                                backgroundColor:
                                  empleado.tipo_turno === "dia"
                                    ? "#faec8e"
                                    : "#59cbcb",

                                color:
                                  empleado.tipo_turno === "dia"
                                    ? "#231717"
                                    : "#fbfbfb",

                                borderRadius: "8px",

                                fontSize: "0.70rem",

                                fontWeight: "600",
                              }}
                            >
                              {empleado.tipo_turno === "dia" ? "Día" : "Noche"}
                            </span>
                          ) : (
                            <small className="text-muted">No aplica</small>
                          )}
                        </div>
                      </Col>
                    </Row>

                    {tarjetaActiva && (
                      <div
                        className="d-flex gap-2 justify-content-center align-items-center rounded-3"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: "rgba(0,0,0,0.6)",
                          zIndex: 10,
                        }}
                      >
                        <Button
                          variant="warning"
                          onClick={() => abrirModalEdicion(empleado)}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() => abrirModalEliminacion(empleado)}
                        >
                          <i className="bi bi-trash"></i>
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default TarjetaEmpleados;
