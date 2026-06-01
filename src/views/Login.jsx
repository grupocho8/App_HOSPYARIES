import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormularioLogin from "../components/login/FormularioLogin";
import { useAuth } from "../components/context/AuthContext";
import { supabase } from "../database/supabaseconfig";
import '../App.css';

const Login = () => {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState(null);
  const navegar = useNavigate();
  const { login } = useAuth();

const iniciarSesion = async () => {
  try {
    setError(null);

    await login(usuario, contrasena);

    navegar("/");
  } catch (err) {
    setError("Usuario o contraseña incorrectos");
    console.error(err);
  }
};

  // 1. Tu useEffect original (Redirección si ya hay sesión)
 const { usuario: usuarioActivo } = useAuth();

useEffect(() => {
  if (usuarioActivo) {
    navegar("/");
  }
}, [usuarioActivo, navegar]);

  // 2. NUEVO useEffect: Detector de tecla Enter
  useEffect(() => {
    const detectarEnter = (evento) => {
      if (evento.key === "Enter") {
        iniciarSesion(); // Llama a tu función de login
      }
    };

    // Le decimos al navegador que escuche cuando se presiona una tecla
    window.addEventListener("keydown", detectarEnter);

    // IMPORTANTE: Limpiamos el evento cuando salimos de la pantalla de Login
    // Esto evita que el Enter intente iniciar sesión cuando ya estás en otra página
    return () => {
      window.removeEventListener("keydown", detectarEnter);
    };
    
    // El "arreglo de dependencias" [usuario, contrasena] asegura que 
    // el Enter use los datos más recientes que escribiste.
  }, [usuario, contrasena]); 

  const estiloContenedor = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #2F8F84 0%, #9FC9C3 100%)",
    padding: "20px",
  };

  return (
    <div style={estiloContenedor}>
      <FormularioLogin
        usuario={usuario}
        contrasena={contrasena}
        error={error}
        setUsuario={setUsuario}
        setContrasena={setContrasena}
        iniciarSesion={iniciarSesion}
      />
    </div>
  );
};

export default Login;