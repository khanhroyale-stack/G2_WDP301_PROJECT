import { Navigate } from "react-router-dom";

export default function UserRoute({ children }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
