import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = () => {
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);
};

export default PrivateRoute;
