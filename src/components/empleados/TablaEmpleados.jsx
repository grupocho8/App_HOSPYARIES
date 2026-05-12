
import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaEmpleados = ({
  empleados,
  abrirModalEdicion,
  abrirModalEliminacion,
}) => {
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
              <th>Turno</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {empleados.map((empleado, index) => (
              <tr key={empleado.id_empleado}>
                <td>{index + 1}</td>

                <td className="fw-semibold">
                  {empleado.nombre}
                </td>

                <td>{empleado.rol}</td>

                <td>{empleado.usuario}</td>

                <td>
                  <span
                    className="badge px-3 py-2"
                    style={{
                      backgroundColor:
                        empleado.tipo_turno === "dia"
                          ? "#59cbcb"
                          : "#faec8e",

                      color:
                        empleado.tipo_turno === "dia"
                          ? "#ffffff"
                          : "#5c4b00",

                      borderRadius: "10px",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                    }}
                  >
                    {empleado.tipo_turno === "dia"
                      ? "Día"
                      : "Noche"}
                  </span>
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() =>
                      abrirModalEdicion(empleado)
                    }
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() =>
                      abrirModalEliminacion(empleado)
                    }
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
            No hay empleados disponibles para mostrar.
          </p>
        </div>
      )}
    </>
  );
};

export default TablaEmpleados;

