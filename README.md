# onYou

Fondasi aplikasi web menggunakan Next.js dengan App Router.

## Teknologi

- Next.js 16.3.4
- React 19
- TypeScript
- Tailwind CSS
- ESLint
- Struktur source code di dalam folder `src/`

## Menjalankan Project

Instal dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) pada browser.

## Pemeriksaan Kualitas

```bash
npm run lint
npm run build
```

Untuk menjalankan hasil production build:

```bash
npm run start
```

## Login dengan Google

Halaman login tersedia di `/login` dengan form identitas/password serta Google OAuth melalui Auth.js. Form identitas/password siap dihubungkan ke layanan akun pengguna; integrasi Google aktif setelah environment OAuth dikonfigurasi.

1. Salin `.env.example` menjadi `.env.local`.
2. Isi `AUTH_SECRET`, `AUTH_GOOGLE_ID`, dan `AUTH_GOOGLE_SECRET`.
3. Tambahkan callback URL berikut di Google Cloud Console:

```text
http://localhost:3000/api/auth/callback/google
```

Gunakan domain aplikasi sebagai pengganti `http://localhost:3000` pada lingkungan production. Jangan commit file `.env.local` atau kredensial OAuth.
