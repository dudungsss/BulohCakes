// ================= DATA STATE =================
// Kita biarkan dummy data ini sebagai placeholder awal
// Nanti akan tertimpa oleh data dari database saat fetchOrders() berjalan
let orders = [
  {
    id: 1,
    table: 1,
    status: "new",
    items: [
      { name: "Chocolate Cake", qty: 2, price: 45000 },
      { name: "Americano", qty: 1, price: 20000 }
    ]
  },
  {
    id: 2,
    table: 2,
    status: "process",
    items: [
      { name: "Cheesecake", qty: 1, price: 55000 }
    ]
  },
  {
    id: 3,
    table: 3,
    status: "done",
    items: [
      { name: "Matcha Latte", qty: 2, price: 25000 }
    ]
  }
];

let selectedOrderId = null;

// ================= RENDER ORDER LIST =================
function renderOrderList() {
  const list = document.getElementById("orderList");
  list.innerHTML = "<h3>Pesanan Masuk</h3>";

  orders.forEach(order => {
    list.innerHTML += `
      <div class="order-card ${order.id === selectedOrderId ? "active" : ""}"
           onclick="selectOrder(${order.id})">
        <strong>Meja ${order.table}</strong>
        <p>${order.items.length} item</p>
        <span class="status ${order.status}">
          ${order.status.toUpperCase()}
        </span>
      </div>
    `;
  });
}

// ================= RENDER DETAIL =================
function selectOrder(id) {
  selectedOrderId = id;
  const order = orders.find(o => o.id === id);
  
  // Refresh list agar highlight 'active' berpindah
  renderOrderList();

  // Jika order tidak ditemukan (misal data berubah), stop
  if (!order) return;

  let total = 0;
  const detail = document.getElementById("orderDetail");

  detail.innerHTML = `
    <h2>Meja ${order.table}</h2>
    <p>Status: <strong>${order.status.toUpperCase()}</strong></p>

    <ul class="item-list">
      ${order.items.map(item => {
        const sub = item.qty * item.price;
        total += sub;
        return `
          <li>
            <span>${item.name}</span>
            <span>x${item.qty}</span>
            <strong>Rp ${sub.toLocaleString()}</strong>
          </li>
        `;
      }).join("")}
    </ul>

    <h3>Total: Rp ${total.toLocaleString()}</h3>

    <div class="actions">
      <button class="accept" onclick="updateStatus('new')">Terima</button>
      <button class="process-btn" onclick="updateStatus('process')">Proses</button>
      <button class="done-btn" onclick="updateStatus('done')">Selesai</button>
    </div>
  `;
}

// ================= API & LOGIC =================

// Fungsi tambahan untuk mengambil data awal dari database
async function fetchOrders() {
  try {
    const res = await fetch('http://localhost:3000/api/orders');
    if (res.ok) {
      orders = await res.json();
      renderOrderList();
    }
  } catch (err) {
    console.log("Menggunakan dummy data (Server offline)");
  }
}

// UPDATE STATUS (Menggunakan Logika API dari kode atas)
async function updateStatus(status) {
  if (!selectedOrderId) return;

  try {
    // 1. Kirim update ke Database
    const response = await fetch('http://localhost:3000/api/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        id_pemesanan: selectedOrderId, 
        status: status 
      })
    });

    if (response.ok) {
      // 2. Jika sukses, update data lokal dari server agar sinkron
      await fetchOrders(); 
      
      // 3. Render ulang detail untuk melihat perubahan status terkini
      selectOrder(selectedOrderId);
      
      alert("Status berhasil diperbarui ke database!");
    } else {
      alert("Gagal memperbarui status.");
    }
  } catch (err) {
    console.error(err);
    alert("Koneksi server gagal!");
  }
}

// ================= INIT =================
// Render awal (pakai dummy dulu, lalu coba fetch ke server)
renderOrderList();
fetchOrders();