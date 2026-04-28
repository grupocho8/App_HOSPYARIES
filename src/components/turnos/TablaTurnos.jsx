import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaTurnos = ({ 
  turnos, 
  abrirModalEdicion, 
  abrirModalEliminacion 
}) => {
  return (
    <>
      {turnos && turnos.length > 0 ? (
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
              <th>Fecha</th>
              <th>Empleado</th>
              <th>Turno</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {turnos.map((turno, index) => (
              <tr key={turno.id_turno}>
                <td>{index + 1}</td>

                <td>
                  {new Date(turno.fecha).toLocaleDateString("es-NI")}
                </td>

                <td className="fw-bold">
                  {turno.empleados?.nombre || "Empleado no asignado"}
                </td>
                
                <td>
                  <span 
                    className={`badge text-capitalize ${
                      turno.tipo_turno === 'Día'
                        ? 'bg-warning text-dark'
                        : turno.tipo_turno === 'Noche'
                        ? 'bg-dark'
                        : 'bg-secondary'
                    }`}
                  >
                    {turno.tipo_turno}
                  </span>
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(turno)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(turno)}
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
            No hay turnos registrados para mostrar.
          </p>
        </div>
      )}
    </>
  );
};

export default TablaTurnos;