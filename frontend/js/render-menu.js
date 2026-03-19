// ================= FILE: render-menu.js =================

const grid = document.getElementById("menuGrid");
const tabs = document.querySelectorAll(".tab");

// --- 1. AMBIL DATA DARI SERVER ---
async function initMenu() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    window.globalProducts = data; 
    renderMenu("all"); 
  } catch (err) {
    console.error("Error ambil data:", err);
    if(grid) grid.innerHTML = "<p style='color:red; text-align:center;'>Gagal koneksi ke database.</p>";
  }
}

// --- 2. RENDER CARD MENU ---
function renderMenu(filter = "all") {
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = window.globalProducts.filter(p => filter === "all" || p.category === filter);

  filtered.forEach(p => {
    const folder = p.category === "food" ? "cakes" : "bevs";
    let imageName = p.nama_produk.toLowerCase().replace(/\s/g, '');
    
    // Mapping nama gambar
    if (imageName === "chocolatecake") imageName = "chococake";
    if (imageName === "strawberrycake") imageName = "strawberry";
    if (imageName === "cappuccino") imageName = "cappucino";

    // KUNCI PERBAIKAN:
    // 1. Buat uniqueKey (gabungan category-id)
    // 2. ID HTML menggunakan uniqueKey (qty-food-1)
    // 3. Tombol memanggil updateQty dengan parameter kategori
    const uniqueKey = `${p.category}-${p.id}`;

    grid.innerHTML += `
      <div class="menu-card" data-id="${p.id}">
        <div class="card-img">
           <img src="img/${folder}/${imageName}.jpg" onerror="this.src='img/cakes/default.jpg'" alt="${p.nama_produk}">
        </div>
        <div class="card-content">
            <h3>${p.nama_produk}</h3>
            <p class="price">Rp ${parseInt(p.harga).toLocaleString()}</p>
            
            <div class="qty-control">
              <button class="minus" onclick="updateQty('${p.category}', ${p.id}, -1)">−</button>
              <span class="qty" id="qty-${uniqueKey}">${window.cart[uniqueKey] || 0}</span>
              <button class="plus" onclick="updateQty('${p.category}', ${p.id}, 1)">+</button>
            </div>
        </div>
      </div>
    `;
  });
}

// --- 3. FILTER TAB ---
tabs.forEach(tab => {
  tab.onclick = () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    renderMenu(tab.dataset.filter);
  };
});

initMenu();