import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaReservaciones = ({ reservaciones, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <Table hover className="align-middle bg-white mb-0">
        <thead className="table-light">
          <tr className="small text-uppercase text-muted" style={{ fontSize: "0.8rem" }}>
            <th className="ps-3">Habitación</th>
            <th>Tipo</th>
            <th>Cliente</th>
            <th>Cédula</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="small">
          {reservaciones.length === 0 ? (
            <tr>
              <td colSpan="8" className="text-center py-4 text-muted">
                No hay reservaciones para mostrar.
              </td>
            </tr>
          ) : (
            reservaciones.map((res) => (
              <tr key={res.id_reservacion}>
                {/* COLUMNA MODIFICADA: Quitamos el color azul (text-primary) */}
                <td className="ps-3 fw-bold">
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

                <td className="text-muted">
                  {res.clientes?.cedula || "—"}
                </td>

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
                    variant="link" 
                    className="text-warning p-1 me-2" 
                    onClick={() => abrirModalEdicion(res)}
                  >
                    <i className="bi bi-pencil-square fs-5"></i>
                  </Button>
                  <Button 
                    variant="link" 
                    className="text-danger p-1" 
                    onClick={() => abrirModalEliminacion(res)}
                  >
                    <i className="bi bi-trash fs-5"></i>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaReservaciones;