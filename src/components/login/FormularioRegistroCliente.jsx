import React, { useState } from "react";
import { Form, Button, InputGroup, Alert } from "react-bootstrap";
import { supabase } from "../../database/supabaseconfig";

const FormularioRegistroCliente = ({ cambiarVista }) => {
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    apellido: "",
    cedula: "",
    telefono: "",
    email: "",
    contrasena: "",
  });
  const [verPassword, setVerPassword] = useState(false);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(false);
  const [cargando, setCargando] = useState(false);

  const manejoCambioInput = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "nombre" || name === "apellido") {
      // Solo permite letras y espacios, elimina números y caracteres especiales
      newValue = value.replace(/[0-9]/g, "");
    } else if (name === "telefono") {
      // Solo permite números
      newValue = value.replace(/[^0-9]/g, "");
    } else if (name === "cedula") {
      // Convierte a mayúscula para la letra final
      newValue = value.toUpperCase();
    }

    setNuevoCliente((prev) => ({ ...prev, [name]: newValue }));
  };

  const registrarCliente = async () => {
    try {
      setError(null);
      setCargando(true);

      if (
        !nuevoCliente.nombre.trim() ||
        !nuevoCliente.apellido.trim() ||
        !nuevoCliente.cedula.trim() ||
        !nuevoCliente.telefono.trim() ||
        !nuevoCliente.email.trim() ||
        !nuevoCliente.contrasena.trim()
      ) {
        throw new Error("Por favor, completa todos los campos requeridos.");
      }

      const regexCedula = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
      if (!regexCedula.test(nuevoCliente.cedula)) {
        throw new Error("El formato de la cédula es incorrecto (Ej. 000-000000-0000A).");
      }

      if (nuevoCliente.telefono.length < 8) {
        throw new Error("El teléfono debe tener al menos 8 dígitos.");
      }

      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(nuevoCliente.email)) {
        throw new Error("El correo electrónico no es válido (Ej. usuario@gmail.com).");
      }

      if (nuevoCliente.contrasena.length < 8) {
        throw new Error("La contraseña debe tener al menos 8 caracteres.");
      }

      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: nuevoCliente.email,
        password: nuevoCliente.contrasena,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Error desconocido al crear la cuenta.");
      }

      // 2. Insertar en tabla clientes
      const { error: dbError } = await supabase.from("clientes").insert([
        {
          id_cliente: authData.user.id,
          nombre: nuevoCliente.nombre,
          apellido: nuevoCliente.apellido,
          cedula: nuevoCliente.cedula,
          telefono: nuevoCliente.telefono,
          email: nuevoCliente.email,
          fecha_registro: new Date().toISOString(),
        },
      ]);

      if (dbError) throw dbError;

      setExito(true);
      setTimeout(() => {
        cambiarVista(); // Volver al login
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message || "Error al registrar el cliente.");
    } finally {
      setCargando(false);
    }
  };

  const inputStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "10px",
    color: "white",
    padding: "12px",
    fontSize: "16px",
    marginBottom: "15px"
  };

  return (
    <div style={{ width: "100%", maxWidth: "450px", textAlign: "center" }}>
      <h2 style={{ color: "white", fontWeight: "800", marginBottom: "30px", letterSpacing: "1px" }}>
        Registrarse como Cliente
      </h2>

      {error && <Alert variant="danger" style={{borderRadius: "10px"}}>{error}</Alert>}
      {exito && <Alert variant="success" style={{borderRadius: "10px"}}>¡Registro exitoso! Redirigiendo al login...</Alert>}

      <Form>
        <div className="d-flex gap-2">
          <Form.Control
            placeholder="Nombre"
            name="nombre"
            value={nuevoCliente.nombre}
            onChange={manejoCambioInput}
            style={inputStyle}
            className="custom-placeholder"
          />
          <Form.Control
            placeholder="Apellido"
            name="apellido"
            value={nuevoCliente.apellido}
            onChange={manejoCambioInput}
            style={inputStyle}
            className="custom-placeholder"
          />
        </div>

        <Form.Control
          placeholder="Cédula"
          name="cedula"
          value={nuevoCliente.cedula}
          onChange={manejoCambioInput}
          style={inputStyle}
          className="custom-placeholder"
        />

        <Form.Control
          placeholder="Teléfono"
          name="telefono"
          value={nuevoCliente.telefono}
          onChange={manejoCambioInput}
          style={inputStyle}
          className="custom-placeholder"
        />

        <Form.Control
          type="email"
          placeholder="Correo Electrónico (Ej. juan@gmail.com)"
          name="email"
          value={nuevoCliente.email}
          onChange={manejoCambioInput}
          style={inputStyle}
          className="custom-placeholder"
        />

        <InputGroup className="mb-4" style={{ alignItems: "center" }}>
          <Form.Control
            type={verPassword ? "text" : "password"}
            placeholder="Contraseña (mínimo 8 caracteres)"
            name="contrasena"
            value={nuevoCliente.contrasena}
            onChange={manejoCambioInput}
            style={{ ...inputStyle, marginBottom: 0 }}
            className="custom-placeholder"
          />
          <Button 
            variant="light"
            onClick={() => setVerPassword(!verPassword)} 
            style={{ borderTopRightRadius: "10px", borderBottomRightRadius: "10px", backgroundColor: "white", color: "#0F5C4F" }}
          >
            {verPassword ? <i className="bi-eye-slash"></i> : <i className="bi-eye"></i>}
          </Button>
        </InputGroup>

        <Button 
          onClick={registrarCliente}
          disabled={cargando}
          style={{ 
            backgroundColor: "white", 
            color: "#0F5C4F", 
            border: "none",
            borderRadius: "50px",
            height: "50px",
            fontWeight: "900",
            fontSize: "16px",
            letterSpacing: "1px"
          }} 
          className="w-100 shadow-lg mb-3"
        >
          {cargando ? "Registrando..." : "Registrar"}
        </Button>
        
        <p style={{color: "white", cursor: "pointer", textDecoration: "underline"}} onClick={cambiarVista}>
          ¿Ya tienes cuenta? Inicia sesión aquí
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
    </div>
  );
};

export default FormularioRegistroCliente;
