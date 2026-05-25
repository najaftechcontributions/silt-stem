AOS.init({ once: true, duration: 600, offset: 60 });

function buildWhatsAppSingleMessage(name, price) {
  return encodeURIComponent(
    `Hi! I want to order the ${name} for Rs ${price.toLocaleString('en-IN')}. Please confirm and share details.`
  );
}

function renderPlantCard(plant) {
  const outOfStock = !plant.in_stock;
  const waUrl = `https://wa.me/${window.WA_NUMBER}?text=${buildWhatsAppSingleMessage(plant.name, plant.price)}`;

  const wrapper = document.createElement('div');
  wrapper.className = 'flashcard-wrapper';
  wrapper.setAttribute('role', 'listitem');

  wrapper.innerHTML = `
    <div class="flashcard" id="card-${plant.id}" tabindex="0" role="button"
         aria-label="Flip card to see details for ${plant.name}" aria-pressed="false">
      <div class="card-face card-front-face">
        <img
          src="${plant.image}"
          alt="${plant.name} indoor plant"
          class="card-plant-image"
          loading="lazy"
          onerror="this.style.background='#e8f5e9';this.removeAttribute('src')">
        <div class="card-front-info">
          <p class="card-plant-name">${plant.name}</p>
          <p class="card-plant-price">Rs ${plant.price.toLocaleString('en-IN')}</p>
          ${outOfStock ? '<span class="out-of-stock-badge">Out of Stock</span>' : ''}
          <p class="short-desc">${plant.shortdesc}</p>
        </div>
        <span class="card-flip-hint" aria-hidden="true">Tap to see details</span>
      </div>
      <div class="card-face card-back-face">
        <p class="card-back-plant-name">${plant.name}</p>
        <p class="card-back-description">${plant.description}</p>
        <p class="card-back-price">Rs ${plant.price.toLocaleString('en-IN')}</p>
        <div class="card-back-actions">
          <button
            class="btn-add-to-cart"
            data-id="${plant.id}"
            ${outOfStock ? 'disabled aria-disabled="true"' : ''}
            aria-label="Add ${plant.name} to cart">
            ${outOfStock ? 'Out of Stock' : 'Add to Cart'}
          </button>
          <a
            href="${waUrl}"
            class="btn-buy-whatsapp"
            target="_blank"
            rel="noopener"
            ${outOfStock ? 'aria-disabled="true" tabindex="-1"' : ''}
            aria-label="Buy ${plant.name} now via WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Buy Now via WhatsApp
          </a>
        </div>
      </div>
    </div>`;

  const card = wrapper.querySelector('.flashcard');
  const addBtn = wrapper.querySelector('.btn-add-to-cart');
  const buyBtn = wrapper.querySelector('.btn-buy-whatsapp');

  function flipCard() {
    const isFlipped = card.classList.toggle('is-flipped');
    card.setAttribute('aria-pressed', String(isFlipped));
    card.setAttribute('aria-label',
      isFlipped
        ? `Flip card back — currently showing details for ${plant.name}`
        : `Flip card to see details for ${plant.name}`
    );
  }

  card.addEventListener('click', e => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    flipCard();
  });

  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      flipCard();
    }
  });

  if (addBtn && !outOfStock) {
    addBtn.addEventListener('click', e => {
      e.stopPropagation();
      window.addToCart({ id: plant.id, name: plant.name, price: plant.price });
    });
  }

  if (buyBtn && !outOfStock) {
    buyBtn.addEventListener('click', e => {
      e.stopPropagation();
      e.preventDefault();
      window.handleWhatsAppAction(waUrl, null);
    });
  }

  return wrapper;
}

async function loadPlants() {
  const grid = document.getElementById('plant-grid');
  if (!grid) return;

  try {
    const res = await fetch('plants.json');
    if (!res.ok) throw new Error('Failed to load plants');
    const data = await res.json();

    data.plants.forEach((plant, i) => {
      const el = renderPlantCard(plant);
      el.setAttribute('data-aos', 'fade-up');
      el.setAttribute('data-aos-delay', String(Math.min(i % 3, 2) * 80));
      grid.appendChild(el);
    });

    AOS.refresh();
  } catch (err) {
    grid.innerHTML = `<p style="text-align:center;color:#c62828;grid-column:1/-1">Could not load plants. Please try again later.</p>`;
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadPlants);
