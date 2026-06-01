import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import { supabase } from "../database/supabaseconfig";

import TablaEmpleados from "../components/empleados/TablaEmpleados";
import TarjetaEmpleados from "../components/empleados/TarjetaEmpleados";

import ModalRegistroEmpleados from "../components/empleados/ModalRegistroEmpleados";
import ModalEdicionEmpleados from "../components/empleados/ModalEdicionEmpleados";
import ModalEliminarEmpleados from "../components/empleados/ModalEliminarEmpleados";

import NotificacionOperacion from "../components/NotificacionOperacion";
import CuadroBusquedas from "../components/busquedas/CuadroBusquedas";

import Paginacion from "../components/ordenamiento/Paginacion";

const Empleados = () => {

  const [empleados, setEmpleados] = useState([]);

  const [empleadosFiltrados, setEmpleadosFiltrados] =
    useState([]);

  const [textoBusqueda, setTextoBusqueda] =
    useState("");

  const [cargando, setCargando] =
    useState(true);

  const [mostrarModal, setMostrarModal] =
    useState(false);

  const [mostrarModalEdicion,
    setMostrarModalEdicion] =
    useState(false);

  const [mostrarModalEliminacion,
    setMostrarModalEliminacion] =
    useState(false);

  const [empleadoAEditar,
    setEmpleadoAEditar] =
    useState(null);

  const [empleadoAEliminar,
    setEmpleadoAEliminar] =
    useState(null);

  const [toast, setToast] =
    useState({
      mostrar: false,
      mensaje: "",
      tipo: "",
    });

  const [nuevoEmpleado,
    setNuevoEmpleado] =
    useState({
      nombre_empleado: "",
      apellido_empleado: "",
      email: "",
      celular: "",
      password: "",
      tipo_empleado: "",
      tipo_turno: "",
    });

  // ============================================
  // PAGINACIÓN
  // ============================================

  const [registrosPorPagina,
    setRegistrosPorPagina] =
    useState(10);

  const [paginaActual,
    setPaginaActual] =
    useState(1);

  const empleadosPaginados =
    empleadosFiltrados.slice(
      (paginaActual - 1) *
        registrosPorPagina,

      paginaActual *
        registrosPorPagina
    );

  const establecerPaginaActual =
    (pagina) => {
      setPaginaActual(pagina);
    };

  const establecerRegistrosPorPagina =
    (cantidad) => {
      setRegistrosPorPagina(
        cantidad
      );

      setPaginaActual(1);
    };

  // ============================================
  // CARGAR EMPLEADOS
  // ============================================

  const cargarEmpleados =
    async () => {

      try {

        setCargando(true);

        const {
          data,
          error,
        } = await supabase
          .from("empleados")
          .select("*")
          .order("id_empleado", {
            ascending: true,
          });

        if (error)
          throw error;

        setEmpleados(data || []);

        setEmpleadosFiltrados(
          data || []
        );

      } catch (error) {

        console.error(
          "Error al cargar empleados:",
          error.message
        );

        setToast({
          mostrar: true,
          mensaje:
            "Error al cargar empleados.",
          tipo: "error",
        });

      } finally {

        setCargando(false);
      }
    };

  useEffect(() => {
    cargarEmpleados();
  }, []);

  // ============================================
  // BÚSQUEDA
  // ============================================

  const manejarBusqueda = (e) => {
    setTextoBusqueda(
      e.target.value
    );
  };

  useEffect(() => {

    if (!textoBusqueda.trim()) {

      setEmpleadosFiltrados(
        empleados
      );

    } else {

      const texto =
        textoBusqueda
          .toLowerCase();

      const filtrados =
        empleados.filter(
          (e) =>
            e.nombre_empleado
              ?.toLowerCase()
              .includes(texto) ||

            e.apellido_empleado
              ?.toLowerCase()
              .includes(texto) ||

            e.email
              ?.toLowerCase()
              .includes(texto) ||

            e.tipo_empleado
              ?.toLowerCase()
              .includes(texto) ||

            e.tipo_turno
              ?.toLowerCase()
              .includes(texto)
        );

      setEmpleadosFiltrados(
        filtrados
      );
    }

    setPaginaActual(1);

  }, [textoBusqueda, empleados]);

  // ============================================
  // INPUTS
  // ============================================

  const manejoCambioInput = (
    e
  ) => {

    const {
      name,
      value,
    } = e.target;

    setNuevoEmpleado(
      (prev) => ({
        ...prev,
        [name]: value,
      })
    );
  };

  // ============================================
  // AGREGAR EMPLEADO
  // ============================================

  const agregarEmpleado =
    async () => {

      try {

        if (
          !nuevoEmpleado.nombre_empleado.trim() ||
          !nuevoEmpleado.apellido_empleado.trim() ||
          !nuevoEmpleado.email.trim() ||
          !nuevoEmpleado.password.trim() ||
          !nuevoEmpleado.tipo_empleado.trim()
        ) {

          setToast({
            mostrar: true,
            mensaje:
              "Nombre, apellido, correo, contraseña y rol son obligatorios.",
            tipo: "advertencia",
          });

          return;
        }

        // AUTH
        const {
          error: authError,
        } = await supabase.auth.signUp({
          email:
            nuevoEmpleado.email,

          password:
            nuevoEmpleado.password,
        });

        if (authError)
          throw authError;

        // TABLA EMPLEADOS
        const { error } =
          await supabase
            .from("empleados")
            .insert([
              {
                nombre_empleado:
                  nuevoEmpleado.nombre_empleado,

                apellido_empleado:
                  nuevoEmpleado.apellido_empleado,

                email:
                  nuevoEmpleado.email,

                celular:
                  nuevoEmpleado.celular,

                password:
                  nuevoEmpleado.password,

                tipo_empleado:
                  nuevoEmpleado.tipo_empleado,

                tipo_turno:
                  nuevoEmpleado.tipo_empleado ===
                  "administrador"
                    ? null
                    : nuevoEmpleado.tipo_turno,
              },
            ]);

        if (error)
          throw error;

        setToast({
          mostrar: true,
          mensaje:
            `Empleado "${nuevoEmpleado.nombre_empleado}" registrado correctamente.`,
          tipo: "exito",
        });

        setNuevoEmpleado({
          nombre_empleado: "",
          apellido_empleado: "",
          email: "",
          celular: "",
          password: "",
          tipo_empleado: "",
          tipo_turno: "",
        });

        setMostrarModal(false);

        await cargarEmpleados();

      } catch (err) {

        console.error(err);

        setToast({
          mostrar: true,
          mensaje:
            err.message ||
            "Error al registrar empleado.",
          tipo: "error",
        });
      }
    };

  // ============================================
  // ACTUALIZAR EMPLEADO
  // ============================================

  const actualizarEmpleado =
    async () => {

      if (
        !empleadoAEditar.nombre_empleado ||
        !empleadoAEditar.apellido_empleado ||
        !empleadoAEditar.tipo_empleado
      ) {

        setToast({
          mostrar: true,
          mensaje:
            "Nombre, apellido y rol son obligatorios.",
          tipo: "advertencia",
        });

        return;
      }

      try {

        const { error } =
          await supabase
            .from("empleados")
            .update({
              nombre_empleado:
                empleadoAEditar.nombre_empleado,

              apellido_empleado:
                empleadoAEditar.apellido_empleado,

              celular:
                empleadoAEditar.celular,

              email:
                empleadoAEditar.email,

              tipo_empleado:
                empleadoAEditar.tipo_empleado,

              tipo_turno:
                empleadoAEditar.tipo_turno,
            })

            .eq(
              "id_empleado",
              empleadoAEditar.id_empleado
            );

        if (error)
          throw error;

        setMostrarModalEdicion(
          false
        );

        await cargarEmpleados();

        setToast({
          mostrar: true,
          mensaje:
            "Empleado actualizado correctamente.",
          tipo: "exito",
        });

      } catch (err) {

        console.error(err);

        setToast({
          mostrar: true,
          mensaje:
            "Error al actualizar empleado.",
          tipo: "error",
        });
      }
    };

  // ============================================
  // MODALES
  // ============================================

  const abrirModalEdicion =
    (empleado) => {

      setEmpleadoAEditar(
        empleado
      );

      setMostrarModalEdicion(
        true
      );
    };

  const abrirModalEliminacion =
    (empleado) => {

      setEmpleadoAEliminar(
        empleado
      );

      setMostrarModalEliminacion(
        true
      );
    };

  return (
    <Container className="mt-3">

      <Row className="align-items-center mb-3">

        <Col
          xs={9}
          sm={7}
          md={7}
          lg={7}
        >
          <h3 className="mb-0">
            <i className="bi bi-person-badge-fill me-2"></i>
            Empleados
          </h3>
        </Col>

        <Col
          xs={3}
          sm={5}
          md={5}
          lg={5}
          className="text-end"
        >
          <Button
            onClick={() =>
              setMostrarModal(
                true
              )
            }
            className="color-navbar border-0"
          >
            <i className="bi bi-plus-lg"></i>

            <span className="d-none d-sm-inline ms-2">
              Nuevo Empleado
            </span>
          </Button>
        </Col>

      </Row>

      <hr />

      <Row className="mb-3">
        <Col md={6}>
          <CuadroBusquedas
            textoBusqueda={
              textoBusqueda
            }
            manejarCambioBusqueda={
              manejarBusqueda
            }
          />
        </Col>
      </Row>

      {/* CARGA */}
      {cargando ? (

        <div className="text-center py-5">

          <Spinner
            animation="border"
            variant="success"
            size="lg"
          />

          <p className="mt-3">
            Cargando empleados...
          </p>

        </div>

      ) : (
        <>
          {/* SIN RESULTADOS */}
          {
            textoBusqueda.trim() &&
            empleadosFiltrados.length === 0 && (

              <Alert
                variant="info"
                className="text-center"
              >
                No se encontraron empleados
                para "
                {textoBusqueda}"
              </Alert>
            )
          }

          {/* MOBILE */}
          <Row className="d-lg-none">

            <TarjetaEmpleados
              empleados={
                empleadosPaginados
              }
              abrirModalEdicion={
                abrirModalEdicion
              }
              abrirModalEliminacion={
                abrirModalEliminacion
              }
            />

          </Row>

          {/* DESKTOP */}
          <Row className="d-none d-lg-block">

            <TablaEmpleados
              empleados={
                empleadosPaginados
              }

              abrirModalEdicion={
                abrirModalEdicion
              }

              abrirModalEliminacion={
                abrirModalEliminacion
              }

              paginaActual={
                paginaActual
              }

              registrosPorPagina={
                registrosPorPagina
              }
            />

          </Row>
        </>
      )}

      {/* PAGINACIÓN */}
      <Paginacion
        registrosPorPagina={
          registrosPorPagina
        }

        totalRegistros={
          empleadosFiltrados.length
        }

        paginaActual={
          paginaActual
        }

        establecerPaginaActual={
          establecerPaginaActual
        }

        establecerRegistrosPorPagina={
          establecerRegistrosPorPagina
        }
      />

      {/* MODAL REGISTRO */}
      <ModalRegistroEmpleados
        mostrarModal={
          mostrarModal
        }

        setMostrarModal={
          setMostrarModal
        }

        nuevoEmpleado={
          nuevoEmpleado
        }

        manejoCambioInput={
          manejoCambioInput
        }

        agregarEmpleado={
          agregarEmpleado
        }
      />

      {/* MODAL EDICIÓN */}
      <ModalEdicionEmpleados
        mostrarModalEdicion={
          mostrarModalEdicion
        }

        setMostrarModalEdicion={
          setMostrarModalEdicion
        }

        empleadoAEditar={
          empleadoAEditar
        }

        setEmpleadoAEditar={
          setEmpleadoAEditar
        }

        actualizarEmpleado={
          actualizarEmpleado
        }

        supabase={supabase}

        cargarEmpleados={
          cargarEmpleados
        }

        setToast={setToast}
      />

      {/* MODAL ELIMINAR */}
      <ModalEliminarEmpleados
        mostrarModalEliminacion={
          mostrarModalEliminacion
        }

        setMostrarModalEliminacion={
          setMostrarModalEliminacion
        }

        empleado={
          empleadoAEliminar
        }

        supabase={supabase}

        setToast={setToast}

        cargarEmpleados={
          cargarEmpleados
        }
      />

      {/* TOAST */}
      <NotificacionOperacion
        mostrar={toast.mostrar}
        mensaje={toast.mensaje}
        tipo={toast.tipo}
        onCerrar={() =>
          setToast({
            ...toast,
            mostrar: false,
          })
        }
      />

    </Container>
  );
};

export default Empleados;