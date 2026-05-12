import React, { useState } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
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

  const handleAgregar = async () => {
    if (deshabilitado) return;
    setDeshabilitado(true);
    await agregarReservacion();
    setDeshabilitado(false);
  };

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} backdrop="static" centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Nueva Reservación</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            {/* Buscador de Clientes */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Cliente *</Form.Label>
                <Select
                  placeholder="Buscar cliente..."
                  options={opcionesClientes}
                  onChange={(opt) => manejoCambioSelect(opt, "id_cliente")}
                  value={opcionesClientes.find(opt => opt.value === nuevaReservacion.id_cliente)}
                  isClearable
                  noOptionsMessage={() => "No se encontraron clientes"}
                />
              </Form.Group>
            </Col>

            {/* Buscador de Habitaciones */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Habitación *</Form.Label>
                <Select
                  placeholder="Buscar habitación..."
                  options={opcionesHabitaciones}
                  onChange={(opt) => manejoCambioSelect(opt, "id_habitacion")}
                  value={opcionesHabitaciones.find(opt => opt.value === nuevaReservacion.id_habitacion)}
                  isClearable
                  noOptionsMessage={() => "No se encontró la habitación"}
                />
              </Form.Group>
            </Col>

            {/* Fechas */}
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Inicio *</Form.Label>
                <Form.Control type="date" name="fecha_inicio" value={nuevaReservacion.fecha_inicio} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Fecha Fin *</Form.Label>
                <Form.Control type="date" name="fecha_fin" value={nuevaReservacion.fecha_fin} onChange={manejoCambioInput} />
              </Form.Group>
            </Col>

            {/* Estado */}
            <Col xs={12}>
              <Form.Group className="mb-3">
                <Form.Label>Estado Inicial</Form.Label>
                <Form.Select name="estado" value={nuevaReservacion.estado} onChange={manejoCambioInput}>
                  <option value="activa">Activa</option>
                  <option value="finalizada">Finalizada</option>
                  <option value="cancelada">Cancelada</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>Cancelar</Button>
        <Button onClick={handleAgregar} disabled={deshabilitado} style={{ backgroundColor: "#0F5C4F", border: "none" }}>
          Confirmar Reservación
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroReservaciones;