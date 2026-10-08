const storageKey = 'lily-shop-catalog';
const cartStorageKey = 'lily-shop-cart';

const defaultCatalog = {
  men: [
    { tag: 'Best seller', title: 'Classic Boxer Set', text: 'Soft stretch waistband and breathable fit.', price: '6000 RWF', media: 'one', imageUrl: './img/Men/1.webp' },
    { tag: 'Active', title: 'Motion Brief', text: 'Secure comfort pieces built for daily active wear.', price: '6500 RWF', media: 'two', imageUrl: './img/Men/2.webp' },
    { tag: 'Lounge', title: 'Relax Cotton Pair', text: 'Soft fabric and easy shape for low-effort comfort.', price: '7000 RWF', media: 'three', imageUrl: './img/Men/3.jpg' },
    { tag: 'Slim fit', title: 'Daily Support Short', text: 'Smooth silhouette with breathable support.', price: '5500 RWF', media: 'four', imageUrl: '' },
    { tag: 'Essential', title: 'Softline Front Brief', text: 'Light, clean, and consistently comfortable.', price: '5000 RWF', media: 'five', imageUrl: '' },
    { tag: 'Premium', title: 'Comfort Luxe Pack', text: 'Premium softness with improved durable shape.', price: '8500 RWF', media: 'six', imageUrl: '' }
  ],
  women: [
    { tag: 'Best seller', title: 'Cloud Soft Brief', text: 'Easy coverage with a smooth, flexible waistband.', price: '6500 RWF', media: 'one', imageUrl: './img/women/1.jpg' },
    { tag: 'New', title: 'Contour Daily Set', text: 'Supportive fit with a polished, comfortable finish.', price: '7500 RWF', media: 'two', imageUrl: './img/women/2.webp' },
    { tag: 'Lounge', title: 'Silk Feel Basic', text: 'Soft-touch comfort made for everyday wear.', price: '8000 RWF', media: 'three', imageUrl: './img/women/3.avif' },
    { tag: 'Slim', title: 'Lift Seamless Brief', text: 'Low-profile support designed to sit smoothly.', price: '7000 RWF', media: 'four', imageUrl: '' },
    { tag: 'Essential', title: 'Everyday Cotton Pair', text: 'Fresh comfort and flexible support for active routines.', price: '6000 RWF', media: 'five', imageUrl: '' },
    { tag: 'Premium', title: 'Soft Luxe Set', text: 'Smooth softness and elegant shape.', price: '9000 RWF', media: 'six', imageUrl: '' }
  ],
  children: [
    { tag: 'Daily', title: 'Playtime Cotton Brief', text: 'Breathable and gentle for active kids.', price: '4000 RWF', media: 'one', imageUrl: './img/child/boys/1.jpg' },
    { tag: 'Soft', title: 'Little Comfort Set', text: 'Flexible coverage made for bedtime and play.', price: '4500 RWF', media: 'two', imageUrl: './img/child/boys/2.jpg' },
    { tag: 'Essential', title: 'Sleep Soft Pair', text: 'Relaxed fit for night bedtime comfort.', price: '4500 RWF', media: 'three', imageUrl: './img/child/girls/1.webp' },
    { tag: 'Classic', title: 'Easy Move Brief', text: 'Clean-cut comfort with a smooth finish.', price: '3800 RWF', media: 'four', imageUrl: '' },
    { tag: 'Fresh', title: 'Mini Daily Pack', text: 'Simple essentials for growing kids.', price: '5000 RWF', media: 'five', imageUrl: '' },
    { tag: 'Premium', title: 'Soft Step Set', text: 'Premium softness for young daily wear.', price: '5500 RWF', media: 'six', imageUrl: '' }
  ]
};

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function getCatalog() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(defaultCatalog));
    return structuredClone(defaultCatalog);
  }
  try { return JSON.parse(saved); } catch { return structuredClone(defaultCatalog); }
}

