import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const ModalRegistroHabitacion = ({
  mostrarModal,
  setMostrarModal,
  nuevaHabitacion,
  manejoCambioInput,
  agregarHabitacion,
}) => {
  const [deshabilitado, setDeshabilitado] = useState(false);
  const [archivo, setArchivo] = useState(null);

  const tiposHabitacion = [
    { label: "Unipersonal", value: "unipersonal" },
    { label: "Matrimonial", value: "matrimonial" },
    { label: "Doble", value: "doble" },
    { label: "Triple", value: "triple" },
  ];

  useEffect(() => {
    if (!mostrarModal) {
      setDeshabilitado(false);
      setArchivo(null);
    }
  }, [mostrarModal]);

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (file) setArchivo(file);
  };

  const handleRegistrar = async () => {
    const num = parseInt(nuevaHabitacion.numero);
    if (isNaN(num) || num < 1 || num > 25) return;

    if (deshabilitado) return;
    setDeshabilitado(true);

    let urlImagen = null;

    try {
      // 🔥 SUBIR IMAGEN
      if (archivo) {
        const nombreArchivo = `habitacion_${Date.now()}_${archivo.name}`;

        const { error: errorUpload } = await supabase.storage
          .from("imagenes")
          .upload(nombreArchivo, archivo);

        if (errorUpload) throw errorUpload;

        const { data } = supabase.storage
          .from("imagenes")
          .getPublicUrl(nombreArchivo);

        urlImagen = data.publicUrl;
      }

      // 🔥 ENVIAR TODO (INCLUYENDO IMAGEN)
      await agregarHabitacion({
        numero: nuevaHabitacion.numero,
        tipo: nuevaHabitacion.tipo,
        precio: Number(nuevaHabitacion.precio),
        estado: "disponible",
        url_imagen: urlImagen,
      });

      setArchivo(null);
      setMostrarModal(false);

    } catch (error) {
      console.error("Error subiendo imagen:", error);
    }

    setDeshabilitado(false);
  };

  const numeroValido =
    nuevaHabitacion.numero !== "" &&
    parseInt(nuevaHabitacion.numero) >= 1 &&
    parseInt(nuevaHabitacion.numero) <= 25;

  const esFormularioValido =
    numeroValido &&
    nuevaHabitacion.numero?.trim() !== "" &&
    nuevaHabitacion.precio !== "" &&
    Number(nuevaHabitacion.precio) > 0;

  return (
    <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Nueva Habitación</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Alert variant="info" className="py-2 small">
          El hotel solo cuenta con <strong>25 habitaciones</strong> (1 - 25).
        </Alert>

        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Número *</Form.Label>
            <Form.Control
              type="number"
              name="numero"
              value={nuevaHabitacion.numero || ""}
              onChange={manejoCambioInput}
              min="1"
              max="25"
              isInvalid={nuevaHabitacion.numero !== "" && !numeroValido}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Tipo *</Form.Label>
            <Form.Select
              name="tipo"
              value={nuevaHabitacion.tipo}
              onChange={manejoCambioInput}
            >
              {tiposHabitacion.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Precio *</Form.Label>
            <Form.Control
              type="number"
              name="precio"
              value={nuevaHabitacion.precio || ""}
              onChange={manejoCambioInput}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control type="file" accept="image/*" onChange={manejarArchivo} />
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarModal(false)}>
          Cancelar
        </Button>

        <Button
          onClick={handleRegistrar}
          disabled={!esFormularioValido || deshabilitado}
          style={{ backgroundColor: "#0F5C4F", border: "none" }}
        >
          {deshabilitado ? "Guardando..." : "Guardar"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalRegistroHabitacion;
