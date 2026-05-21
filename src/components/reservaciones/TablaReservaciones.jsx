import React from "react";
import { Table, Button, Badge } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaReservaciones = ({
  reservaciones,
  abrirModalEdicion,
  abrirModalEliminacion,
  paginaActual, // ✅ NUEVO
  registrosPorPagina, // ✅ NUEVO
}) => {
  return (
    <>
      {reservaciones && reservaciones.length > 0 ? (
        <Table
          striped
          borderless
          hover
          responsive
          size="sm"
          className="align-middle"
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Habitación</th>
              <th>Tipo</th>
              <th>Cliente</th>
              <th>Cédula</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {reservaciones.map((res, index) => (
              <tr key={res.id_reservacion}>
                {/* ✅ NUMERACIÓN CON PAGINACIÓN */}
                <td>{(paginaActual - 1) * registrosPorPagina + index + 1}</td>

                <td className="fw-bold">
                  Hab. {res.habitaciones?.numero}
                </td>
                
                <td className="text-muted">
                  {res.habitaciones?.tipo || "—"}
                </td>

                <td className="fw-semibold">
                  {res.clientes 
                    ? `${res.clientes.nombre} ${res.clientes.apellido || ""}` 
                    : "N/A"}
                </td>

                <td>{res.clientes?.cedula || "—"}</td>

                <td>{new Date(res.fecha_inicio).toLocaleDateString()}</td>
                <td>{new Date(res.fecha_fin).toLocaleDateString()}</td>

                <td>
                  <Badge 
                    className="px-2 py-1"
                    bg={
                      res.estado === 'activa' ? 'success' : 
                      res.estado === 'cancelada' ? 'danger' : 
                      res.estado === 'finalizada' ? 'secondary' : 'warning'
                    }
                  >
                    {res.estado}
                  </Badge>
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(res)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(res)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <div className="text-center mt-4 py-5">
          <p className="text-muted">
            No hay reservaciones disponibles para mostrar.
          </p>
        </div>
      )}
    </>
  );
};

export default TablaReservaciones;