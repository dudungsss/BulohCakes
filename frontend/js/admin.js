const list = document.getElementById("list");

function renderAdmin() {
  list.innerHTML = menus.map(m => `
    <li>
      ${m.name} - Rp${m.price}
      <button onclick="toggle(${m.id})">On/Off</button>
      <button onclick="removeMenu(${m.id})">Hapus</button>
    </li>
  `).join("");
}

function addMenu() {
  menus.push({
    id: Date.now(),
    name: name.value,
    price: +price.value,
    category: category.value,
    image: "img/default.jpg",
    active: true
  });
  saveMenus();
  renderAdmin();
}

function toggle(id) {
  const m = menus.find(x => x.id === id);
  m.active = !m.active;
  saveMenus();
  renderAdmin();
}

function removeMenu(id) {
  menus = menus.filter(m => m.id !== id);
  saveMenus();
  renderAdmin();
}

renderAdmin();
