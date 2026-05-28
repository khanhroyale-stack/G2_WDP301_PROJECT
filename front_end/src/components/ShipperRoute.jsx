import { Navigate } from "react-router-dom";

export default function ShipperRoute({ children }) {
  const token = localStorage.getItem("token");
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  if (!token || !user || String(user.role).toLowerCase() !== "shipper") {
    return <Navigate to="/" replace />;
  }

  return children;
}
