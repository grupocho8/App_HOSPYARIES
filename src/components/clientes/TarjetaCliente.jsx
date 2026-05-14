import React, { useState, useEffect, useCallback } from "react";
import { Card, Row, Col, Spinner, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TarjetaCliente = ({
  clientes,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
  const [cargando, setCargando] = useState(true);
  const [idTarjetaActiva, setIdTarjetaActiva] = useState(null);

  // Actualizar estado de carga
  useEffect(() => {
    setCargando(!(clientes && clientes.length > 0));
  }, [clientes]);

  // Cerrar tarjeta activa con tecla Escape
  const manejarTeclaEscape = useCallback((evento) => {
    if (evento.key === "Escape") setIdTarjetaActiva(null);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", manejarTeclaEscape);

    return () => window.removeEventListener("keydown", manejarTeclaEscape);
  }, [manejarTeclaEscape]);

  return (
    <>
      {cargando ? (
        <div className="text-center py-5">
          <h5>Cargando clientes...</h5>

          <Spinner animation="border" variant="primary" role="status" />
        </div>
      ) : (
        <Row>
          {clientes.map((cliente) => {
            const tarjetaActiva = idTarjetaActiva === cliente.id_cliente;

            return (
              <Col
                key={cliente.id_cliente}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                className="mb-4"
              >
                <Card
                  className="
                    border-0
                    shadow-sm
                    h-100
                    overflow-hidden
                  "
                  style={{
                    borderRadius: "18px",
                    cursor: "pointer",
                    transition: "0.3s",
                  }}
                  onMouseEnter={() => setIdTarjetaActiva(cliente.id_cliente)}
                  onMouseLeave={() => setIdTarjetaActiva(null)}
                  tabIndex={0}
                >
                  <Card.Body
                    style={{
                      position: "relative",
                    }}
                  >
                    {/* CONTENIDO */}

                    <Row className="align-items-center">
                      <Col xs={3}>
                        <div
                          className="
                            bg-light
                            rounded-circle
                            d-flex
                            align-items-center
                            justify-content-center
                          "
                          style={{
                            width: "50px",
                            height: "50px",
                          }}
                        >
                          <i
                            className="
                              bi-person-fill
                              text-dark
                              fs-3
                            "
                          ></i>
                        </div>
                      </Col>

                      <Col xs={9}>
                        <div className="fw-bold text-truncate">
                          {cliente.nombre} {cliente.apellido}
                        </div>

                        <div className="small text-muted">{cliente.cedula}</div>

                        <div className="small text-muted">
                          {new Date(cliente.fecha_registro).toLocaleDateString(
                            "es-NI",
                          )}
                        </div>
                      </Col>
                    </Row>

                    {/* CAPA OSCURA */}

                    {tarjetaActiva && (
                      <div
                        className="
                          d-flex
                          gap-2
                          justify-content-center
                          align-items-center
                          rounded-3
                        "
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background: "rgba(0,0,0,0.6)",
                          zIndex: 10,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();

                          setIdTarjetaActiva(null);
                        }}
                      >
                        <div
                          className="d-flex gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="warning"
                            onClick={() => {
                              abrirModalEdicion(cliente);

                              setIdTarjetaActiva(null);
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>

                          <Button
                            variant="danger"
                            onClick={() => {
                              abrirModalEliminacion(cliente);

                              setIdTarjetaActiva(null);
                            }}
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
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

export default TarjetaCliente;
