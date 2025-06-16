import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const isAuthenticated = !!user && !!token;
  const API_URL = "http://localhost:5500/api";

  useEffect(() => {
    const loadUser = async () => {
      const savedToken = localStorage.getItem("token");
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        if (!res.ok) throw new Error("No autorizado");
        const data = await res.json();
        setUser({ ...data, role: data.role });
        setToken(savedToken);
      } catch (error) {
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
        toast.error("Sesión expirada, por favor inicia sesión de nuevo.");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = useCallback(async (email, password) => {
    setLoginLoading(true);
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          toast.error("Credenciales incorrectas");
        } else {
          toast.error("Error al iniciar sesión");
        }
        return false;
      }
      const data = await res.json();
      const { access_token } = data;
      localStorage.setItem("token", access_token);

      const profileRes = await fetch(`${API_URL}/profile`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!profileRes.ok) throw new Error("No autorizado");
      const userData = await profileRes.json();
      setUser(userData);
      setToken(access_token);
      toast.success("¡Bienvenido!");
      return true;
    } catch (error) {
      toast.error(error.message);
      return false;
    } finally {
      setLoginLoading(false);
    }
  }, []);

  const register = useCallback(async (name, email, password) => {
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al registrar");
        return false;
      }

      toast.success("¡Registro exitoso!");

      return await login(email, password);
    } catch (error) {
      toast.error("Error al registrar: " + error.message);
      return false;
    }
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    toast.success("Sesión cerrada con éxito");
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, loginLoading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}