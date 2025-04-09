// Pizza data
const pizzaData = {
    sizes: [
        { name: "Small", price: 5, priceZAR: 90 },
        { name: "Medium", price: 8, priceZAR: 144 },
        { name: "Large", price: 12, priceZAR: 216 }
    ],
    toppings: [
        { name: "Pepperoni", price: 1, priceZAR: 18 },
        { name: "Mushrooms", price: 0.5, priceZAR: 9 },
        { name: "Olives", price: 0.5, priceZAR: 9 },
        { name: "Onions", price: 0.5, priceZAR: 9 },
        { name: "Sausage", price: 1.5, priceZAR: 27 },
        { name: "Bacon", price: 1.5, priceZAR: 27 },
        { name: "Extra Cheese", price: 1, priceZAR: 18 }
    ],
    exchangeRate: 18
};

// App state
const state = {
    currentPizza: {
        size: null,
        toppings: []
    },
    cart: [],
    discountApplied: false,
    currency: 'USD'
};

// DOM elements
const sizeOptionsEl = document.querySelector('.size-options');
const toppingOptionsEl = document.querySelector('.topping-options');
const currentPriceEl = document.getElementById('current-price');
const addToCartBtn = document.getElementById('add-to-cart');
const cartItemsEl = document.getElementById('cart-items');
const subtotalEl = document.getElementById('subtotal');
const discountEl = document.getElementById('discount');
const totalEl = document.getElementById('total');
const placeOrderBtn = document.getElementById('place-order');
const orderModal = document.getElementById('order-modal');
const closeModalBtn = document.querySelector('.close-modal');
const orderDetailsEl = document.getElementById('order-details');
const confirmOrderBtn = document.getElementById('confirm-order');
const currencySelector = document.getElementById('currency');

// Initialize the app
function init() {
    renderSizeOptions();
    renderToppingOptions();
    updatePriceDisplay();
    setupEventListeners();
}

// Format price based on currency
function formatPrice(price) {
    if (state.currency === 'ZAR') {
        return `R${price.toFixed(2)}`;
    }
    return `$${price.toFixed(2)}`;
}

// Get price based on current currency
function getPrice(item) {
    if (state.currency === 'ZAR') {
        return item.priceZAR || (item.price * pizzaData.exchangeRate);
    }
    return item.price;
}

// Render size options
function renderSizeOptions() {
    sizeOptionsEl.innerHTML = pizzaData.sizes.map(size => `
        <div class="option" data-size="${size.name}">
            <input type="radio" name="size" id="size-${size.name.toLowerCase()}" value="${size.name}">
            <label for="size-${size.name.toLowerCase()}">${size.name} (${formatPrice(getPrice(size))})</label>
        </div>
    `).join('');
}

