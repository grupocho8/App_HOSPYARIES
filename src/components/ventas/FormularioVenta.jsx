import React from "react";
import { Card, Form, Button } from "react-bootstrap";
// 1. Importar Select
import Select from "react-select";

const FormularioVenta = ({ 
  nuevaVenta, 
  setNuevaVenta, 
  agregarVenta, 
  reservaciones, 
  empleados 
}) => {

  // 2. Preparar opciones para Reservaciones
  const opcionesReservaciones = reservaciones.map(res => ({
    value: res.id_reservacion,
    label: `Hab ${res.habitaciones?.numero} - ${res.clientes?.nombre}`
  }));

  // 3. Preparar opciones para Empleados
  const opcionesEmpleados = empleados.map(emp => ({
    value: emp.id_empleado,
    label: `${emp.nombre} - ${emp.tipo_turno === "dia" ? "Día" : "Noche"}`
  }));

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setNuevaVenta({ ...nuevaVenta, [name]: value });
  };

  // 4. Manejador para los buscadores Select
  const manejarCambioSelect = (selectedOption, name) => {
    setNuevaVenta({
      ...nuevaVenta,
      [name]: selectedOption ? selectedOption.value : ""
    });
  };

  return (
    <Card className="shadow-sm border-0 mb-3" style={{ backgroundColor: "#f8f9fa" }}>
      <Card.Body>
        <h5 className="fw-bold mb-4 text-secondary">
          <i className="bi bi-plus-circle me-2"></i>Registrar Venta
        </h5>

        <Form onSubmit={(e) => { e.preventDefault(); agregarVenta(); }}>

          {/* RESERVACIÓN CON BUSCADOR */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Reservación / Cliente</Form.Label>
            <Select
              placeholder="Buscar reservación..."
              options={opcionesReservaciones}
              value={opcionesReservaciones.find(opt => opt.value === nuevaVenta.id_reservacion)}
              onChange={(opt) => manejarCambioSelect(opt, "id_reservacion")}
              isClearable
              noOptionsMessage={() => "No se encontraron reservaciones"}
            />
          </Form.Group>

          {/* EMPLEADO CON BUSCADOR */}
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Empleado / Turno</Form.Label>
            <Select
              placeholder="Seleccione empleado..."
              options={opcionesEmpleados}
              value={opcionesEmpleados.find(opt => opt.value === nuevaVenta.id_empleado)}
              onChange={(opt) => manejarCambioSelect(opt, "id_empleado")}
              isClearable
              noOptionsMessage={() => "No se encontró el empleado"}
            />
          </Form.Group>

          {/* MONTO (Se mantiene igual) */}
          <Form.Group className="mb-4">
            <Form.Label className="small fw-bold">Monto (C$)</Form.Label>
            <Form.Control 
              name="monto" 
              type="number" 
              step="0.01" 
              value={nuevaVenta.monto} 
              onChange={manejarCambio} 
              placeholder="0.00"
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