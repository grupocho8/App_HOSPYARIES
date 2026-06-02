import React from "react";
import { Card, Row, Col, Badge, Button } from "react-bootstrap";

const TarjetaVenta = ({
  v,
  index,
  setVentaSeleccionada,
  setShowEditar,
  setShowEliminar,
  generarPDFIndividual,
  imprimirTicketRawbt,
}) => {
  return (
    <Card
      className="border-0 shadow-sm mb-4 overflow-hidden"
      style={{
        borderRadius: "20px",
        transition: "0.3s",
      }}
    >
      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center px-3 py-3"
        style={{
          background: "linear-gradient(135deg, #2c6c62, #3d8b7f)",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="bg-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ width: "45px", height: "45px" }}
          >
            <i className="bi bi-receipt-cutoff text-dark fs-4"></i>
          </div>

          <div>
            <div className="text-white fw-bold">Venta #{index + 1}</div>
            <small style={{ color: "#d9f3ee" }}>Registro de venta</small>
          </div>
        </div>

        <Badge
          bg="light"
          text="dark"
          className="fw-semibold px-3 py-2"
          style={{ borderRadius: "10px", fontSize: "0.75rem" }}
        >
          Hab {v.reservaciones?.habitaciones?.numero || "—"}
        </Badge>
      </div>

      {/* BODY */}
      <Card.Body className="p-3">
        {/* CLIENTE */}
        <div
          className="p-3 mb-3"
          style={{ backgroundColor: "#f8f9fa", borderRadius: "14px" }}
        >
          <div className="d-flex align-items-center gap-3">
            <div
              className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: "50px", height: "50px" }}
            >
              <i className="bi bi-person-fill text-dark fs-4"></i>
            </div>

            <div>
              <h6 className="fw-bold mb-1" style={{ color: "#2c6c62" }}>
                {v.reservaciones?.clientes
                  ? `${v.reservaciones.clientes.nombre} ${
                      v.reservaciones.clientes.apellido || ""
                    }`
                  : "N/A"}
              </h6>

              <small className="text-muted">
                {v.reservaciones?.habitaciones?.tipo || "Sin tipo"}
              </small>
            </div>
          </div>
        </div>

        {/* INFORMACION */}
        <Row className="g-3">
          {/* EMPLEADO */}
          <Col xs={6}>
            <div
              className="p-3 h-100"
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "14px",
              }}
            >
              <small className="text-muted d-block mb-1">Empleado</small>

              <div
                className="fw-semibold text-truncate"
                style={{ fontSize: "0.9rem" }}
              >
                {v.empleados
                  ? `${v.empleados.nombre_empleado} ${v.empleados.apellido_empleado || ""}`
                  : "No asignado"}
              </div>
            </div>
          </Col>

          {/* TURNO */}
          <Col xs={6}>
            <div
              className="p-3 text-center h-100"
              style={{
                backgroundColor:
                  v.empleados?.tipo_turno === "dia" ? "#fff4cc" : "#d8f5f5",
                borderRadius: "14px",
              }}
            >
              <small className="text-muted d-block mb-1">Turno</small>

              <div
                className="fw-bold"
                style={{ fontSize: "0.9rem", color: "#231717" }}
              >
                {v.empleados?.tipo_turno === "dia" ? "Día" : "Noche"}
              </div>
            </div>
          </Col>

          {/* FECHA */}
          <Col xs={6}>
            <div
              className="p-3 h-100"
              style={{ backgroundColor: "#f8f9fa", borderRadius: "14px" }}
            >
              <small className="text-muted d-block mb-1">Fecha</small>

              <div className="fw-semibold" style={{ fontSize: "0.85rem" }}>
                {v.fecha ? new Date(v.fecha).toLocaleDateString() : "S/F"}
              </div>
            </div>
          </Col>

          {/* TOTAL */}
          <Col xs={6}>
            <div
              className="p-3 text-center h-100"
              style={{ backgroundColor: "#ecfdf5", borderRadius: "14px" }}
            >
              <small className="text-muted d-block mb-1">Total</small>

              <div
                className="fw-bold"
                style={{ color: "#198754", fontSize: "1rem" }}
              >
                C$ {parseFloat(v.monto || 0).toFixed(2)}
              </div>
            </div>
          </Col>
        </Row>

        {/* BOTONES */}
        <div className="d-flex gap-2 mt-4">
          <Button
            className="border-0 flex-fill"
            style={{
              borderRadius: "12px",
              fontSize: "0.85rem",
              padding: "10px",
              backgroundColor: "#6c757d",
              color: "#fff",
            }}
            onClick={() => generarPDFIndividual(v)}
          >
            <i className="bi bi-file-earmark-pdf me-1"></i>
            PDF
          </Button>

          <Button
            className="border-0 flex-fill"
            style={{
              borderRadius: "12px",
              fontSize: "0.85rem",
              padding: "10px",
              backgroundColor: "#17a2b8",
              color: "#fff",
            }}
            onClick={() => imprimirTicketRawbt(v)}
          >
            <i className="bi bi-printer me-1"></i>
            Ticket
          </Button>

          <Button
            className="border-0 flex-fill"
            style={{
              borderRadius: "12px",
              fontSize: "0.85rem",
              padding: "10px",
              backgroundColor: "#d8b46a",
              color: "#fff",
            }}
            onClick={() => {
              setVentaSeleccionada(v);
              setShowEditar(true);
            }}
          >
            <i className="bi bi-pencil-square me-1"></i>
            Editar
          </Button>

          <Button
            className="border-0 flex-fill"
            style={{
              borderRadius: "12px",
              fontSize: "0.85rem",
              padding: "10px",
              backgroundColor: "#c96d6d",
              color: "#fff",
            }}
            onClick={() => {
              setVentaSeleccionada(v);
              setShowEliminar(true);
            }}
          >
            <i className="bi bi-trash3 me-1"></i>
            Eliminar
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default TarjetaVenta;
