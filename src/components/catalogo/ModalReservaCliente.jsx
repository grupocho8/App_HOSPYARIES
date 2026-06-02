import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const ModalReservaCliente = ({
  mostrarModal,
  setMostrarModal,
  habitacion,
  usuario,
  onReservaExitosa
}) => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const camposCompletos = fechaInicio !== "" && fechaFin !== "";

  const handleRegistrar = async () => {
    if (!camposCompletos || cargando) return;
    setCargando(true);
    setError(null);

    try {
      // 1. Validar fechas lógicas
      if (new Date(fechaInicio) >= new Date(fechaFin)) {
        throw new Error("La fecha de inicio debe ser anterior a la fecha de fin.");
      }

      const idNuevaReservacion = crypto.randomUUID();

      // 2. Insertar reserva
      const { error: errorReserva } = await supabase.from("reservaciones").insert([
        {
          id_reservacion: idNuevaReservacion,
          id_cliente: usuario.id_cliente,
          id_habitacion: habitacion.id_habitacion,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          estado: "activa"
        }
      ]);

      if (errorReserva) throw errorReserva;

      // 3. Actualizar habitación a reservada
      const { error: errorHabitacion } = await supabase
        .from("habitaciones")
        .update({ 
          estado: "reservada",
          id_reservacion_actual: idNuevaReservacion
        }) 
        .eq("id_habitacion", habitacion.id_habitacion);

      if (errorHabitacion) throw errorHabitacion;

      onReservaExitosa();
      setMostrarModal(false);
    } catch (err) {
      setError(err.message || "Error al procesar la reserva.");
    } finally {
      setCargando(false);
    }
  };

  if (!habitacion || !usuario) return null;

  return (
    <Modal
      show={mostrarModal}
      onHide={() => setMostrarModal(false)}
      backdrop="static"
      keyboard={false}
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Confirmar Reservación</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <p className="text-muted mb-4">
          Estás reservando la <strong>Habitación {habitacion.numero} ({habitacion.tipo})</strong>. Por favor, selecciona las fechas de tu estadía.
        </p>

        {error && <div className="alert alert-danger p-2 mb-3">{error}</div>}

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Fecha Inicio</Form.Label>
            <Form.Control 
              type="date" 
              value={fechaInicio} 
              onChange={(e) => setFechaInicio(e.target.value)} 
              min={new Date().toISOString().split("T")[0]}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Fecha Fin</Form.Label>
            <Form.Control 
              type="date" 
              value={fechaFin} 
              onChange={(e) => setFechaFin(e.target.value)} 
              min={fechaInicio || new Date().toISOString().split("T")[0]}
            />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleRegistrar}
          disabled={!camposCompletos || cargando}
          className="color-navbar border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          {cargando ? "Procesando..." : "Confirmar Reserva"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalReservaCliente;
