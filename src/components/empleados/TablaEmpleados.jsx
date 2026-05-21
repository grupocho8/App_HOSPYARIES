import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaEmpleados = ({
  empleados,
  abrirModalEdicion,
  abrirModalEliminacion,
  paginaActual, // ✅ NUEVO
  registrosPorPagina, // ✅ NUEVO
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
              <th>Nombre Completo</th>
              <th>Email</th>
              <th>Tipo Empleado</th>
              <th>Turno</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {empleados.map((empleado, index) => (
              <tr key={empleado.id_empleado}>
                {/* ✅ NUMERACIÓN CON PAGINACIÓN */}
                <td>{(paginaActual - 1) * registrosPorPagina + index + 1}</td>

                <td className="fw-semibold">
                  {empleado.nombre_empleado} {empleado.apellido_empleado || ""}
                </td>

                <td>{empleado.email}</td>

                <td>
                  {empleado.tipo_empleado === "administrador"
                    ? "Administrador"
                    : "Recepcionista"}
                </td>

                <td>
                  {empleado.tipo_turno ? (
                    <span
                      className="badge px-3 py-2"
                      style={{
                        backgroundColor:
                          empleado.tipo_turno === "dia" ? "#faec8e" : "#59cbcb",

                        color:
                          empleado.tipo_turno === "dia" ? "#231717" : "#fbfbfb",

                        borderRadius: "10px",

                        fontSize: "0.75rem",

                        fontWeight: "600",
                      }}
                    >
                      {empleado.tipo_turno === "dia" ? "Día" : "Noche"}
                    </span>
                  ) : (
                    <span className="text-muted">No aplica</span>
                  )}
                </td>

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
          <p className="text-muted">
            No hay empleados disponibles para mostrar.
          </p>
        </div>
      )}
    </>
  );
};

export default TablaEmpleados;
