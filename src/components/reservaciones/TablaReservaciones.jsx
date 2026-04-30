import React from "react";
import { Table, Button, Badge } from "react-bootstrap";

const TablaReservaciones = ({ reservaciones, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <div className="table-responsive shadow-sm rounded">
      <Table hover className="align-middle bg-white mb-0">
        <thead className="table-light">
          <tr>
            <th>Habitación</th>
            <th>Cliente</th>
            <th>Fecha Inicio</th>
            <th>Fecha Fin</th>
            <th>Estado</th>
            <th className="text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {reservaciones.map((res) => (
            <tr key={res.id_reservacion}>
              <td className="fw-bold">Hab. {res.habitaciones?.numero}</td>
              <td>{res.clientes?.nombre}</td>
              <td>{new Date(res.fecha_inicio).toLocaleDateString()}</td>
              <td>{new Date(res.fecha_fin).toLocaleDateString()}</td>
              <td>
                <Badge bg={
                  res.estado === 'Confirmada' ? 'success' : 
                  res.estado === 'Pendiente' ? 'warning' : 'danger'
                }>
                  {res.estado}
                </Badge>
              </td>
              <td className="text-center">
                <Button variant="link" className="text-warning p-0 me-3" onClick={() => abrirModalEdicion(res)}>
                  <i className="bi bi-pencil-square fs-5"></i>
                </Button>
                <Button variant="link" className="text-danger p-0" onClick={() => abrirModalEliminacion(res)}>
                  <i className="bi bi-trash fs-5"></i>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TablaReservaciones;