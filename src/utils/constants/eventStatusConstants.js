import {
  CheckCircle,
  Clock,
  Flag,
  PlayCircle,
  XCircle,
} from "lucide-react";

export const EVENT_OWNER_STATUS_LABELS = {
  pending: "Ditinjau",
  rejected: "Ditolak",
  approved: "Diterima",
  active: "Berlangsung",
  ended: "Selesai",
};

export const EVENT_OWNER_STATUS_STYLES = {
  active: "ui-badge-success",
  approved: "ui-badge-success",
  ended: "bg-gray-100 text-gray-700 border border-gray-300",
  pending: "ui-badge-warning",
  rejected: "ui-badge-danger",
};

export const EVENT_DETAIL_STATUS_LABELS = {
  approved: "Disetujui",
  rejected: "Ditolak",
  pending: "Menunggu Verifikasi",
  active: "Sedang Berlangsung",
  ended: "Berakhir",
};

export const EVENT_DETAIL_STATUS_CONFIG = {
  active: {
    className: "ui-badge-success",
    icon: PlayCircle,
    iconClassName: "text-emerald-600",
  },
  approved: {
    className: "ui-badge-success",
    icon: CheckCircle,
    iconClassName: "text-green-600",
  },
  ended: {
    className: "bg-gray-100 text-gray-700 border border-gray-300",
    icon: Flag,
    iconClassName: "text-gray-600",
  },
  pending: {
    className: "ui-badge-warning",
    icon: Clock,
    iconClassName: "text-yellow-600",
  },
  rejected: {
    className: "ui-badge-danger",
    icon: XCircle,
    iconClassName: "text-red-600",
  },
};

export const EDIT_EVENT_STATUS_STYLES = {
  pending: { bg: "ui-badge-warning", text: "" },
  rejected: { bg: "ui-badge-danger", text: "" },
  approved: { bg: "ui-badge-success", text: "" },
  published: { bg: "ui-badge-info", text: "" },
};
