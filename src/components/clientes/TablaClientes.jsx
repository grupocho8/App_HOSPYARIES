import React from "react";
import { Table, Button } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaClientes = ({ 
  clientes, 
  abrirModalEdicion, 
  abrirModalEliminacion,
  paginaActual,              // ✅ NUEVO
  registrosPorPagina         // ✅ NUEVO
}) => {
  return (
    <>
      {clientes && clientes.length > 0 ? (
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
              <th>Apellido</th>
              <th>Cédula</th>
              <th className="d-none d-md-table-cell">Fecha de Registro</th>
              <th className="text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((cliente, index) => (
              <tr key={cliente.id_cliente}>
                
                {/* ✅ NUMERACIÓN CORREGIDA */}
                <td>
                  {(paginaActual - 1) * registrosPorPagina + index + 1}
                </td>

                <td className="fw-semibold">{cliente.nombre}</td>
                <td>{cliente.apellido}</td>
                <td>{cliente.cedula}</td>

                <td className="d-none d-md-table-cell">
                  {new Date(cliente.fecha_registro).toLocaleDateString("es-NI", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(cliente)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(cliente)}
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
          <p className="text-muted">No hay clientes disponibles para mostrar.</p>
        </div>
      )}
    </>
  );
};

export default TablaClientes;
