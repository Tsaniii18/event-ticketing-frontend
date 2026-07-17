import { UserCheck, UserSearch, UserX } from "lucide-react";

export const EVENT_OWNER_STATUS_LABELS = {
  pending: "Ditinjau",
  rejected: "Ditolak",
  approved: "Diterima",
  active: "Berlangsung",
  endeed: "Selesai",
};

export const EVENT_DETAIL_STATUS_LABELS = {
  approved: "Disetujui",
  rejected: "Ditolak",
  pending: "Menunggu Verifikasi",
  active: "Sedang Berlangsung",
  ended: "Berakhir",
};

export const EDIT_EVENT_STATUS_STYLES = {
  pending: { bg: "ui-badge-warning", text: "" },
  rejected: { bg: "ui-badge-danger", text: "" },
  approved: { bg: "ui-badge-success", text: "" },
  published: { bg: "ui-badge-info", text: "" },
};

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
