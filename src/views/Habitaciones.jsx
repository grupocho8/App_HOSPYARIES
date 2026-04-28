import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Spinner } from "react-bootstrap";
import { supabase } from "../database/supabaseconfig";

import TablaHabitaciones from "../components/habitaciones/TablaHabitaciones";
import TarjetaHabitaciones from "../components/habitaciones/TarjetaHabitaciones";

import ModalRegistroHabitacion from "../components/habitaciones/ModalRegistroHabitacion";
import ModalEdicionHabitacion from "../components/habitaciones/ModalEdicionHabitacion";
import ModalEliminacionHabitacion from "../components/habitaciones/ModalEliminacionHabitacion";

import NotificacionOperacion from "../components/NotificacionOperacion";

const Habitaciones = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  const [mostrarModal, setMostrarModal] = useState(false);

  const [habitacionAEditar, setHabitacionAEditar] = useState(null);
  const [habitacionAEliminar, setHabitacionAEliminar] = useState(null);
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEliminacion, setMostrarModalEliminacion] = useState(false);

  const [nuevaHabitacion, setNuevaHabitacion] = useState({
    numero: "",
    tipo: "unipersonal",
    precio: "",
  });

  const [toast, setToast] = useState({ mostrar: false, mensaje: "", tipo: "" });

  const abrirModalEdicion = (habitacion) => {
    setHabitacionAEditar(habitacion);
    setMostrarModalEdicion(true);
  };

  const abrirModalEliminacion = (habitacion) => {
    setHabitacionAEliminar(habitacion);
    setMostrarModalEliminacion(true);
  };

  const cargarHabitaciones = async () => {
    try {
      setCargando(true);

      const { data, error } = await supabase
        .from("habitaciones")
        .select("*")
        .order("numero", { ascending: true });

      if (error) throw error;

      setHabitaciones(data || []);
    } catch (error) {
      console.error(error.message);
      setToast({
        mostrar: true,
        mensaje: "Error al cargar habitaciones",
        tipo: "error",
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    setNuevaHabitacion((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const agregarHabitacion = async () => {
    try {
      if (!nuevaHabitacion.numero.trim() || !nuevaHabitacion.precio) {
        setToast({
          mostrar: true,
          mensaje: "Debe llenar Número y Precio",
          tipo: "advertencia",
        });
        return;
      }

      const { error } = await supabase.from("habitaciones").insert([
        {
          numero: nuevaHabitacion.numero.trim(),
          tipo: nuevaHabitacion.tipo,
          precio: parseFloat(nuevaHabitacion.precio),
          estado: "disponible",
        },
      ]);

      if (error) throw error;

      setToast({
        mostrar: true,
        mensaje: `Habitación ${nuevaHabitacion.numero} registrada`,
        tipo: "exito",
      });

      setNuevaHabitacion({
        numero: "",
        tipo: "unipersonal",
        precio: "",
      });

      setMostrarModal(false);
      await cargarHabitaciones();
    } catch (err) {
      console.error(err.message);
      setToast({
        mostrar: true,
        mensaje: err.message || "Error al registrar",
        tipo: "error",
      });
    }
  };

  return (
    <Container className="mt-3">
      <Row className="align-items-center mb-3">
        <Col xs={9}>
          <h3>
            <i className="bi-door-open-fill me-2"></i> Habitaciones
          </h3>
        </Col>

        <Col xs={3} className="text-end">
          <Button
            onClick={() => setMostrarModal(true)}
            size="md"
            className="color-navbar border-0"
            style={{ backgroundColor: "#0F5C4F" }}
          >
            <i className="bi-plus-lg"></i>
            <span className="d-none d-sm-inline ms-2">Nueva Habitación</span>
          </Button>
        </Col>
      </Row>

      <hr />

      {cargando ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
          <p>Cargando...</p>
        </div>
      ) : (
        <>
          <Row className="d-lg-none">
            <TarjetaHabitaciones
              habitaciones={habitaciones}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>

          <Row className="d-none d-lg-block">
            <TablaHabitaciones
              habitaciones={habitaciones}
              abrirModalEdicion={abrirModalEdicion}
              abrirModalEliminacion={abrirModalEliminacion}
            />
          </Row>
        </>
      )}

      <ModalRegistroHabitacion
        mostrarModal={mostrarModal}
        setMostrarModal={setMostrarModal}
        nuevaHabitacion={nuevaHabitacion}
        manejoCambioInput={manejoCambioInput}
        agregarHabitacion={agregarHabitacion}
      />

      <ModalEdicionHabitacion
        mostrarModalEdicion={mostrarModalEdicion}
        setMostrarModalEdicion={setMostrarModalEdicion}
        habitacionAEditar={habitacionAEditar}
        setHabitacionAEditar={setHabitacionAEditar}
        supabase={supabase}
        cargarHabitaciones={cargarHabitaciones}
        setToast={setToast}
      />

      <ModalEliminacionHabitacion
        mostrarModalEliminacion={mostrarModalEliminacion}
        setMostrarModalEliminacion={setMostrarModalEliminacion}
        habitacion={habitacionAEliminar}
        supabase={supabase}
        setToast={setToast}
        cargarHabitaciones={cargarHabitaciones}
      />

      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() => setToast({ ...toast, mostrar: false })}
      />
    </Container>
  );
};

export default Habitaciones;
