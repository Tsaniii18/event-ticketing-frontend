import { useLocation, Navigate } from "react-router";
import {
  getStoredUserRole,
  hasStoredUser,
} from "../../utils";

const ProtectedRouteWrapper = ({
  children,
  allowedRoles = [],
  requireLogin = true
}) => {
  const location = useLocation();

  if (requireLogin && !hasStoredUser()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(getStoredUserRole())) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRouteWrapper;
