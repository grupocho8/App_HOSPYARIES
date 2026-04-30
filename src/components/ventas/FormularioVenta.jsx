import React from "react";
import { Card, Form, Button } from "react-bootstrap";

const FormularioVenta = ({ 
  nuevaVenta, 
  setNuevaVenta, 
  agregarVenta, 
  reservaciones, 
  empleados // ✅ CAMBIO
}) => {

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setNuevaVenta({ ...nuevaVenta, [name]: value });
  };

  return (
    <Card className="shadow-sm border-0 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
      <Card.Body>
        <h5 className="fw-bold mb-4 text-secondary">
          <i className="bi bi-plus-circle me-2"></i>Registrar Venta
        </h5>

        <Form onSubmit={(e) => { e.preventDefault(); agregarVenta(); }}>

          {/* RESERVACIÓN */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Reservación / Cliente</Form.Label>
            <Form.Select 
              name="id_reservacion" 
              value={nuevaVenta.id_reservacion} 
              onChange={manejarCambio}
            >
              <option value="">Seleccione...</option>
              {reservaciones.map(res => (
                <option key={res.id_reservacion} value={res.id_reservacion}>
                  Hab {res.habitaciones?.numero} - {res.clientes?.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* 🔥 EMPLEADO + TURNO */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Empleado / Turno</Form.Label>
            <Form.Select 
              name="id_empleado" // ✅ CAMBIO CLAVE
              value={nuevaVenta.id_empleado || ""} 
              onChange={manejarCambio}
            >
              <option value="">Seleccione empleado...</option>

              {empleados.map(emp => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre} - {emp.tipo_turno === "dia" ? "Día" : "Noche"}
                </option>
              ))}

            </Form.Select>
          </Form.Group>

          {/* MONTO */}
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">Monto (C$)</Form.Label>
            <Form.Control 
              name="monto" 
              type="number" 
              step="0.01" 
              value={nuevaVenta.monto} 
              onChange={manejarCambio} 
            />
          </Form.Group>

          <Button type="submit" className="w-100 color-navbar border-0 py-2">
            Confirmar venta
          </Button>

        </Form>
      </Card.Body>
    </Card>
  );
};

export default FormularioVenta;