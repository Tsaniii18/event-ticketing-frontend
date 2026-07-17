import {
  Baby,
  Briefcase,
  Cpu,
  Dumbbell,
  GraduationCap,
  Heart,
  Moon,
  Mountain,
  Music,
  Palette,
  Sparkles,
  Ticket,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export const CATEGORY_DATA = {
  Hiburan: {
    icon: Music,
    color: "bg-purple-500",
    hoverColor: "hover:bg-purple-600",
    textColor: "text-purple-600",
    bgLight: "bg-purple-50",
  },
  Teknologi: {
    icon: Cpu,
    color: "bg-brand-500",
    hoverColor: "hover:bg-brand-600",
    textColor: "text-brand-600",
    bgLight: "bg-brand-50",
  },
  Edukasi: {
    icon: GraduationCap,
    color: "bg-cyan-500",
    hoverColor: "hover:bg-cyan-600",
    textColor: "text-cyan-600",
    bgLight: "bg-cyan-50",
  },
  Olahraga: {
    icon: Dumbbell,
    color: "bg-green-500",
    hoverColor: "hover:bg-green-600",
    textColor: "text-green-600",
    bgLight: "bg-green-50",
  },
  "Bisnis & Profesional": {
    icon: Briefcase,
    color: "bg-amber-500",
    hoverColor: "hover:bg-amber-600",
    textColor: "text-amber-600",
    bgLight: "bg-amber-50",
  },
  "Seni & Budaya": {
    icon: Palette,
    color: "bg-pink-500",
    hoverColor: "hover:bg-pink-600",
    textColor: "text-pink-600",
    bgLight: "bg-pink-50",
  },
  Komunitas: {
    icon: Users,
    color: "bg-indigo-500",
    hoverColor: "hover:bg-indigo-600",
    textColor: "text-indigo-600",
    bgLight: "bg-indigo-50",
  },
  Kuliner: {
    icon: UtensilsCrossed,
    color: "bg-orange-500",
    hoverColor: "hover:bg-orange-600",
    textColor: "text-orange-600",
    bgLight: "bg-orange-50",
  },
  Kesehatan: {
    icon: Heart,
    color: "bg-red-500",
    hoverColor: "hover:bg-red-600",
    textColor: "text-red-600",
    bgLight: "bg-red-50",
  },
  "Agama & Spiritual": {
    icon: Moon,
    color: "bg-teal-500",
    hoverColor: "hover:bg-teal-600",
    textColor: "text-teal-600",
    bgLight: "bg-teal-50",
  },
  "Travel & Outdoor": {
    icon: Mountain,
    color: "bg-emerald-500",
    hoverColor: "hover:bg-emerald-600",
    textColor: "text-emerald-600",
    bgLight: "bg-emerald-50",
  },
  "Keluarga & Anak": {
    icon: Baby,
    color: "bg-rose-500",
    hoverColor: "hover:bg-rose-600",
    textColor: "text-rose-600",
    bgLight: "bg-rose-50",
  },
  "Fashion & Beauty": {
    icon: Sparkles,
    color: "bg-fuchsia-500",
    hoverColor: "hover:bg-fuchsia-600",
    textColor: "text-fuchsia-600",
    bgLight: "bg-fuchsia-50",
  },
};

export const DEFAULT_CATEGORY_DATA = {
  icon: Ticket,
  color: "bg-gray-500",
  hoverColor: "hover:bg-gray-600",
  textColor: "text-gray-600",
  bgLight: "bg-gray-50",
};

export const CATEGORIES = {
  Hiburan: [
    "Musik",
    "Konser",
    "Festival",
    "Stand Up Comedy",
    "Film",
    "Teater",
    "K-Pop",
    "Dance Performance",
  ],
  Teknologi: [
    "Konferensi Teknologi",
    "Workshop IT",
    "Startup",
    "Software Development",
    "Artificial Intelligence",
    "Data Science",
    "Cybersecurity",
    "Gaming & Esports",
  ],
  Edukasi: [
    "Seminar",
    "Workshop",
    "Pelatihan",
    "Webinar",
    "Bootcamp",
    "Kelas Online",
    "Literasi Digital",
    "Kelas Bisnis",
  ],
  Olahraga: [
    "Marathon",
    "Fun Run",
    "Sepak Bola",
    "Badminton",
    "Gym & Fitness",
    "Yoga",
    "Esport",
    "Cycling Event",
  ],
  "Bisnis & Profesional": [
    "Konferensi Bisnis",
    "Networking",
    "Karir",
    "Entrepreneurship",
    "Leadership",
    "Startup Meetup",
    "Investor & Pitching",
  ],
  "Seni & Budaya": [
    "Pameran Seni",
    "Pentas Budaya",
    "Fotografi",
    "Seni Rupa",
    "Crafting",
    "Pameran Museum",
    "Fashion Show",
  ],
  Komunitas: [
    "Kegiatan Relawan",
    "Kegiatan Sosial",
    "Gathering Komunitas",
    "Komunitas Hobi",
    "Meetup",
    "Charity Event",
  ],
  Kuliner: [
    "Festival Kuliner",
    "Food Tasting",
    "Workshop Memasak",
    "Street Food Event",
  ],
  Kesehatan: [
    "Seminar Kesehatan",
    "Medical Check Event",
    "Workshop Kesehatan Mental",
    "Donor Darah",
  ],
  "Agama & Spiritual": [
    "Kajian",
    "Retreat",
    "Pengajian",
    "Event Keagamaan",
    "Meditasi",
  ],
  "Travel & Outdoor": [
    "Camping",
    "Hiking",
    "Trip Wisata",
    "Outdoor Gathering",
    "Photography Trip",
  ],
  "Keluarga & Anak": [
    "Family Gathering",
    "Event Anak",
    "Workshop Parenting",
    "Pentas Anak",
  ],
  "Fashion & Beauty": [
    "Fashion Expo",
    "Beauty Class",
    "Makeup Workshop",
    "Brand Launching",
  ],
};

export const CATEGORY_COLORS = Object.fromEntries(
  Object.entries(CATEGORY_DATA).map(([category, data]) => [category, data.color]),
);

CATEGORY_COLORS.Lainnya = DEFAULT_CATEGORY_DATA.color;

export const YOGYAKARTA_DISTRICTS = [
  "Tegalrejo",
  "Jetis",
  "Gondokusuman",
  "Danurejan",
  "Gedongtengen",
  "Ngampilan",
  "Wirobrajan",
  "Mantrijeron",
  "Kraton",
  "Gondomanan",
  "Pakualaman",
  "Mergangsan",
  "Umbulharjo",
  "Kotagede",
];

export const EXTENDED_DISTRICTS = [
  ...YOGYAKARTA_DISTRICTS,
  "Banguntapan",
  "Sewon",
  "Kasihan",
  "Pandak",
  "Pleret",
  "Bantul",
  "Imogiri",
  "Sanden",
  "Pundong",
  "Kretek",
];

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const DAY_NAMES_FULL = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
];

export const EVENTS_PER_PAGE = 10;

export const SCROLLBAR_HIDE_STYLE = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
`;
