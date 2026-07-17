import { AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";

export const FEEDBACK_CATEGORIES = [
  { value: "technical", label: "Masalah Teknis" },
  { value: "payment", label: "Masalah Pembayaran" },
  { value: "event", label: "Masalah Event" },
  { value: "account", label: "Masalah Akun" },
  { value: "suggestion", label: "Saran" },
  { value: "other", label: "Lainnya" },
];

export const FEEDBACK_STATUS_CONFIG = {
  waiting: {
    label: "Menunggu",
    className: "border-warning-100 bg-warning-50 text-warning-700",
    icon: Clock,
  },
  processed: {
    label: "Diproses",
    className: "border-brand-200 bg-brand-50 text-brand-700",
    icon: AlertCircle,
  },
  completed: {
    label: "Selesai",
    className: "border-success-100 bg-success-50 text-success-700",
    icon: CheckCircle,
  },
  rejected: {
    label: "Ditolak",
    className: "border-danger-100 bg-danger-50 text-danger-700",
    icon: XCircle,
  },
};