// Render topping options
function renderToppingOptions() {
    toppingOptionsEl.innerHTML = pizzaData.toppings.map(topping => `
        <div class="option" data-topping="${topping.name}">
            <input type="checkbox" id="topping-${topping.name.toLowerCase().replace(' ', '-')}" value="${topping.name}">
            <label for="topping-${topping.name.toLowerCase().replace(' ', '-')}">${topping.name} (${formatPrice(getPrice(topping))})</label>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Size selection
    sizeOptionsEl.addEventListener('click', (e) => {
        const option = e.target.closest('.option');
        if (!option) return;
        
        const sizeName = option.dataset.size;
        const size = pizzaData.sizes.find(s => s.name === sizeName);
        
        if (size) {
            state.currentPizza.size = size;
            updateSelectedSizeUI(sizeName);
            updatePriceDisplay();
        }
    });
    
    // Topping selection
    toppingOptionsEl.addEventListener('click', (e) => {
        const option = e.target.closest('.option');
        if (!option) return;
        
        const toppingName = option.dataset.topping;
        const topping = pizzaData.toppings.find(t => t.name === toppingName);
        const checkbox = option.querySelector('input');
        
        if (topping) {
            checkbox.checked = !checkbox.checked;
            
            if (checkbox.checked) {
                state.currentPizza.toppings.push(topping);
                option.classList.add('selected');
            } else {
                state.currentPizza.toppings = state.currentPizza.toppings.filter(t => t.name !== topping.name);
                option.classList.remove('selected');
            }
            
            updatePriceDisplay();
        }
    });
    
    // Add to cart
    addToCartBtn.addEventListener('click', addToCart);
    
    // Place order
    placeOrderBtn.addEventListener('click', showOrderModal);
    
    // Modal controls
    closeModalBtn.addEventListener('click', () => orderModal.style.display = 'none');
    confirmOrderBtn.addEventListener('click', confirmOrder);
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === orderModal) {
            orderModal.style.display = 'none';
        }
    });
    
    // Currency change
    currencySelector.addEventListener('change', (e) => {
        state.currency = e.target.value;
        updatePriceDisplay();
        renderSizeOptions();
        renderToppingOptions();
        renderCart();
    });
}

// Update selected size UI
function updateSelectedSizeUI(selectedSize) {
    document.querySelectorAll('.size-options .option').forEach(option => {
        option.classList.remove('selected');
        if (option.dataset.size === selectedSize) {
            option.classList.add('selected');
        }
    });
}

// Update price display
function updatePriceDisplay() {
    let price = 0;
    
    if (state.currentPizza.size) {
        price += getPrice(state.currentPizza.size);
    }
    
    state.currentPizza.toppings.forEach(topping => {
        price += getPrice(topping);
    });
    
    currentPriceEl.textContent = formatPrice(price);
}

// Add pizza to cart
function addToCart() {
    if (!state.currentPizza.size) {
        alert('Please select a pizza size');
        return;
    }
    
    if (state.currentPizza.toppings.length === 0) {
        alert('Please select at least one topping');
        return;
    }
    
    const pizza = {
        ...state.currentPizza,
        id: Date.now()
    };
    
    state.cart.push(pizza);
    renderCart();
    
    // Reset current pizza
    state.currentPizza = {
        size: null,
        toppings: []
    };
    
    // Reset UI
    document.querySelectorAll('.option.selected').forEach(option => {
        option.classList.remove('selected');
    });
    
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.checked = false;
    });
    
    updatePriceDisplay();
}

// Render cart
function renderCart() {
    if (state.cart.length === 0) {
        cartItemsEl.innerHTML = '<p class="empty-cart-message">Your cart is empty</p>';
        placeOrderBtn.disabled = true;
        updateCartSummary();
        return;
    }
    
    cartItemsEl.innerHTML = '';
    
    state.cart.forEach((item, index) => {
        const toppingsList = item.toppings.map(t => t.name).join(', ');
        const itemPrice = calculatePizzaPrice(item);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'cart-item';
        itemEl.innerHTML = `
            <div class="cart-item-info">
                <div class="cart-item-title">${item.size.name} Pizza</div>
                <div class="cart-item-toppings">${toppingsList || 'No toppings'}</div>
            </div>
            <div class="cart-item-price">${formatPrice(itemPrice)}</div>
            <button class="cart-item-remove" data-index="${index}"><i class="fas fa-times"></i></button>
        `;
        
        cartItemsEl.appendChild(itemEl);
    });
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', (e) => {
            const index = parseInt(e.currentTarget.dataset.index);
            state.cart.splice(index, 1);
            renderCart();
        });
    });
    
    placeOrderBtn.disabled = false;
    updateCartSummary();
}

// Calculate pizza price
function calculatePizzaPrice(pizza) {
    let price = getPrice(pizza.size);
    pizza.toppings.forEach(topping => {
        price += getPrice(topping);
    });
    return price;
}

// Update cart summary
function updateCartSummary() {
    const subtotal = state.cart.reduce((sum, item) => sum + calculatePizzaPrice(item), 0);
    let discount = 0;
    const discountThreshold = state.currency === 'USD' ? 20 : 360;
    
    if (subtotal > discountThreshold) {
        discount = subtotal * 0.1;
        state.discountApplied = true;
        document.querySelector('.summary-row.discount span:first-child').textContent = 
            `Discount (10% off orders over ${formatPrice(discountThreshold)}):`;
    } else {
        state.discountApplied = false;
    }
    
    const total = subtotal - discount;
    
    subtotalEl.textContent = formatPrice(subtotal);
    discountEl.textContent = `-${formatPrice(discount)}`;
    totalEl.textContent = formatPrice(total);
    
    // Show/hide discount row
    const discountRow = document.querySelector('.summary-row.discount');
    if (discount > 0) {
        discountRow.style.display = 'flex';
    } else {
        discountRow.style.display = 'none';
    }
}

// Show order modal
function showOrderModal() {
    if (state.cart.length === 0) return;
    
    orderDetailsEl.innerHTML = '';
    
    state.cart.forEach((item, index) => {
        const toppingsList = item.toppings.map(t => t.name).join(', ');
        const itemPrice = calculatePizzaPrice(item);
        
        const itemEl = document.createElement('div');
        itemEl.className = 'order-item';
        itemEl.innerHTML = `
            <h4>${item.size.name} Pizza</h4>
            <p><strong>Toppings:</strong> ${toppingsList || 'No toppings'}</p>
            <p><strong>Price:</strong> ${formatPrice(itemPrice)}</p>
        `;
        
        orderDetailsEl.appendChild(itemEl);
    });
    
    const subtotal = state.cart.reduce((sum, item) => sum + calculatePizzaPrice(item), 0);
    const discount = state.discountApplied ? subtotal * 0.1 : 0;
    const total = subtotal - discount;
    
    const summaryEl = document.createElement('div');
    summaryEl.className = 'order-summary';
    summaryEl.innerHTML = `
        <div class="summary-row">
            <span>Subtotal:</span>
            <span>${formatPrice(subtotal)}</span>
        </div>
        ${state.discountApplied ? `
        <div class="summary-row">
            <span>Discount (10% off):</span>
            <span>-${formatPrice(discount)}</span>
        </div>
        ` : ''}
        <div class="summary-row total">
            <span>Total:</span>
            <span>${formatPrice(total)}</span>
        </div>
    `;
    
    orderDetailsEl.appendChild(summaryEl);
    
    orderModal.style.display = 'block';
}

// Confirm order
function confirmOrder() {
    alert(`Thank you for your order! Your total was ${totalEl.textContent}. Your pizza will be ready soon.`);
    state.cart = [];
    renderCart();
    orderModal.style.display = 'none';
}

// Initialize the app
init();