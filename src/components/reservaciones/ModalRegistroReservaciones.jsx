import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import Select from "react-select";

const ModalRegistroReservaciones = ({
  mostrarModal,
  setMostrarModal,
  nuevaReservacion,
  setNuevaReservacion,
  agregarReservacion,
  clientes,
  habitaciones,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  // 1. Preparar opciones para Clientes
  const opcionesClientes = clientes.map((c) => ({
    value: c.id_cliente,
    label: c.nombre,
  }));

  // 2. Preparar opciones para Habitaciones
  const opcionesHabitaciones = habitaciones.map((h) => ({
    value: h.id_habitacion,
    label: `Hab. ${h.numero}`,
  }));

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaReservacion((prev) => ({ ...prev, [name]: value }));
  };

  // Manejadores para los buscadores Select
  const manejoCambioSelect = (selectedOption, fieldName) => {
    setNuevaReservacion((prev) => ({
      ...prev,
      [fieldName]: selectedOption ? selectedOption.value : "",
    }));
  };

  // Validaciones constantes exactas para habilitar/deshabilitar botón
  const camposCompletos =
    nuevaReservacion.id_cliente !== "" &&
    nuevaReservacion.id_habitacion !== "" &&
    nuevaReservacion.fecha_inicio !== "" &&
    nuevaReservacion.fecha_fin !== "";

  const handleRegistrar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarReservacion();
    setDeshabilitado(false);
  };

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false} // Igual que Clientes
      centered         // Sin el size="lg" para que tenga el ancho elegante de Clientes
    >
      <Modal.Header closeButton>
        <Modal.Title>Nueva Reservación</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <Form>
          {/* Buscador de Clientes */}
          <Form.Group className="mb-3">
            <Form.Label>Cliente</Form.Label>
            <Select
              placeholder="Buscar cliente..."
              options={opcionesClientes}
              onChange={(opt) => manejoCambioSelect(opt, "id_cliente")}
              value={opcionesClientes.find(opt => opt.value === nuevaReservacion.id_cliente) || null}
              isClearable
              noOptionsMessage={() => "No se encontraron clientes"}
            />
          </Form.Group>

          {/* Buscador de Habitaciones */}
          <Form.Group className="mb-3">
            <Form.Label>Habitación</Form.Label>
            <Select
              placeholder="Buscar habitación..."
              options={opcionesHabitaciones}
              onChange={(opt) => manejoCambioSelect(opt, "id_habitacion")}
              value={opcionesHabitaciones.find(opt => opt.value === nuevaReservacion.id_habitacion) || null}
              isClearable
              noOptionsMessage={() => "No se encontró la habitación"}
            />
          </Form.Group>

          {/* Fecha Inicio */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control 
              type="date" 
              name="fecha_inicio" 
              value={nuevaReservacion.fecha_inicio} 
              onChange={manejoCambioInput} 
            />
          </Form.Group>

          {/* Fecha Fin */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control 
              type="date" 
              name="fecha_fin" 
              value={nuevaReservacion.fecha_fin} 
              onChange={manejoCambioInput} 
            />
          </Form.Group>

          {/* Estado */}
          <Form.Group className="mb-3">
            <Form.Label>Estado Inicial</Form.Label>
            <Form.Select 
              name="estado" 
              value={nuevaReservacion.estado} 
              onChange={manejoCambioInput}
            >
              <option value="activa">Activa</option>
              <option value="finalizada">Finalizada</option>
              <option value="cancelada">Cancelada</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={!camposCompletos || deshabilitado} // Deshabilitado real si faltan datos o guarda
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }} // Tu color verde corporativo idéntico a Clientes
        >
          Guardar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroReservaciones;