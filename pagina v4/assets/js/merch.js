// assets/js/merch.js

// --- Catálogo demo (puedes mover esto a un JSON o API luego) ---
const PRODUCTS = [
  {
    id: "CAM-2025-H",
    name: "Camiseta Titular 2025",
    category: "Camisetas",
    price: 29990,
    oldPrice: 34990,
    stock: 12,
    img: "assets/img/merch/camiseta_titular.jpg",
    tags: ["unisex", "oficial", "2025"]
  },
  {
    id: "CAM-2025-A",
    name: "Camiseta Alterna 2025",
    category: "Camisetas",
    price: 29990,
    oldPrice: null,
    stock: 0,
    img: "assets/img/merch/camiseta_alterna.jpg",
    tags: ["unisex", "oficial", "2025"]
  },
  {
    id: "BOT-ALU-750",
    name: "Botella Metálica 750ml",
    category: "Accesorios",
    price: 14990,
    oldPrice: 17990,
    stock: 25,
    img: "assets/img/merch/botella_metalica.jpg",
    tags: ["gym", "hidratación"]
  },
  {
    id: "GOR-TEJ",
    name: "Gorro Tejido",
    category: "Accesorios",
    price: 9990,
    oldPrice: null,
    stock: 8,
    img: "assets/img/merch/gorro_tejido.jpg",
    tags: ["invierno"]
  },
  {
    id: "TAZ-LOGO",
    name: "Taza Logo Los Alces",
    category: "Hogar",
    price: 6990,
    oldPrice: 8990,
    stock: 40,
    img: "assets/img/merch/taza_logo.jpg",
    tags: ["oficial", "regalo"]
  },
  {
    id: "BUF-2025",
    name: "Bufanda Oficial",
    category: "Accesorios",
    price: 11990,
    oldPrice: null,
    stock: 16,
    img: "assets/img/merch/bufanda.jpg",
    tags: ["estadio", "invierno"]
  }
];

// --- Estado / helpers ---
const $grid = document.getElementById("productGrid");
const $search = document.getElementById("searchInput");
const $sort = document.getElementById("sortSelect");
const $onlyStock = document.getElementById("onlyStock");
const $chips = document.querySelectorAll(".filter-chip");

const $cartList = document.getElementById("cartList");
const $cartTotal = document.getElementById("cartTotal");
const $cartCount = document.getElementById("cartCount");
const $clearCart = document.getElementById("clearCartBtn");

let state = {
  query: "",
  category: "all",
  onlyStock: "all",
  sort: "relevant",
  cart: loadCart()
};

function loadCart() {
  try { return JSON.parse(localStorage.getItem("merch_cart")) || []; }
  catch { return []; }
}
function saveCart() {
  localStorage.setItem("merch_cart", JSON.stringify(state.cart));
  updateCartBadge();
}
function money(clp) {
  return clp.toLocaleString("es-CL", { style:"currency", currency:"CLP" });
}

// --- Render productos ---
function renderProducts() {
  const list = PRODUCTS
    .filter(p => state.category === "all" || p.category === state.category)
    .filter(p => state.onlyStock === "all" ? true : p.stock > 0)
    .filter(p => {
      if (!state.query) return true;
      const q = state.query.toLowerCase();
      return [p.name, p.category, ...(p.tags||[])].join(" ").toLowerCase().includes(q);
    })
    .sort((a,b) => {
      switch(state.sort){
        case "price_asc": return a.price - b.price;
        case "price_desc": return b.price - a.price;
        case "name_asc": return a.name.localeCompare(b.name);
        case "name_desc": return b.name.localeCompare(a.name);
        default: return 0; // relevante (original)
      }
    });

  $grid.innerHTML = list.map(p => productCardHTML(p)).join("") || `
    <div class="col-12"><div class="alert alert-warning">No encontramos productos para tu búsqueda.</div></div>
  `;

  // bind botones
  list.forEach(p => {
    const btn = document.querySelector(`[data-add="${p.id}"]`);
    btn?.addEventListener("click", () => addToCart(p.id));
  });
}

