import { Shield } from "lucide-react";
import {
  ORGANIZER_STATUS_CONFIG,
  USER_ROLE_CONFIG,
} from "../constants/userConstants";

export const getUserRoleConfig = (role) =>
  USER_ROLE_CONFIG[role] || USER_ROLE_CONFIG.user;

export const getUserRoleLabel = (role, compact = false) => {
  const config = getUserRoleConfig(role);
  return compact ? config.shortLabel : config.label;
};

export const getOrganizerStatusConfig = (status) =>
  ORGANIZER_STATUS_CONFIG[status] || {
    color: "bg-gray-100 text-gray-800 border-gray-200",
    icon: Shield,
    text: status,
  };

export const filterVerificationUsers = (
  users,
  { searchTerm = "", status = "all" } = {},
) => {
  const query = searchTerm.toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      !query ||
      [user.name, user.email, user.username].some((value) =>
        value?.toLowerCase().includes(query),
      );
    const matchesStatus =
      status === "all" || user.register_status === status;

    return matchesSearch && matchesStatus;
  });
};

export const buildProfileFormData = (user, profile) => {
  const formData = new FormData();

  if (user.role === "user" || user.role === "organizer") {
    formData.append("name", profile.name);
    formData.append("email", profile.email);
    if (profile.password) formData.append("password", profile.password);
    if (profile.profile_pict) {
      formData.append("profile_pict", profile.profile_pict);
    }
  }

  if (user.role === "admin" && profile.password) {
    formData.append("password", profile.password);
  }

  return formData;
};
