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

  // Alternar tarjeta activa al hacer clic
  const alternarTarjetaActiva = (id) => {
    setIdTarjetaActiva((anterior) => (anterior === id ? null : id));
  };

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
                  className={`tarjeta-cliente-contenedor border-0 rounded-3 shadow-sm h-100 ${
                    tarjetaActiva ? "tarjeta-cliente-activa" : ""
                  }`}
                  onClick={() => alternarTarjetaActiva(cliente.id_cliente)}
                  tabIndex={0}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter" || evento.key === " ") {
                      evento.preventDefault();
                      alternarTarjetaActiva(cliente.id_cliente);
                    }
                  }}
                >
                  <div className="tarjeta-cliente-imagen">
                    <i className="bi bi-person-circle"></i>
                  </div>

                  <Card.Body className="tarjeta-cliente-cuerpo p-3">
                    <Card.Title className="fw-semibold text-truncate">
                      {cliente.nombre} {cliente.apellido}
                    </Card.Title>

                    <Card.Text className="text-muted small">
                      <strong>Cédula:</strong> {cliente.cedula}
                      <br />
                      <strong>Registrado:</strong>{" "}
                      {new Date(cliente.fecha_registro).toLocaleDateString("es-NI")}
                    </Card.Text>
                  </Card.Body>

                  {/* Capa con botones que aparece al activar la tarjeta */}
                  {tarjetaActiva && (
                    <div
                      className="tarjeta-cliente-capa"
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
                          variant="outline-warning"
                          size="sm"
                          onClick={() => {
                            abrirModalEdicion(cliente);
                            setIdTarjetaActiva(null);
                          }}
                        >
                          <i className="bi bi-pencil"></i>
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
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