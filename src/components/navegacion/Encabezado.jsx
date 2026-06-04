import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas, NavDropdown } from "react-bootstrap";
import logo from "../../assets/logo_hospyaries.png"; 
import { supabase } from "../../database/supabaseconfig";
import { useAuth } from "../context/AuthContext";
import InstallPWAButton from "../InstallPWAButton";

const Encabezado = () => {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); //Para detectar la ruta actual
const {
  usuario,
  logout,
  tienePermiso,
} = useAuth();

const { permisos } = useAuth();

  const manejarToggle = () => setMostrarMenu(!mostrarMenu);

  const manejarNavegacion = (ruta) => {
    navigate(ruta);
    setMostrarMenu(false);
  };

const cerrarSesion = async () => {
  try {

    await logout();

    setMostrarMenu(false);

    navigate("/login");

  } catch (err) {

    console.error(
      "Error cerrando sesión:",
      err
    );
  }
};

  //Detectar rutas especiales
  const esLogin = location.pathname === "/login";
 const esCatalogo =
  location.pathname === "/catalogo" &&
  !usuario;
  //Contenido del menú
  let contenidoMenu;

  if (esLogin) {
    contenidoMenu = (
      <Nav className="ms-auto pe-2">
        <Nav.Link
          onClick={() => manejarNavegacion("/login")}
          className={mostrarMenu ? "color-texto-marca" : "text-dark"}
        >
          <i className="bi-person-fill-lock me-2"></i>
          Iniciar sesión
        </Nav.Link>
      </Nav>
    );
  } else {
    if (esCatalogo) {
      contenidoMenu = (
        <Nav className="ms-auto pe-2">
          <Nav.Link
            onClick={() => manejarNavegacion("/catalogo")}
            className={mostrarMenu ? "color-texto-marca" : "text-dark"}
          >
            {mostrarMenu ? <i className="bi-images me-2"></i> : null}
            <strong>Catálogo</strong>
          </Nav.Link>
          <Nav.Link
            onClick={() => manejarNavegacion("/login")}
            className={mostrarMenu ? "color-texto-marca" : "text-dark"}
          >
            {mostrarMenu ? <i className="bi-box-arrow-in-right me-2"></i> : null}
            <strong>Iniciar sesión</strong>
          </Nav.Link>
        </Nav>
      );
    } else {
      contenidoMenu = (
        <>
          <Nav className="ms-auto pe-2">
            {usuario?.rol !== 'cliente' && (
              <Nav.Link
                onClick={() => manejarNavegacion("/")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? <i className="bi-house-fill me-2"></i> : null}
                <strong>Inicio</strong>
              </Nav.Link>
            )}

            {usuario?.rol === 'cliente' && (
              <Nav.Link
                onClick={() => manejarNavegacion("/reservaciones")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? <i className="bi-calendar-check-fill me-2"></i> : null}
                <strong>Mis Reservas</strong>
              </Nav.Link>
            )}

            {/* Rutas adaptadas al Hotel manteniendo tu estructura original */}
            {usuario?.rol !== 'cliente' && (
              <Nav.Link
                onClick={() => manejarNavegacion("/clientes")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? <i className="bi-people-fill me-2"></i> : null}
                <strong>Clientes</strong>
              </Nav.Link>
            )}

                    {usuario?.rol !== 'cliente' && tienePermiso("ver_empleados") && (
              <Nav.Link
                onClick={() => manejarNavegacion("/empleados")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? (
                  <i className="bi-person-badge-fill me-2"></i>
                ) : null}

                <strong>Empleados</strong>
              </Nav.Link>
            )}

            {usuario?.rol !== 'cliente' && tienePermiso("ver_permisos") && (
              <Nav.Link
                onClick={() => manejarNavegacion("/permisos")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? (
                  <i className="bi-shield-lock-fill me-2"></i>
                ) : null}

                <strong>Permisos</strong>
              </Nav.Link>
            )}
           
            {usuario?.rol !== 'cliente' && (
              <Nav.Link
                onClick={() => manejarNavegacion("/controlventas")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? <i className="bi-cash-stack me-2"></i> : null}
                <strong>Ventas</strong>
              </Nav.Link>
            )}

            <Nav.Link
              onClick={() => manejarNavegacion("/catalogo")}
              className={mostrarMenu ? "color-texto-marca" : "text-dark"}
            >
              {mostrarMenu ? <i className="bi-images me-2"></i> : null}
              <strong>Catálogo</strong>
            </Nav.Link>

            <hr />

            {/*Icono cerrar sesión en barra superior */}
            {mostrarMenu ? null : (
              <>
                <div className="d-flex align-items-center me-2">
                  <InstallPWAButton />
                </div>
                <Nav.Link
                  onClick={cerrarSesion}
                  className="text-dark d-flex align-items-center"
                >
                  <i className="bi-box-arrow-right fs-5"></i>
                </Nav.Link>
              </>
            )}

            <hr />
          </Nav>

          {/*Información del usuario y boton cerrar sesión */}
          {mostrarMenu && (
            <div className="mt-3 p-3 rounded bg-light text-dark">
              <p className="mb-2">
                <i className="bi-envelope-fill me-2"></i>
                {usuario?.email || usuario?.nombre_empleado || usuario?.nombre || "Usuario"}
              </p>

              <button
                className="btn btn-outline-danger mt-3 w-100"
                onClick={cerrarSesion}
              >
                <i className="bi-box-arrow-right me-2"></i>
                Cerrar sesión
              </button>

              <InstallPWAButton isMobile={true} />
            </div>
          )}
        </>
      );
    }
  }

  return (
    <Navbar expand="md" fixed="top" className="color-navbar shadow-lg" variant="dark">
      <Container>

        <Navbar.Brand
          onClick={() => manejarNavegacion(esCatalogo ? "/catalogo" : "/")}
          className="text-dark fw-bold d-flex align-items-center"
          style={{cursor: "pointer"}}
        >
          <img
            alt=""
            src={logo}
            width="80"
            height="65"
            className="d-inline-block me-2"
          />
          <strong>
            <h4 className="mb-0">HospyAries</h4>
          </strong>
        </Navbar.Brand>

        {/* Botón del menú */}
        {!esLogin && (
          <Navbar.Toggle
            aria-controls="menu-offcanvas"
            onClick={manejarToggle}
          />
        )}

        {/*Menú lateral */}
        <Navbar.Offcanvas
          id="menu-offcanvas"
          placement="end"
          show={mostrarMenu}
          onHide={() => setMostrarMenu(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>Panel HospyAries</Offcanvas.Title>
          </Offcanvas.Header>

          <Offcanvas.Body>
            {contenidoMenu}
          </Offcanvas.Body>
        </Navbar.Offcanvas>
      </Container>
    </Navbar>
  );
}

export default Encabezado;