import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Spinner from './Spinner';

export default function PrivateRoute({ children }) {
  const { user, loading, isAuthenticated, error } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!loading && !isAuthenticated) {
        toast.error("Debes iniciar sesión para acceder a esta página");
        router.replace("/login");
      }
      if (error) {
        toast.error(error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [loading, isAuthenticated, error, router]);

  if (loading) {
    return <Spinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}