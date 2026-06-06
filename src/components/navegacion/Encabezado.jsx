import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Nav, Navbar, Offcanvas, NavDropdown, Badge } from "react-bootstrap";
import logo from "../../assets/logo_hospyaries.png"; 
import { supabase } from "../../database/supabaseconfig";
import { useAuth } from "../context/AuthContext";
import { sincronizarReservaciones } from "../../utils/sincronizarEstados";
import InstallPWAButton from "../InstallPWAButton";

const Encabezado = () => {

  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarNotificaciones, setMostrarNotificaciones] = useState(false);
  const [notificaciones, setNotificaciones] = useState([]);
  const navigate = useNavigate();
  const location = useLocation(); //Para detectar la ruta actual
const {
  usuario,
  logout,
  tienePermiso,
} = useAuth();

const { permisos } = useAuth();

  useEffect(() => {
    if (!usuario) return;

    const cargarNotificaciones = async () => {
      // 1. Sincronizar estados (cancela/finaliza automáticamente las vencidas)
      await sincronizarReservaciones();

      // 2. Obtener fecha local actual en formato YYYY-MM-DD
      const hoy = new Date();
      const offset = hoy.getTimezoneOffset();
      const hoyLocal = new Date(hoy.getTime() - (offset * 60 * 1000));
      const hoyStr = hoyLocal.toISOString().split('T')[0];

      let query = supabase
        .from('reservaciones')
        .select(`
          id_reservacion,
          fecha_inicio,
          fecha_fin,
          habitaciones!id_habitacion (numero, tipo, estado),
          clientes (nombre, apellido)
        `)
        .eq('estado', 'activa')
        .gte('fecha_fin', hoyStr)
        .order('fecha_inicio', { ascending: true });

      if (usuario.rol === 'cliente') {
        query = query.eq('id_cliente', usuario.id_cliente);
      }

      const { data, error } = await query;
      if (!error && data) {
        // Omitir reservaciones que ya tienen la habitación ocupada (el cliente ya llegó)
        const pendientes = data.filter(notif => notif.habitaciones?.estado !== 'ocupada');
        setNotificaciones(pendientes);
      }
    };

    cargarNotificaciones();

    // Suscripción a cambios en reservaciones
    const channelRes = supabase
      .channel('custom-all-channel-notif-res')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservaciones' },
        (payload) => {
          cargarNotificaciones();
        }
      )
      .subscribe();

    // Suscripción a cambios en habitaciones (cuando pasan a ocupadas)
    const channelHab = supabase
      .channel('custom-all-channel-notif-hab')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'habitaciones' },
        (payload) => {
          cargarNotificaciones();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelRes);
      supabase.removeChannel(channelHab);
    };
  }, [usuario]);

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

            {usuario && (
              <Nav.Link
                onClick={() => manejarNavegacion("/perfil")}
                className={mostrarMenu ? "color-texto-marca" : "text-dark"}
              >
                {mostrarMenu ? <i className="bi-person-circle me-2"></i> : null}
                <strong>Mi Perfil</strong>
              </Nav.Link>
            )}

            <hr />

            {/*Icono cerrar sesión en barra superior */}
            {mostrarMenu ? null : (
              <>


                <div className="d-flex align-items-center me-2">
                  <InstallPWAButton />
                </div>
              </>
            )}

            <hr />
          </Nav>

          {/* Botón de instalación PWA en menú móvil */}
          {mostrarMenu && (
            <div className="mt-auto pt-3">
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

        {/* Botones derechos */}
        <div className="d-flex align-items-center">
          


          {/* Botón de notificaciones */}
          {usuario && usuario.rol !== 'cliente' && !esLogin && !esCatalogo && (
            <div 
              className="position-relative me-3" 
              style={{ cursor: "pointer" }} 
              onClick={() => setMostrarNotificaciones(true)}
            >
              <i className="bi bi-bell-fill fs-4 text-dark"></i>
              {notificaciones.length > 0 && (
                <Badge
                  pill
                  bg="danger"
                  className="position-absolute top-0 start-100 translate-middle"
                  style={{ fontSize: "0.6rem" }}
                >
                  {notificaciones.length}
                </Badge>
              )}
            </div>
          )}

          {/* Botón del menú */}
          {!esLogin && (
            <Navbar.Toggle
              aria-controls="menu-offcanvas"
              onClick={manejarToggle}
            />
          )}
        </div>

        {/* Panel de Notificaciones */}
        <Offcanvas
          placement="end"
          show={mostrarNotificaciones}
          onHide={() => setMostrarNotificaciones(false)}
        >
          <Offcanvas.Header closeButton>
            <Offcanvas.Title>
              <i className="bi bi-bell-fill me-2" style={{ color: "#0F5C4F" }}></i>
              Notificaciones
            </Offcanvas.Title>
          </Offcanvas.Header>
          <Offcanvas.Body>
            {notificaciones.length === 0 ? (
              <p className="text-muted text-center mt-4">
                <i className="bi bi-bell-slash text-secondary fs-1 d-block mb-2"></i>
                No hay reservaciones activas.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {notificaciones.map(notif => (
                  <div 
                    key={notif.id_reservacion} 
                    className="p-3 bg-light rounded shadow-sm border-start border-4" 
                    style={{ cursor: "pointer", transition: "transform 0.2s", borderLeftColor: "#0F5C4F" }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    onClick={() => { setMostrarNotificaciones(false); manejarNavegacion("/reservaciones"); }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <h6 className="fw-bold mb-0 text-dark">
                        Hab. {notif.habitaciones?.numero} <span className="text-muted fw-normal">({notif.habitaciones?.tipo})</span>
                      </h6>
                      <Badge pill className="px-2" style={{ fontSize: '0.65rem', backgroundColor: "#0F5C4F" }}>Activa</Badge>
                    </div>
                    <p className="mb-1 small text-muted">
                      <strong>Cliente:</strong> {notif.clientes?.nombre} {notif.clientes?.apellido}
                    </p>
                    <p className="mb-0 small text-muted d-flex align-items-center">
                      <i className="bi bi-calendar-event me-1"></i>
                      {new Date(notif.fecha_inicio).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} 
                      <i className="bi bi-arrow-right mx-1"></i> 
                      {new Date(notif.fecha_fin).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Offcanvas.Body>
        </Offcanvas>

        {/*Menú lateral principal */}
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