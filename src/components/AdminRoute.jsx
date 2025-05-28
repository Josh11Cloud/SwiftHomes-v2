import { useRouter } from 'next/router';
import { useAuth } from "../context/AuthContext";
import Spinner from './Spinner'

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return <Spinner />;

  if (!user || user.role !== "admin") {
    router.replace("/");
    return null;
  }

  return children;
}

export default AdminRoute;
