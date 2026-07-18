import { UserCheck, UserSearch, UserX } from "lucide-react";

export const USER_VERIFICATION_STATUS_CONFIG = {
  pending: {
    className: "ui-badge-warning",
    text: "Menunggu",
    icon: UserSearch,
  },
  rejected: {
    className: "ui-badge-danger",
    text: "Ditolak",
    icon: UserX,
  },
  approved: {
    className: "ui-badge-success",
    text: "Disetujui",
    icon: UserCheck,
  },
};

export const USER_VERIFICATION_STATUS_LABELS = {
  pending: "Menunggu",
  rejected: "Ditolak",
  approved: "Disetujui",
};
