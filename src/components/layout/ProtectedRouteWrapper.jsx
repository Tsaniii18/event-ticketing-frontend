import { useLocation, Navigate } from "react-router-dom";
import {
  getStoredUserRole,
  hasStoredUser,
} from "../../utils";
import { ROUTES } from "../../utils/constants/routeConstants";

const ProtectedRouteWrapper = ({
  children,
  allowedRoles = [],
  requireLogin = true
}) => {
  const location = useLocation();

  if (requireLogin && !hasStoredUser()) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(getStoredUserRole())) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default ProtectedRouteWrapper;