function productCardHTML(p) {
  const discount = p.oldPrice ? Math.round(100 - (p.price*100/p.oldPrice)) : 0;
  const disabled = p.stock <= 0 ? "disabled" : "";
  const badge = p.stock <= 0 ? `<span class="badge bg-secondary">Sin stock</span>`
              : p.oldPrice ? `<span class="badge bg-success">-${discount}%</span>` : "";
  const oldP = p.oldPrice ? `<span class="old-price">${money(p.oldPrice)}</span>` : "";
  const imgSrc = p.img || "assets/img/merch/placeholder.jpg";

  return `
    <div class="col-6 col-md-4 col-lg-3">
      <div class="position-relative product-card">
        ${badge}
        <button class="fav-btn" title="Agregar a favoritos"><i class="fa-regular fa-heart"></i></button>
        <img src="${imgSrc}" alt="${p.name}" onerror="this.src='assets/img/merch/placeholder.jpg'"/>
      </div>
      <div class="pt-2">
        <div class="small text-muted">${p.category}</div>
        <div class="fw-semibold">${p.name}</div>
        <div class="price">${money(p.price)} ${oldP}</div>
        <button class="btn btn-primary w-100 mt-2" data-add="${p.id}" ${disabled}>
          <i class="fa-solid fa-cart-plus me-1"></i>Agregar
        </button>
      </div>
    </div>
  `;
}

// --- Carrito ---
function addToCart(id) {
  const prod = PRODUCTS.find(p => p.id === id);
  if (!prod) return;

  const item = state.cart.find(i => i.id === id);
  if (item) {
    if (item.qty < prod.stock) item.qty++;
  } else {
    state.cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1, img: prod.img });
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(i => i.id !== id);
  saveCart();
  renderCart();
}

function changeQty(id, delta) {
  const item = state.cart.find(i => i.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  renderCart();
}

function renderCart() {
  if (!$cartList) return;
  $cartList.innerHTML = state.cart.map(i => `
    <li class="list-group-item d-flex align-items-center gap-2">
      <img src="${i.img || 'assets/img/merch/placeholder.jpg'}" alt="" width="42" height="42" style="object-fit:cover;border-radius:.5rem" onerror="this.src='assets/img/merch/placeholder.jpg'"/>
      <div class="flex-fill">
        <div class="fw-semibold">${i.name}</div>
        <small>${money(i.price)} c/u</small>
      </div>
      <div class="btn-group" role="group" aria-label="cantidad">
        <button class="btn btn-outline-secondary btn-sm" aria-label="menos" onclick="changeQty('${i.id}', -1)">–</button>
        <button class="btn btn-outline-secondary btn-sm" disabled>${i.qty}</button>
        <button class="btn btn-outline-secondary btn-sm" aria-label="más" onclick="changeQty('${i.id}', 1)">+</button>
      </div>
      <button class="btn btn-outline-danger btn-sm ms-2" aria-label="eliminar" onclick="removeFromCart('${i.id}')">
        <i class="fa-solid fa-trash"></i>
      </button>
    </li>
  `).join("");

  const total = state.cart.reduce((acc, i) => acc + i.price * i.qty, 0);
  $cartTotal.textContent = money(total);
  updateCartBadge();
}

function updateCartBadge() {
  const count = state.cart.reduce((acc, i) => acc + i.qty, 0);
  if (count > 0) {
    $cartCount.classList.remove("d-none");
    $cartCount.textContent = count;
  } else {
    $cartCount.classList.add("d-none");
  }
}

// --- Filtros / eventos ---
$search?.addEventListener("input", (e) => {
  state.query = e.target.value.trim();
  renderProducts();
});

$sort?.addEventListener("change", (e) => {
  state.sort = e.target.value;
  renderProducts();
});

$onlyStock?.addEventListener("change", (e) => {
  state.onlyStock = e.target.value;
  renderProducts();
});

$chips.forEach(ch => ch.addEventListener("click", () => {
  $chips.forEach(c => c.classList.remove("active"));
  ch.classList.add("active");
  state.category = ch.dataset.filter;
  renderProducts();
}));

$clearCart?.addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
});

// --- Inicialización ---
renderProducts();
renderCart();

// Exponer funciones de carrito para botones inline del template
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;
