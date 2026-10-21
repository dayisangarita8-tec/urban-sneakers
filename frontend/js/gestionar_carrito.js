const state = {
  cart: JSON.parse(localStorage.getItem('cart')) || []
};

document.querySelectorAll('.btn-cart').forEach(btn => {
  btn.addEventListener('click', addToCart);
});

function addToCart(e) {
  const button = e.currentTarget;
  const id = button.dataset.id;
  const name = button.dataset.name;
  const price = parseFloat(button.dataset.price);
  const img = button.dataset.img;

  const existingItem = state.cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.qty += 1;
  } else {
    state.cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart();
  renderCart();
  updateCartCount();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
  saveCart();
  renderCart();
  updateCartCount();
}

function updateQuantity(id, qty) {
  const item = state.cart.find(item => item.id === id);
  if (item) {
    item.qty = qty > 0 ? qty : 1;
  }
  saveCart();
  renderCart();
}

function calculateTotal() {
  return state.cart.reduce((total, item) => total + item.price * item.qty, 0);
}

function renderCart() {
  const container = document.querySelector('#cart-container');
  if (!container) return;
  container.innerHTML = '';
  if (state.cart.length === 0) {
    container.innerHTML = '<div class="empty-cart"><i class="fas fa-shopping-cart"></i><p>Tu carrito está vacío</p></div>';
    return;
  }
  state.cart.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src="${item.img}" alt="${item.name}">
      <div class="cart-item-details">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        <div class="cart-item-quantity">
          <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.qty - 1})">-</button>
          <input class="quantity-input" type="number" value="${item.qty}" onchange="updateQuantity('${item.id}', parseInt(this.value))">
          <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.qty + 1})">+</button>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart('${item.id}')"><i class="fas fa-trash"></i></button>
    `;
    container.appendChild(div);
  });
  const totalDiv = document.createElement('div');
  totalDiv.classList.add('cart-summary');
  totalDiv.innerHTML = `<div class="summary-row"><span>Total</span><span class="summary-total">$${calculateTotal().toFixed(2)}</span></div>`;
  container.appendChild(totalDiv);
}

function updateCartCount() {
  const countEl = document.querySelector('#cart-count');
  if (countEl) {
    countEl.textContent = state.cart.reduce((sum, item) => sum + item.qty, 0);
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  updateCartCount();
});