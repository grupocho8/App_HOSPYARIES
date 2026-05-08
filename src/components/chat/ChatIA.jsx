import React, { useState } from "react";
import { Modal, Button, Form, Spinner, Table } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const ChatIA = ({ mostrarChatModal, setMostrarChatModal }) => {
  const [mensaje, setMensaje] = useState("");
  const [respuesta, setRespuesta] = useState(null);
  const [cargando, setCargando] = useState(false);

  const enviarMensaje = async () => {
    if (!mensaje.trim()) return;

    setCargando(true);
    setRespuesta(null);

    try {
      // Definimos el prompt con tu estructura de tablas
      const prompt = `
        Eres un experto en SQL para un sistema de hotel. 
        Genera una consulta SQL para PostgreSQL/Supabase basada en:
        - ventas (id_venta, id_reservacion, id_empleado, monto, fecha)
        - reservaciones (id_reservacion, id_cliente, id_habitacion, fecha_inicio, fecha_fin, estado)
        - empleados (id_empleado, nombre, rol, usuario)
        - clientes (id_cliente, nombre, apellido, cedula)
        - habitaciones (id_habitacion, numero, tipo, precio, estado)

        Relaciones:
        - ventas.id_reservacion -> reservaciones.id_reservacion
        - ventas.id_empleado -> empleados.id_empleado
        - reservaciones.id_cliente -> clientes.id_cliente
        - reservaciones.id_habitacion -> habitaciones.id_habitacion

        Reglas:
        - Devuelve SOLO la consulta SQL en una sola línea.
        - Usa solo SELECT.
        - Pregunta: "${mensaje}"
      `;

      // Llamada a Google Gemini Usando tu API Key y modelo 
      const apiKey = import.meta.env.VITE_API_KEY;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;

      const resIA = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });

      const dataIA = await resIA.json();
      let sql = dataIA.candidates?.[0]?.content?.parts?.[0]?.text || "";

      // LIMPIEZA Quitamos los bloques de código, espacios y el punto y coma final
      sql = sql
        .replace(/```sql|```/g, "")
        .replace(/;/g, "")
        .trim();

      if (!sql.toUpperCase().startsWith("SELECT")) {
        throw new Error("La IA no generó una consulta válida.");
      }

      // EJECUCIÓN DIRECTA EN SUPABASE (Sin backend intermedio)
      const { data, error } = await supabase.rpc("exec_sql", {
        sql_query: sql,
      });

      if (error) throw new Error("Error en base de datos: " + error.message);

      setRespuesta({
        usuario: mensaje,
        ia: data || [], // data trae los resultados de la tabla
      });
      setMensaje("");
    } catch (error) {
      console.error("Error en el proceso:", error);
      setRespuesta({
        usuario: mensaje,
        ia: `Error: ${error.message}`,
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      show={mostrarChatModal}
      onHide={() => setMostrarChatModal(false)}
      size="lg"
      centered
    >
      <Modal.Header
        closeButton
        style={{ backgroundColor: "#195a4f", color: "white" }}
      >
        <Modal.Title>Asistente Virtual HospyAries</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ backgroundColor: "#f8f9fa" }}>
        {respuesta && (
          <div className="mb-4">
            <div className="p-2 mb-2 bg-white border rounded shadow-sm">
              <small className="text-muted">Tú:</small>{" "}
              <strong>{respuesta.usuario}</strong>
            </div>
            <div
              className="p-3 border rounded bg-white shadow-sm"
              style={{ maxHeight: "300px", overflow: "auto" }}
            >
              {Array.isArray(respuesta.ia) && respuesta.ia.length > 0 ? (
                <Table striped bordered hover responsive size="sm">
                  <thead style={{ backgroundColor: "#2F8F84", color: "white" }}>
                    <tr>
                      {Object.keys(respuesta.ia[0]).map((k) => (
                        <th key={k}>{k}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {respuesta.ia.map((fila, i) => (
                      <tr key={i}>
                        {Object.values(fila).map((v, idx) => (
                          <td key={idx}>{v?.toString()}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p>
                  {typeof respuesta.ia === "string"
                    ? respuesta.ia
                    : "No hay datos para esta consulta."}
                </p>
              )}
            </div>
          </div>
        )}
        <Form.Control
          type="text"
          placeholder="Escribe tu duda (ej: ¿Cuantas son las habitaciones en estado Disponible?)"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
          disabled={cargando}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setMostrarChatModal(false)}>Cerrar</Button>
        <Button
          style={{ backgroundColor: "#0F5C4F", border: "none" }}
          onClick={enviarMensaje}
          disabled={cargando}
        >
          {cargando ? <Spinner size="sm" animation="border" /> : "Consultar IA"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatIA;
