import React from "react";
import { Card, Form, Button } from "react-bootstrap";
import Select from "react-select";

const FormularioVenta = ({
  nuevaVenta,
  setNuevaVenta,
  agregarVenta,
  reservaciones,
  empleados,
}) => {
  // ==================== RESERVACIONES ====================

  const opcionesReservaciones = reservaciones.map((res) => ({
    value: res.id_reservacion,

    label: `Hab ${res.habitaciones?.numero || "—"} - ${res.habitaciones?.tipo || "Sin tipo"} - ${res.clientes?.nombre || ""} ${res.clientes?.apellido || ""}`,
  }));

  // ==================== EMPLEADOS ====================

  const opcionesEmpleados = empleados.map((emp) => ({
    value: emp.id_empleado,

    label: `${emp.nombre} - ${emp.tipo_turno === "dia" ? "Día" : "Noche"}`,
  }));

  // ==================== INPUTS ====================

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setNuevaVenta({
      ...nuevaVenta,
      [name]: value,
    });
  };

  const manejarCambioSelect = (selectedOption, name) => {
    setNuevaVenta({
      ...nuevaVenta,

      [name]: selectedOption ? selectedOption.value : "",
    });
  };

  return (
    <Card
      className="
        shadow-sm
        border-0
        mb-3
      "
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "18px",
      }}
    >
      <Card.Body
        className="
          p-3
          p-md-4
        "
      >
        {/* TITULO */}

        <div className="d-flex align-items-center mb-4">
          <div
            className="me-3 d-flex justify-content-center align-items-center"
            style={{
              width: "45px",
              height: "45px",
              borderRadius: "12px",
              backgroundColor: "#2c6c62",
              color: "white",
            }}
          >
            <i className="bi bi-cash-stack"></i>
          </div>

          <div>
            <h5
              className="fw-bold mb-0"
              style={{
                color: "#2c6c62",
                fontSize: "1rem",
              }}
            >
              Registrar Venta
            </h5>

            <small className="text-muted">Complete la información</small>
          </div>
        </div>

        {/* FORMULARIO */}

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            agregarVenta();
          }}
        >
          {/* RESERVACION */}

          <Form.Group className="mb-3">
            <Form.Label
              className="fw-semibold"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Reservación / Cliente
            </Form.Label>

            <Select
              placeholder="Buscar reservación..."
              options={opcionesReservaciones}
              value={
                opcionesReservaciones.find(
                  (opt) => opt.value === nuevaVenta.id_reservacion,
                ) || null
              }
              onChange={(opt) => manejarCambioSelect(opt, "id_reservacion")}
              isClearable
              noOptionsMessage={() => "No se encontraron reservaciones"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  minHeight: "45px",
                  borderColor: "#dee2e6",
                  boxShadow: "none",
                  fontSize: "0.9rem",
                }),
              }}
            />
          </Form.Group>

          {/* EMPLEADO */}

          <Form.Group className="mb-3">
            <Form.Label
              className="fw-semibold"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Empleado / Turno
            </Form.Label>

            <Select
              placeholder="Seleccione empleado..."
              options={opcionesEmpleados}
              value={
                opcionesEmpleados.find(
                  (opt) => opt.value === nuevaVenta.id_empleado,
                ) || null
              }
              onChange={(opt) => manejarCambioSelect(opt, "id_empleado")}
              isClearable
              noOptionsMessage={() => "No se encontró el empleado"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "12px",
                  minHeight: "45px",
                  borderColor: "#dee2e6",
                  boxShadow: "none",
                  fontSize: "0.9rem",
                }),
              }}
            />
          </Form.Group>

          {/* MONTO */}

          <Form.Group className="mb-4">
            <Form.Label
              className="fw-semibold"
              style={{
                fontSize: "0.85rem",
              }}
            >
              Monto (C$)
            </Form.Label>

            <Form.Control
              name="monto"
              type="number"
              step="0.01"
              value={nuevaVenta.monto}
              onChange={manejarCambio}
              placeholder="0.00"
              style={{
                borderRadius: "12px",
                height: "45px",
                fontSize: "0.95rem",
              }}
            />
          </Form.Group>

          {/* BOTON */}

          <Button
            type="submit"
            className="
              w-100
              border-0
              fw-semibold
            "
            style={{
              backgroundColor: "#2c6c62",
              borderRadius: "12px",
              height: "45px",
              fontSize: "0.95rem",
            }}
          >
            <i className="bi bi-check-circle me-2"></i>
            Confirmar venta
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioVenta;