function getCart() {
  const saved = localStorage.getItem(cartStorageKey);
  if (!saved) return [];
  try { return JSON.parse(saved); } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  updateCartUI();
}

function parseRWF(priceStr) {
  return parseInt(String(priceStr).replace(/[^0-9]/g, ''), 10) || 0;
}

// Cart Drawer
function createCartDrawer() {
  if (document.getElementById('cart-drawer')) return;

  const overlay = document.createElement('div');
  overlay.className = 'cart-drawer-overlay';
  overlay.id = 'cart-overlay';

  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.id = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer-header">
      <h2>Your Shopping Cart</h2>
      <button class="close-cart" type="button" id="close-cart-btn">&times;</button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-body"></div>
    <div class="cart-drawer-footer">
      <div class="cart-total">
        <span>Total:</span>
        <span id="cart-total-price">0 RWF</span>
      </div>
      <a href="./checkout.html" class="checkout-btn">Proceed to Checkout</a>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  document.querySelectorAll('.cart-button').forEach(btn => {
    btn.addEventListener('click', () => {
      overlay.classList.add('active');
      drawer.classList.add('active');
      renderCartItems();
    });
  });

  document.getElementById('close-cart-btn')?.addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
}

function closeCart() {
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.getElementById('cart-drawer')?.classList.remove('active');
}

function updateCartUI() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = String(totalCount));
}

