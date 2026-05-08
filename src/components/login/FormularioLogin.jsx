import React, { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";

const FormularioLogin = ({ usuario, contrasena, error, setUsuario, setContrasena, iniciarSesion }) => {
  const [verPassword, setVerPassword] = useState(false);

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
          className="w-100 shadow-lg"
        >
          Iniciar
        </Button>
      </Form>

      <style>{`
        .custom-placeholder::placeholder { color: rgba(255,255,255,0.7); }
        .form-control:focus { 
          background-color: rgba(255, 255, 255, 0.25) !important; 
          box-shadow: none !important; 
          color: white !important; 
        }
      `}</style>
    </div>
  );
};

export default FormularioLogin;