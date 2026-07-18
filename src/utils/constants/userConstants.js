import {
  CheckCircle,
  Clock,
  Crown,
  Star,
  Users,
  XCircle,
} from "lucide-react";

export const USER_ROLE_CONFIG = {
  admin: {
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: Crown,
    label: "Administrator",
    shortLabel: "Administrator",
  },
  organizer: {
    color: "bg-purple-100 text-purple-700 border-purple-200",
    icon: Star,
    label: "Event Organizer",
    shortLabel: "Organizer",
  },
  user: {
    color: "bg-brand-100 text-brand-700 border-brand-200",
    icon: Users,
    label: "User",
    shortLabel: "User",
  },
};

export const ORGANIZER_STATUS_CONFIG = {
  approved: {
    color: "ui-badge-success",
    icon: CheckCircle,
    text: "Terverifikasi",
  },
  pending: {
    color: "ui-badge-warning",
    icon: Clock,
    text: "Menunggu Verifikasi",
  },
  rejected: {
    color: "ui-badge-danger",
    icon: XCircle,
    text: "Ditolak",
  },
};
