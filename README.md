# Aplikasi Notifikasi Real-time

Aplikasi sederhana untuk demonstrasi notifikasi real-time menggunakan:
- **Backend**: Hapi.js + Socket.IO
- **Frontend**: React + Socket.IO Client

## Fitur
- Dua user dapat terhubung secara bersamaan
- User yang melakukan "Edit Data" akan memberitahu user lain secara real-time
- Notifikasi ditampilkan dengan timestamp dan informasi pengirim

## Cara Menjalankan

### 1. Setup Backend

```bash
# Buat folder backend
mkdir notifikasi-backend
cd notifikasi-backend

# Salin file backend
# - backend.js
# - package.json (gunakan file package.json yang ada)

# Install dependencies
npm install

# Jalankan server
npm start
```

Server akan berjalan di `http://localhost:3000`

### 2. Setup Frontend

```bash
# Buat folder frontend
mkdir notifikasi-frontend
cd notifikasi-frontend

# Salin file frontend
# - src/App.js (gunakan konten dari frontend-app.js)
# - src/index.js (gunakan konten dari frontend-index.js)
# - public/index.html (gunakan konten dari index.html)
# - package.json (gunakan konten dari package-frontend.json)

# Install dependencies
npm install

# Jalankan aplikasi React
npm start
```

Aplikasi akan berjalan di `http://localhost:3001`

### 3. Testing

1. Pastikan backend berjalan di port 3000
2. Buka aplikasi React di 2 tab browser berbeda
3. Klik tombol "Edit Data" di salah satu tab
4. Lihat notifikasi muncul di tab lainnya secara real-time

## Struktur File

### Backend Files:
- `backend.js` - Server Hapi.js dengan Socket.IO
- `package.json` - Dependencies backend

### Frontend Files:
- `frontend-app.js` - Komponen React utama (copy ke src/App.js)
- `frontend-index.js` - Entry point React (copy ke src/index.js)
- `index.html` - HTML template (copy ke public/index.html)
- `package-frontend.json` - Dependencies frontend (rename ke package.json)

## Dependencies

### Backend:
- @hapi/hapi: Framework web untuk Node.js
- socket.io: Real-time communication library
- nodemon: Development tool untuk auto-reload

### Frontend:
- react: Library untuk UI
- react-dom: React DOM renderer
- react-scripts: Build tools untuk React
- socket.io-client: Client library untuk Socket.IO

## Troubleshooting

1. **CORS Error**: Pastikan backend mengizinkan origin dari frontend
2. **Connection Failed**: Periksa apakah backend berjalan di port 3000
3. **Port Conflict**: Ubah port jika ada konflik

## Pengembangan Selanjutnya

- Tambah autentikasi user
- Simpan notifikasi ke database
- Tambah room/channel untuk grup notifikasi
- Implementasi retry connection otomatis
