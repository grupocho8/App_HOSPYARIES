import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaEmpleados = ({ empleados, abrirModalEdicion, abrirModalEliminacion }) => {
  return (
    <>
      {empleados && empleados.length > 0 ? (
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
              <th>Nombre</th>
              <th>Rol</th>
              <th>Usuario</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map((empleado, index) => (
              <tr key={empleado.id_empleado}>
                <td>{index + 1}</td>
                <td className="fw-semibold">{empleado.nombre}</td>
                <td>{empleado.rol}</td>
                <td>{empleado.usuario}</td>
                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(empleado)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(empleado)}
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
          <p className="text-muted">No hay empleados disponibles para mostrar.</p>
        </div>
      )}
    </>
  );
};

export default TablaEmpleados;