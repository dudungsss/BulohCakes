// ================= FILE: cart.js =================

window.cart = {}; 
window.globalProducts = [];

// --- FUNGSI 1: Update Jumlah (+/-) ---
// Menerima parameter kategori untuk membedakan ID kembar
window.updateQty = function(category, id, change) {
  // Membuat kunci unik, misal: 'food-1' atau 'drink-1'
  const uniqueKey = `${category}-${id}`;

  if (!window.cart[uniqueKey]) window.cart[uniqueKey] = 0;
  
  window.cart[uniqueKey] += change;
  if (window.cart[uniqueKey] < 0) window.cart[uniqueKey] = 0;

  // Update angka spesifik di kartu produk yang benar
  const qtyDisplay = document.getElementById(`qty-${uniqueKey}`);
  if (qtyDisplay) qtyDisplay.innerText = window.cart[uniqueKey];

  updateCartUI();
};

// --- FUNGSI 2: Hitung Total ---
function updateCartUI() {
  let totalItems = 0;
  let totalPrice = 0;

  for (const key in window.cart) {
    const qty = window.cart[key];
    if (qty > 0) {
      totalItems += qty;
      
      // key format: "category-id" -> kita perlu pecah stringnya
      const [cat, rawId] = key.split('-'); 
      
      // Cari produk yang ID DAN Category-nya cocok
      const product = window.globalProducts.find(p => p.id == rawId && p.category == cat);
      
      if (product) {
        totalPrice += qty * parseInt(product.harga);
      }
    }
  }

  const countEl = document.getElementById("cart-count");
  const totalEl = document.getElementById("cart-total");

  if (countEl) countEl.innerText = `${totalItems} item`;
  if (totalEl) totalEl.innerText = totalPrice.toLocaleString();
}

// --- FUNGSI 3: Checkout ---
document.addEventListener("DOMContentLoaded", () => {
  const btnOpenCart = document.getElementById("checkout");
  const cartPage = document.getElementById("cartPage");
  const btnCloseCart = document.getElementById("closeCart");
  const cartList = document.getElementById("cartList");
  const cartPageTotal = document.getElementById("cartPageTotal");
  const btnConfirm = document.querySelector(".confirm");
  const btnCancelAll = document.getElementById("cancelAll");

  if (btnOpenCart) {
    btnOpenCart.onclick = () => {
      cartList.innerHTML = "";
      let grandTotal = 0;
      let hasItem = false;

      for (const key in window.cart) {
        if (window.cart[key] > 0) {
          hasItem = true;
          // Pecah key unik kembali menjadi data asli
          const [cat, rawId] = key.split('-');
          const p = window.globalProducts.find(prod => prod.id == rawId && prod.category == cat);
          
          if (p) {
            const subtotal = window.cart[key] * p.harga;
            grandTotal += subtotal;

            cartList.innerHTML += `
              <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${p.nama_produk} (x${window.cart[key]})</span>
                <strong>Rp ${subtotal.toLocaleString()}</strong>
              </div>
            `;
          }
        }
      }

      if (!hasItem) cartList.innerHTML = "<p>Keranjang kosong.</p>";
      if (cartPageTotal) cartPageTotal.innerText = grandTotal.toLocaleString();
      cartPage.classList.add("active");
    };
  }

  if (btnCloseCart) {
    btnCloseCart.onclick = () => {
      cartPage.classList.remove("active");
    };
  }

  if (btnCancelAll) {
    btnCancelAll.onclick = () => {
      window.cart = {};
      document.querySelectorAll(".qty").forEach(el => el.innerText = "0");
      updateCartUI();
      cartPage.classList.remove("active");
    };
  }

  // LOGIKA KIRIM KE DATABASE
  if (btnConfirm) {
    btnConfirm.onclick = async () => {
      const itemsToSubmit = [];
      
      for (const key in window.cart) {
        if (window.cart[key] > 0) {
          const [cat, rawId] = key.split('-');
          const p = window.globalProducts.find(prod => prod.id == rawId && prod.category == cat);
          
          if (p) {
            itemsToSubmit.push({ 
              id_produk: p.id, // Kirim ID asli ke database
              jumlah: window.cart[key], 
              harga: p.harga 
            });
          }
        }
      }

      if (itemsToSubmit.length === 0) return;

      if (confirm("Proses pesanan?")) {
        try {
          const response = await fetch('http://localhost:3000/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id_user: 1, 
              nomor_meja: 1,
              total_harga: itemsToSubmit.reduce((sum, i) => sum + (i.jumlah * i.harga), 0),
              items: itemsToSubmit
            })
          });

          const result = await response.json();
          if (response.ok) {
            alert("✅ Berhasil!");
            location.reload(); 
          } else {
            alert("❌ Gagal: " + result.error);
          }
        } catch (err) {
          alert("Server Error.");
        }
      }
    };
  }
});