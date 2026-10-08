const adminForm = document.getElementById('admin-form');
const adminPreview = document.getElementById('admin-preview');
const adminStats = document.getElementById('admin-stats');
const toast = document.getElementById('toast');
const storageKey = 'lily-shop-catalog';
const defaultCatalog = {
  men: [
    { tag: 'Best seller', title: 'Classic Boxer Set', text: 'Soft stretch waistband and breathable fit.', price: '6000 RWF', media: 'one', imageUrl: './img/Men/1.webp' },
    { tag: 'Active', title: 'Motion Brief', text: 'Secure comfort pieces built for daily active wear.', price: '6500 RWF', media: 'two', imageUrl: './img/Men/2.webp' },
    { tag: 'Lounge', title: 'Relax Cotton Pair', text: 'Soft fabric and easy shape for low-effort comfort.', price: '7000 RWF', media: 'three', imageUrl: './img/Men/3.jpg' }
  ],
  women: [
    { tag: 'Best seller', title: 'Cloud Soft Brief', text: 'Easy coverage with a smooth, flexible waistband.', price: '6500 RWF', media: 'one', imageUrl: './img/women/1.jpg' },
    { tag: 'New', title: 'Contour Daily Set', text: 'Supportive fit with a polished, comfortable finish.', price: '7500 RWF', media: 'two', imageUrl: './img/women/2.webp' }
  ],
  children: [
    { tag: 'Daily', title: 'Playtime Cotton Brief', text: 'Breathable and gentle for active kids.', price: '4000 RWF', media: 'one', imageUrl: './img/child/boys/1.jpg' }
  ]
};
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 1600);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read selected image.'));
    reader.readAsDataURL(file);
  });
}

function getCatalog() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    localStorage.setItem(storageKey, JSON.stringify(defaultCatalog));
    return structuredClone(defaultCatalog);
  }
  try {
    return JSON.parse(saved);
  } catch {
    localStorage.setItem(storageKey, JSON.stringify(defaultCatalog));
    return structuredClone(defaultCatalog);
  }
}

function saveCatalog(catalog) {
  localStorage.setItem(storageKey, JSON.stringify(catalog));
}

function renderStats() {
  if (!adminStats) return;
  const catalog = getCatalog();
  const totalItems = Object.values(catalog).reduce((sum, items) => sum + items.length, 0);
  const categories = Object.keys(catalog).length;
  const totalWithImages = Object.values(catalog)
    .flat()
    .filter((item) => item.imageUrl)
    .length;

  adminStats.innerHTML = `
    <article class="stat-card">
      <span>Total Products</span>
      <strong>${totalItems}</strong>
    </article>
    <article class="stat-card">
      <span>Categories</span>
      <strong>${categories}</strong>
    </article>
    <article class="stat-card">
      <span>With Images</span>
      <strong>${totalWithImages}</strong>
    </article>
  `;
}

function renderPreview() {
  if (!adminPreview) return;
  const catalog = getCatalog();
  const cards = Object.entries(catalog).map(([category, items]) => `
    <div class="admin-preview-group">
      <h3>${category[0].toUpperCase()}${category.slice(1)}</h3>
      <ul>
        ${items.map((item) => `
          <li>
            <div class="admin-preview-item">
              ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.title}" class="admin-preview-image" />` : `<span class="admin-preview-placeholder">No image</span>`}
              <div>
                <strong>${item.title}</strong>
                <span>${item.price}</span>
              </div>
            </div>
            <button type="button" class="admin-delete-product" data-category="${category}" data-title="${item.title}">Delete Product</button>
          </li>
        `).join('')}
      </ul>
    </div>
  `).join('');

  adminPreview.innerHTML = cards;
  renderStats();
}

function deleteProduct(category, title) {
  const catalog = getCatalog();
  const categoryItems = catalog[category] || [];
  catalog[category] = categoryItems.filter((item) => item.title !== title);

  saveCatalog(catalog);
  renderPreview();
  showToast('Product deleted!');
}

adminForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const formData = new FormData(adminForm);
  const category = formData.get('category');
  const imageFile = formData.get('imageFile');
  let imageUrlInput = formData.get('imageUrl') || '';

  if (imageFile && imageFile instanceof File && imageFile.size > 0) {
    try {
      imageUrlInput = await readFileAsDataUrl(imageFile);
    } catch {
      showToast('Error loading image');
      return;
    }
  }

  let formattedPrice = formData.get('price').trim();
  if (!formattedPrice.toLowerCase().includes('rwf')) {
    formattedPrice += ' RWF';
  }

  const product = {
    tag: formData.get('tag'),
    title: formData.get('title'),
    text: formData.get('text'),
    price: formattedPrice,
    media: 'one',
    imageUrl: imageUrlInput
  };

  const catalog = getCatalog();
  if (!catalog[category]) catalog[category] = [];
  catalog[category].unshift(product);

  saveCatalog(catalog);
  renderPreview();
  adminForm.reset();
  showToast('Product added to shop!');
});

adminPreview?.addEventListener('click', (event) => {
  const deleteButton = event.target.closest('.admin-delete-product');

  if (deleteButton) {
    const category = deleteButton.dataset.category;
    const title = deleteButton.dataset.title;
    deleteProduct(category, title);
  }
});

renderPreview();