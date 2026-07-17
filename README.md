# Tikeria Frontend

Frontend aplikasi ticketing event Tikeria. Aplikasi ini menyediakan pencarian dan pengelolaan event, pembelian serta pemeriksaan tiket, laporan, dan halaman administrasi sesuai peran pengguna.

## Kebutuhan

- Node.js 20 atau lebih baru
- npm
- Backend Tikeria yang dapat diakses melalui URL API

## Menjalankan Project

```bash
npm install
cp .env.example .env
npm run dev
```

Vite akan menampilkan alamat development server pada terminal.

## Environment Variable

```env
VITE_API_BASE_URL=http://localhost:3000
```

`VITE_API_BASE_URL` adalah base URL backend Tikeria. Sesuaikan nilainya jika backend berjalan pada host atau port yang berbeda.

## Perintah

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

- `dev`: menjalankan development server.
- `lint`: memeriksa kualitas kode dengan ESLint.
- `build`: membuat production build ke folder `dist`.
- `preview`: menjalankan hasil production build secara lokal.

## Struktur Utama

```text
src/
├── components/  Komponen umum dan komponen fitur
├── hooks/       Custom hooks
├── pages/       Halaman berdasarkan fitur
├── services/    API client dan service backend
├── utils/       Konstanta dan fungsi utilitas
├── routes.jsx   Konfigurasi route
└── index.css    Styling global
```

Konfigurasi API berada di `src/services/http.js`. Token dan data sesi pengguna disimpan pada `sessionStorage` selama aplikasi digunakan.
