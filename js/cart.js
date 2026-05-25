const CART_KEY = 'silt_stem_cart';
const WA_NUMBER = '918292514680';

let cart = loadCart();

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getItem(id) {
  return cart.find(item => item.id === id);
}

function addToCart(plant) {
  const existing = getItem(plant.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: plant.id, name: plant.name, price: plant.price, qty: 1 });
  }
  saveCart();
  updateCartUI();
  animateBadge();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartUI();
  renderCartItems();
}

function changeQty(id, delta) {
  const item = getItem(id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(id);
    return;
  }
  saveCart();
  updateCartUI();
  renderCartItems();
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function cartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function updateCartUI() {
  const badge = document.getElementById('cart-badge');
  const count = cartCount();
  if (badge) badge.textContent = count;
}

function animateBadge() {
  const badge = document.getElementById('cart-badge');
  if (!badge) return;
  badge.classList.remove('badge-bounce');
  void badge.offsetWidth;
  badge.classList.add('badge-bounce');
}

function renderCartItems() {
  const list = document.getElementById('cart-items');
  const footer = document.getElementById('cart-footer');
  const totalEl = document.getElementById('cart-grand-total');
  if (!list) return;

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="cart-empty-message" role="status">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <p>Your cart is empty.<br>Add a plant to get started.</p>
      </div>`;
    if (footer) footer.style.display = 'none';
    return;
  }

  list.innerHTML = cart.map(item => `
    <div class="cart-item-row" data-id="${item.id}">
      <div>
        <p class="cart-item-name">${item.name}</p>
        <p class="cart-item-price">Rs ${(item.price * item.qty).toLocaleString('en-IN')}</p>
      </div>
      <div class="cart-item-qty-controls">
        <button class="qty-btn" data-id="${item.id}" data-delta="-1" aria-label="Decrease quantity of ${item.name}">−</button>
        <span class="qty-value" aria-label="Quantity">${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-delta="1" aria-label="Increase quantity of ${item.name}">+</button>
      </div>
      <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14H6L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </div>`).join('');

  if (footer) footer.style.display = 'block';
  if (totalEl) totalEl.textContent = `Rs ${cartTotal().toLocaleString('en-IN')}`;

  list.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => changeQty(btn.dataset.id, parseInt(btn.dataset.delta, 10)));
  });
  list.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
  });
}

function buildWhatsAppCartMessage() {
  const lines = cart.map((item, i) =>
    `${i + 1}. ${item.name} x${item.qty} - Rs ${(item.price * item.qty).toLocaleString('en-IN')}`
  ).join('\n');
  return encodeURIComponent(
    `Hi! I want to order the following plants:\n${lines}\n\nTotal: Rs ${cartTotal().toLocaleString('en-IN')}\n\nPlease confirm and share details.`
  );
}

function openCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  renderCartItems();
  panel?.classList.add('is-open');
  overlay?.classList.add('is-visible');
  panel?.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('cart-close')?.focus();
}

function closeCart() {
  const panel = document.getElementById('cart-panel');
  const overlay = document.getElementById('cart-overlay');
  panel?.classList.remove('is-open');
  overlay?.classList.remove('is-visible');
  panel?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.getElementById('cart-trigger')?.focus();
}

function isDesktop() {
  return window.innerWidth >= 768 && !navigator.userAgent.match(/Android|iPhone|iPad|iPod/i);
}

function handleWhatsAppAction(url, message) {
  if (isDesktop()) {
    const modal = document.getElementById('whatsapp-modal');
    const link = document.getElementById('modal-whatsapp-link');
    if (modal && link) {
      link.href = url;
      modal.removeAttribute('hidden');
      document.getElementById('modal-close')?.focus();
    }
  } else {
    window.open(url, '_blank', 'noopener');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  document.getElementById('cart-trigger')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('cart-panel');
      const modal = document.getElementById('whatsapp-modal');
      if (panel?.classList.contains('is-open')) closeCart();
      if (modal && !modal.hidden) {
        modal.setAttribute('hidden', '');
        document.getElementById('cart-trigger')?.focus();
      }
    }
  });

  document.getElementById('btn-whatsapp-checkout')?.addEventListener('click', () => {
    if (cart.length === 0) return;
    const url = `https://wa.me/${WA_NUMBER}?text=${buildWhatsAppCartMessage()}`;
    handleWhatsAppAction(url, null);
  });

  document.getElementById('modal-close')?.addEventListener('click', () => {
    document.getElementById('whatsapp-modal')?.setAttribute('hidden', '');
  });

  document.getElementById('modal-copy-btn')?.addEventListener('click', () => {
    navigator.clipboard.writeText('+91 82925 14680').then(() => {
      const btn = document.getElementById('modal-copy-btn');
      if (btn) {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy Number'; }, 2000);
      }
    });
  });
});

window.addToCart = addToCart;
window.handleWhatsAppAction = handleWhatsAppAction;
window.WA_NUMBER = WA_NUMBER;