function renderCartItems() {
  const body = document.getElementById('cart-drawer-body');
  const totalPriceEl = document.getElementById('cart-total-price');
  if (!body || !totalPriceEl) return;

  const cart = getCart();
  if (cart.length === 0) {
    body.innerHTML = '<p style="color: var(--muted); text-align: center;">Your cart is empty.</p>';
    totalPriceEl.textContent = '0 RWF';
    return;
  }

  let total = 0;
  body.innerHTML = cart.map((item, index) => {
    const itemTotal = parseRWF(item.price) * item.quantity;
    total += itemTotal;
    return `
      <div class="cart-item">
        <div class="cart-item-info">
          <strong>${item.title} (${item.size || 'M'})</strong>
          <span>${item.price} x ${item.quantity}</span>
        </div>
        <div class="cart-item-actions">
          <button type="button" data-index="${index}" class="decrease-qty">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-index="${index}" class="increase-qty">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalPriceEl.textContent = `${total.toLocaleString()} RWF`;

  body.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      cart[idx].quantity += 1;
      saveCart(cart);
      renderCartItems();
    });
  });

  body.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.dataset.index;
      cart[idx].quantity -= 1;
      if (cart[idx].quantity <= 0) cart.splice(idx, 1);
      saveCart(cart);
      renderCartItems();
    });
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(i => i.title === product.title && i.size === product.size);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
  showToast(`${product.title} added to cart!`);
}

// Quick View Modal
function createQuickViewModal() {
  if (document.getElementById('quick-modal')) return;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'product-modal';
  modal.id = 'quick-modal';
  modal.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <h2 id="modal-title">Product Details</h2>
      <button class="close-modal" id="close-modal-btn">&times;</button>
    </div>
    <div class="modal-content">
      <p id="modal-text" style="color:var(--muted);"></p>
      <strong id="modal-price" style="font-size:1.4rem; color:var(--rose-deep);"></strong>
      <div>
        <label style="font-weight:700;">Select Size:</label>
        <div class="size-selector">
          <button class="size-btn selected">S</button>
          <button class="size-btn">M</button>
          <button class="size-btn">L</button>
          <button class="size-btn">XL</button>
        </div>
      </div>
      <button class="button-primary" id="modal-add-btn">Add to Cart</button>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  let selectedSize = 'S';
  modal.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.textContent;
    });
  });

  const closeModal = () => {
    overlay.classList.remove('active');
    modal.classList.remove('active');
  };

  document.getElementById('close-modal-btn')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);
}

function openQuickView(product) {
  createQuickViewModal();
  document.getElementById('modal-title').textContent = product.title;
  document.getElementById('modal-text').textContent = product.text;
  document.getElementById('modal-price').textContent = product.price;

  const addBtn = document.getElementById('modal-add-btn');
  const newAddBtn = addBtn.cloneNode(true);
  addBtn.parentNode.replaceChild(newAddBtn, addBtn);

  newAddBtn.addEventListener('click', () => {
    const selectedSize = document.querySelector('.size-btn.selected')?.textContent || 'M';
    addToCart({ title: product.title, price: product.price, size: selectedSize });
    document.getElementById('modal-overlay').classList.remove('active');
    document.getElementById('quick-modal').classList.remove('active');
  });

  document.getElementById('modal-overlay').classList.add('active');
  document.getElementById('quick-modal').classList.add('active');
}

// Render Catalog with Filters
function renderCatalog() {
  const shopGrid = document.querySelector('.shop-grid');
  if (!shopGrid) return;

  const currentCategory = document.body.dataset.category || 'men';
  const catalog = getCatalog();
  let items = catalog[currentCategory] || catalog.men || [];

  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';
  const sortVal = document.getElementById('sort-select')?.value || 'default';

  if (searchVal) {
    items = items.filter(i => i.title.toLowerCase().includes(searchVal) || i.text.toLowerCase().includes(searchVal));
  }

  if (sortVal === 'low') {
    items.sort((a, b) => parseRWF(a.price) - parseRWF(b.price));
  } else if (sortVal === 'high') {
    items.sort((a, b) => parseRWF(b.price) - parseRWF(a.price));
  }

  shopGrid.innerHTML = items.map((item) => {
    const mediaClass = item.media || 'one';
    const backgroundStyle = item.imageUrl
      ? `style="background-image: url('${item.imageUrl}');"`
      : '';

    return `
      <article class="product-card" data-title="${item.title}">
        <div class="product-media ${mediaClass}" ${backgroundStyle}></div>
        <div class="product-copy">
          <span class="tag">${item.tag}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
          <div class="product-meta">
            <strong>${item.price}</strong>
            <button type="button" class="quick-add-btn">Add to cart</button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  shopGrid.querySelectorAll('.product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-add-btn')) {
        e.stopPropagation();
        const title = card.dataset.title;
        const targetItem = items.find(i => i.title === title);
        if (targetItem) addToCart({ title: targetItem.title, price: targetItem.price, size: 'M' });
      } else {
        const title = card.dataset.title;
        const targetItem = items.find(i => i.title === title);
        if (targetItem) openQuickView(targetItem);
      }
    });
  });
}

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function rotateSlide() {
  if (!slides.length) return;
  slides.forEach((slide, index) => slide.classList.toggle('active', index === currentSlide));
  dots.forEach((dot, index) => dot.classList.toggle('active', index === currentSlide));
  currentSlide = (currentSlide + 1) % slides.length;
}

if (slides.length) {
  setInterval(rotateSlide, 3200);
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      currentSlide = Number(dot.dataset.slide);
      rotateSlide();
    });
  });
}

// Category Cards Auto-slide
document.querySelectorAll('.category-card').forEach((card, cardIndex) => {
  const cardSlides = card.querySelectorAll('.category-media-slide');
  let cardSlideIndex = 0;
  if (!cardSlides.length) return;

  setInterval(() => {
    cardSlideIndex = (cardSlideIndex + 1) % cardSlides.length;
    cardSlides.forEach((slide, index) => {
      slide.classList.toggle('active', index === cardSlideIndex);
    });
  }, 2600 + cardIndex * 400);
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  createCartDrawer();
  updateCartUI();
  renderCatalog();

  document.getElementById('search-input')?.addEventListener('input', renderCatalog);
  document.getElementById('sort-select')?.addEventListener('change', renderCatalog);
});