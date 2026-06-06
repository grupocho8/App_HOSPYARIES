import React, { useState } from "react";
import { Form, Button, InputGroup, Alert, Modal } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const FormularioLogin = ({ usuario, contrasena, error, setUsuario, setContrasena, iniciarSesion, cambiarVista, continuarComoInvitado }) => {
  const [verPassword, setVerPassword] = useState(false);
  const [mostrarModalRecuperar, setMostrarModalRecuperar] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState({ tipo: "", texto: "" });
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);

  const manejarRecuperacion = async () => {
    if (!correoRecuperacion) {
      setMensajeRecuperacion({ tipo: "danger", texto: "Por favor ingresa un correo electrónico." });
      return;
    }
    setEnviandoRecuperacion(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(correoRecuperacion);
      if (error) throw error;
      setMensajeRecuperacion({ tipo: "success", texto: "Se ha enviado un enlace de recuperación a tu correo." });
    } catch (err) {
      setMensajeRecuperacion({ tipo: "danger", texto: "Error al enviar el enlace. Verifica que el correo sea correcto." });
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "50px",
    color: "white",
    height: "55px",
    paddingLeft: "20px",
    fontSize: "16px"
  };

  const circleIconStyle = {
    backgroundColor: "white",
    borderRadius: "50%",
    width: "55px",
    height: "55px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "#0F5C4F",
    zIndex: 10,
    cursor: "pointer", // Para que parezca un botón
    border: "none",
    padding: 0
  };

  return (
    <div style={{ width: "100%", maxWidth: "380px", textAlign: "center" }}>
      <h1 style={{ color: "white", fontWeight: "800", marginBottom: "40px", letterSpacing: "2px" }}>
        Iniciar Sesión
      </h1>

      {error && <Alert variant="danger" style={{borderRadius: "20px"}}>{error}</Alert>}

      <Form>
        {/* Input Usuario */}
        <InputGroup className="mb-4" style={{ alignItems: "center" }}>
          <div style={circleIconStyle}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          </div>
          <Form.Control
            placeholder="Ingresa tu usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{ ...inputStyle, marginLeft: "-27px", paddingLeft: "40px" }}
            className="custom-placeholder"
          />
        </InputGroup>

        {/* Input Contraseña con el Ojito */}
        <InputGroup className="mb-5" style={{ alignItems: "center" }}>
          <Form.Control
            type={verPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            style={{ ...inputStyle, marginRight: "-27px", paddingRight: "40px" }}
            className="custom-placeholder"
          />
          <button 
            type="button" 
            onClick={() => setVerPassword(!verPassword)} 
            style={circleIconStyle}
          >
            {verPassword ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
            )}
          </button>
        </InputGroup>

        <Button 
          onClick={iniciarSesion}
          style={{ 
            backgroundColor: "white", 
            color: "#0F5C4F", 
            border: "none",
            borderRadius: "50px",
            height: "55px",
            fontWeight: "900",
            fontSize: "18px",
            letterSpacing: "1px"
          }} 
          className="w-100 shadow-lg mb-3"
        >
          Iniciar
        </Button>

        <p style={{color: "rgba(255,255,255,0.8)", cursor: "pointer", textDecoration: "underline", marginTop: "10px", fontSize: "14px"}} onClick={() => setMostrarModalRecuperar(true)}>
          ¿Olvidaste tu contraseña?
        </p>

        <p style={{color: "white", cursor: "pointer", textDecoration: "underline", marginTop: "15px"}} onClick={cambiarVista}>
          ¿No tienes cuenta? Regístrate aquí
        </p>

        <p style={{color: "rgba(255,255,255,0.8)", cursor: "pointer", fontSize: "14px", marginTop: "10px", fontWeight: "bold"}} onClick={continuarComoInvitado}>
          <i className="bi-box-arrow-in-right me-1"></i> Continuar como invitado (Ver Catálogo)
        </p>
      </Form>

      <style>{`
        .custom-placeholder::placeholder { color: rgba(255,255,255,0.7); }
        .form-control:focus { 
          background-color: rgba(255, 255, 255, 0.25) !important; 
          box-shadow: none !important; 
          color: white !important; 
        }
      `}</style>

      {/* Modal de Recuperación de Contraseña */}
      <Modal show={mostrarModalRecuperar} onHide={() => setMostrarModalRecuperar(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#0F5C4F", fontWeight: "bold" }}>Recuperar Contraseña</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3">
            Ingresa el correo electrónico asociado a tu cuenta y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>
          {mensajeRecuperacion.texto && (
            <Alert variant={mensajeRecuperacion.tipo}>{mensajeRecuperacion.texto}</Alert>
          )}
          <Form.Group>
            <Form.Control
              type="email"
              placeholder="tu@correo.com"
              value={correoRecuperacion}
              onChange={(e) => setCorreoRecuperacion(e.target.value)}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModalRecuperar(false)}>
            Cerrar
          </Button>
          <Button 
            style={{ backgroundColor: "#0F5C4F", borderColor: "#0F5C4F" }} 
            onClick={manejarRecuperacion}
            disabled={enviandoRecuperacion}
          >
            {enviandoRecuperacion ? "Enviando..." : "Enviar enlace"}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default FormularioLogin;