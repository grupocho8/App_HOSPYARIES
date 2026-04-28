import React, { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";

const ModalEdicionTurnos = ({
  mostrarModalEdicion,
  setMostrarModalEdicion,
  turnoAEditar,
  setTurnoAEditar,
  supabase,
  cargarTurnos,
  setToast,
  empleados,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);

  const manejoCambioInputEdicion = (e) => {
    const { name, value } = e.target;
    setTurnoAEditar((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActualizar = async () => {
    setDeshabilitado(true);

    try {
      if (!turnoAEditar.fecha || !turnoAEditar.id_empleado || !turnoAEditar.tipo_turno) {
        setToast({
          mostrar: true,
          mensaje: "Todos los campos son obligatorios.",
          tipo: "advertencia",
        });
        setDeshabilitado(false);
        return;
      }

      const { error } = await supabase
        .from("turnos")
        .update({
          fecha: turnoAEditar.fecha,
          tipo_turno: turnoAEditar.tipo_turno,
          id_empleado: turnoAEditar.id_empleado,
        })
        .eq("id_turno", turnoAEditar.id_turno);

      if (error) throw error;

      setMostrarModalEdicion(false);
      await cargarTurnos();

      setToast({
        mostrar: true,
        mensaje: "Turno actualizado correctamente.",
        tipo: "exito",
      });
    } catch (err) {
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al actualizar",
        tipo: "error",
      });
    }

    setDeshabilitado(false);
  };

  if (!turnoAEditar) return null;

  return (
    <Modal show={mostrarModalEdicion} onHide={() => setMostrarModalEdicion(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Editar Turno</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {/* EMPLEADO */}
          <Form.Group className="mb-3">
            <Form.Label>Empleado</Form.Label>
            <Form.Select
              name="id_empleado"
              value={turnoAEditar.id_empleado}
              onChange={manejoCambioInputEdicion}
            >
              <option value="">Seleccione un empleado</option>
              {empleados.map((emp) => (
                <option key={emp.id_empleado} value={emp.id_empleado}>
                  {emp.nombre}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          {/* FECHA */}
          <Form.Group className="mb-3">
            <Form.Label>Fecha</Form.Label>
            <Form.Control
              type="date"
              name="fecha"
              value={turnoAEditar.fecha}
              onChange={manejoCambioInputEdicion}
            />
          </Form.Group>

          {/* 🔥 SOLO DOS TURNOS */}
          <Form.Group className="mb-3">
            <Form.Label>Tipo de Turno</Form.Label>
            <Form.Select
              name="tipo_turno"
              value={turnoAEditar.tipo_turno}
              onChange={manejoCambioInputEdicion}
            >
              <option value="Día">Día</option>
              <option value="Noche">Noche</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModalEdicion(false)}>
          Cancelar
        </Button>

        <Button
          onClick={handleActualizar}
          disabled={deshabilitado}
          className="border-0"
          style={{ backgroundColor: "#0F5C4F" }}
        >
          {deshabilitado ? "Actualizando..." : "Actualizar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalEdicionTurnos;