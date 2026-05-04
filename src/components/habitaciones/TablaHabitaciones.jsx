import React from "react";
import { Table, Button, Image } from "react-bootstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

const TablaHabitaciones = ({ 
  habitaciones, 
  abrirModalEdicion, 
  abrirModalEliminacion 
}) => {
  return (
    <>
      {habitaciones && habitaciones.length > 0 ? (
        <Table 
          striped 
          borderless 
          hover 
          responsive 
          size="sm"
          className="align-middle"
          style={{ tableLayout: "fixed" }}
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Número</th>
              <th>Tipo</th>
              <th>Precio</th>
              <th>Estado</th>
              <th style={{ width: "80px" }}>Imagen</th> {/* 🔥 NUEVO */}
              <th className="text-center">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {habitaciones.map((habitacion, index) => (
              <tr key={habitacion.id_habitacion}>
                <td>{index + 1}</td>

                <td className="fw-bold">
                  {habitacion.numero}
                </td>

                <td>
                  <span className="badge bg-secondary text-capitalize">
                    {habitacion.tipo}
                  </span>
                </td>

                <td>
                  C$ {parseFloat(habitacion.precio).toLocaleString("es-NI", {
                    minimumFractionDigits: 2,
                  })}
                </td>

                <td>
                  <span 
                    className={`badge text-capitalize ${
                      habitacion.estado === 'disponible' ? 'bg-success' :
                      habitacion.estado === 'ocupada' ? 'bg-danger' :
                      habitacion.estado === 'reservada' ? 'bg-warning text-dark' :
                      'bg-secondary'
                    }`}
                  >
                    {habitacion.estado}
                  </span>
                </td>

                {/* 🔥 IMAGEN */}
                <td style={{ width: "80px", padding: "5px" }}>
                  {habitacion.url_imagen ? (
                    <Image
                      src={habitacion.url_imagen}
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        display: "block",
                        margin: "auto",
                      }}
                    />
                  ) : (
                    <div
                      className="bg-light d-flex align-items-center justify-content-center rounded"
                      style={{
                        width: "60px",
                        height: "60px",
                        margin: "auto",
                      }}
                    >
                      <i className="bi bi-image text-muted"></i>
                    </div>
                  )}
                </td>

                <td className="text-center">
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => abrirModalEdicion(habitacion)}
                  >
                    <i className="bi bi-pencil"></i>
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => abrirModalEliminacion(habitacion)}
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
            No hay habitaciones disponibles para mostrar.
          </p>
        </div>
      )}
    </>
  );
};

export default TablaHabitaciones;
