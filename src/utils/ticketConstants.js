import {
  Ban,
  Check,
  CheckCircle,
  CheckCircle2,
  Clock,
  Timer,
  XCircle,
} from "lucide-react";

export const PREDEFINED_TICKET_CATEGORIES = [
  "Regular",
  "VIP",
  "VVIP",
  "Anak-anak",
  "Remaja",
  "Dewasa",
  "Early Bird",
  "Presale",
  "General Admission",
  "Student",
  "Senior",
];

export const TRANSACTION_STATUS_CONFIG = {
  paid: {
    label: "Berhasil",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle,
  },
  pending: {
    label: "Menunggu",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    dotColor: "bg-amber-500",
    icon: Clock,
  },
  failed: {
    label: "Gagal",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    icon: XCircle,
  },
  expired: {
    label: "Kadaluarsa",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    dotColor: "bg-gray-400",
    icon: Timer,
  },
  cancelled: {
    label: "Dibatalkan",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    dotColor: "bg-red-500",
    icon: Ban,
  },
};

export const TICKET_STATUS_CONFIG = {
  active: {
    label: "Aktif",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
    dotColor: "bg-emerald-500",
    icon: CheckCircle2,
    description: "Tiket siap digunakan",
  },
  used: {
    label: "Digunakan",
    bgColor: "bg-brand-50",
    textColor: "text-brand-700",
    borderColor: "border-brand-200",
    dotColor: "bg-brand-500",
    icon: Check,
    description: "Tiket sudah di check-in",
  },
  expired: {
    label: "Kadaluarsa",
    bgColor: "bg-gray-100",
    textColor: "text-gray-600",
    borderColor: "border-gray-300",
    dotColor: "bg-gray-400",
    icon: Timer,
    description: "Event sudah berakhir",
  },
};
