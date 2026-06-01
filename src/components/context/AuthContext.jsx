import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { supabase } from "../../database/supabaseconfig";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [usuario, setUsuario] = useState(null);
  const [permisos, setPermisos] = useState({});
  const [loading, setLoading] = useState(true);

  // Cargar sesión al iniciar
  useEffect(() => {

    const cargarSesion = async () => {

      try {

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user?.email) {
          setLoading(false);
          return;
        }

        const { data: empleado } = await supabase
          .from("empleados")
          .select("*")
          .eq("email", session.user.email)
          .single();

        if (!empleado) {
          setLoading(false);
          return;
        }

        const { data: permisosRol } = await supabase
          .from("permisos")
          .select("permisos")
          .eq("rol", empleado.tipo_empleado)
          .single();

        setUsuario(empleado);

        setPermisos(
          permisosRol?.permisos || {}
        );
        console.log("PERMISOS CARGADOS:", permisosRol);

      } catch (error) {

        console.error(
          "Error cargando sesión:",
          error
        );

      } finally {

        setLoading(false);
      }
    };

    cargarSesion();

  }, []);

  // LOGIN
  const login = async (
    email,
    password
  ) => {

    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) throw error;

    const { data: empleado } =
      await supabase
        .from("empleados")
        .select("*")
        .eq("email", email)
        .single();

    if (!empleado) {

      throw new Error(
        "Empleado no encontrado"
      );
    }

    const { data: permisosRol } =
      await supabase
        .from("permisos")
        .select("permisos")
        .eq(
          "rol",
          empleado.tipo_empleado
        )
        .single();

    setUsuario(empleado);

    setPermisos(
      permisosRol?.permisos || {}
    );

    return empleado;
  };

  // LOGOUT
  const logout = async () => {

    await supabase.auth.signOut();

    setUsuario(null);
    setPermisos({});
  };

  // VALIDAR PERMISOS
  const tienePermiso = (
    permiso
  ) => {

    return permisos?.[permiso] === true;
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        permisos,
        tienePermiso,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);