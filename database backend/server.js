const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path');

const app = express();

// 1. MIDDLEWARE (Harus di atas)
app.use(express.json());
app.use(cors());

// Jalur ke folder 'frontend'
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// 2. KONEKSI DATABASE
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'toko_kue', // Sesuai nama database di tugas Anda
  password: 'VRAMUDHIA01', 
  port: 5432,
});

// 3. ROUTES FRONTEND
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'Kasir/kasir.html'));
});

// 4. API ENDPOINTS (Tambahkan di sini)

// API untuk mengambil data produk dari View SQL
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM view_menu ORDER BY nama_produk');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API untuk mengambil pesanan
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id_pemesanan as id, nomor_meja as table, status_pemesanan as status 
      FROM pemesanan ORDER BY tanggal_pesan DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API Checkout (Memicu Trigger stok otomatis)
app.post('/api/checkout', async (req, res) => {
  const { id_user, nomor_meja, total_harga, items } = req.body;
  try {
    await pool.query('BEGIN');
    const orderRes = await pool.query(
      'INSERT INTO pemesanan (id_user, nomor_meja, total_harga, status_pemesanan) VALUES ($1, $2, $3, $4) RETURNING id_pemesanan',
      [id_user, nomor_meja, total_harga, 'draft']
    );
    const id_pemesanan = orderRes.rows[0].id_pemesanan;

    for (const item of items) {
      await pool.query(
        'INSERT INTO detail_pemesanan (id_pemesanan, id_produk, jumlah, harga_satuan, subtotal) VALUES ($1, $2, $3, $4, $5)',
        [id_pemesanan, item.id_produk, item.jumlah, item.harga, item.jumlah * item.harga]
      );
    }
    await pool.query('COMMIT');
    res.json({ success: true, message: "Pesanan berhasil!" });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(400).json({ error: err.message });
  }
});

// 5. JALANKAN SERVER (INI HARUS PALING AKHIR)
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`Server aktif di http://localhost:${PORT}`);
  console.log(`=========================================`);
});