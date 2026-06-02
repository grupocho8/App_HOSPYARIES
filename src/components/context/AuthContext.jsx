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
          .maybeSingle();

        let usuarioData = empleado;
        let esCliente = false;

        if (!empleado) {
          const { data: cliente } = await supabase
            .from("clientes")
            .select("*")
            .eq("email", session.user.email)
            .maybeSingle();

          if (!cliente) {
            setLoading(false);
            return;
          }
          usuarioData = { ...cliente, rol: "cliente" };
          esCliente = true;
        }

        if (!esCliente) {
          const { data: permisosRol } = await supabase
            .from("permisos")
            .select("permisos")
            .eq("rol", empleado.tipo_empleado)
            .single();

          setPermisos(permisosRol?.permisos || {});
          console.log("PERMISOS CARGADOS:", permisosRol);
        } else {
          setPermisos({});
        }

        setUsuario(usuarioData);

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
        .maybeSingle();

    let usuarioData = empleado;
    let esCliente = false;

    if (!empleado) {
      const { data: cliente } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (!cliente) {
        throw new Error(
          "Usuario no encontrado"
        );
      }
      usuarioData = { ...cliente, rol: "cliente" };
      esCliente = true;
    }

    if (!esCliente) {
      const { data: permisosRol } =
        await supabase
          .from("permisos")
          .select("permisos")
          .eq(
            "rol",
            empleado.tipo_empleado
          )
          .single();

      setPermisos(permisosRol?.permisos || {});
    } else {
      setPermisos({});
    }

    setUsuario(usuarioData);

    return usuarioData;
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