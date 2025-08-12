// Global variables
let products = [];
let filteredProducts = [];
let currentProduct = null;

// DOM elements
const productsGrid = document.getElementById('productsGrid');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const priceFilter = document.getElementById('priceFilter');
const sortBy = document.getElementById('sortBy');
const orderModal = document.getElementById('orderModal');
const closeModal = document.getElementById('closeModal');
const orderForm = document.getElementById('orderForm');
const orderSummary = document.getElementById('orderSummary');

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    setupCategoryCards();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') performSearch();
    });

    // Filter functionality
    categoryFilter.addEventListener('change', applyFilters);
    priceFilter.addEventListener('change', applyFilters);
    sortBy.addEventListener('change', applyFilters);

    // Modal functionality
    closeModal.addEventListener('click', closeOrderModal);
    window.addEventListener('click', function(e) {
        if (e.target === orderModal) closeOrderModal();
    });

    // Order form submission
    orderForm.addEventListener('submit', handleOrderSubmission);
}

// Setup category cards
function setupCategoryCards() {
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const category = this.dataset.category;
            categoryFilter.value = category;
            applyFilters();
            scrollToProducts();
        });
    });
}

// Load products from API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        filteredProducts = [...products];
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

// Display products in the grid
function displayProducts() {
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: #bdc3c7; margin-bottom: 1rem;"></i>
                <h3 style="color: #7f8c8d;">No products found</h3>
                <p style="color: #95a5a6;">Try adjusting your search or filters</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = filteredProducts.map(product => `
        <div class="product-card">
            <div class="product-images">
                <img src="${product.images[0] || 'https://via.placeholder.com/300x250?text=No+Image'}" 
                     alt="${product.name}" 
                     onerror="this.src='https://via.placeholder.com/300x250?text=Image+Error'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    <span class="current-price">₹${calculateDiscountedPrice(product.price, product.discount)}</span>
                    ${product.discount > 0 ? `<span class="original-price">₹${product.price}</span>` : ''}
                    ${product.discount > 0 ? `<span class="discount-badge">${product.discount}% OFF</span>` : ''}
                </div>
                <p class="product-description">${product.description}</p>
                <button class="buy-btn" onclick="openOrderModal('${product.id}')">
                    <i class="fas fa-shopping-cart"></i> Buy Now
                </button>
            </div>
        </div>
    `).join('');
}

// Calculate discounted price
function calculateDiscountedPrice(price, discount) {
    if (discount <= 0) return price;
    return (price * (100 - discount) / 100).toFixed(2);
}

// Search functionality
function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    applyFilters();
}

// Apply filters and sorting
function applyFilters() {
    let filtered = [...products];

    // Category filter
    const selectedCategory = categoryFilter.value;
    if (selectedCategory) {
        filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Price filter
    const selectedPrice = priceFilter.value;
    if (selectedPrice) {
        const [min, max] = selectedPrice.split('-').map(p => p === '+' ? Infinity : parseFloat(p));
        filtered = filtered.filter(product => {
            const discountedPrice = calculateDiscountedPrice(product.price, product.discount);
            return discountedPrice >= min && (max === Infinity ? true : discountedPrice <= max);
        });
    }

    // Search filter (if there's a search term)
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Sorting
    const sortOption = sortBy.value;
    switch (sortOption) {
        case 'price-low':
            filtered.sort((a, b) => calculateDiscountedPrice(a.price, a.discount) - calculateDiscountedPrice(b.price, b.discount));
            break;
        case 'price-high':
            filtered.sort((a, b) => calculateDiscountedPrice(b.price, b.discount) - calculateDiscountedPrice(a.price, a.discount));
            break;
        case 'discount':
            filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0));
            break;
        case 'newest':
        default:
            filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            break;
    }

    filteredProducts = filtered;
    displayProducts();
}

// Open order modal
function openOrderModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    currentProduct = product;
    
    // Populate order summary
    orderSummary.innerHTML = `
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
            <img src="${product.images[0] || 'https://via.placeholder.com/60x60?text=No+Image'}" 
                 alt="${product.name}" 
                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
            <div>
                <h4 style="margin: 0; color: #2c3e50;">${product.name}</h4>
                <p style="margin: 0; color: #7f8c8d;">${product.category}</p>
            </div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; color: #2c3e50;">Price:</span>
            <span style="font-weight: 700; color: #ff4757; font-size: 1.2rem;">
                ₹${calculateDiscountedPrice(product.price, product.discount)}
            </span>
        </div>
        ${product.discount > 0 ? `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span style="color: #7f8c8d;">Original Price:</span>
                <span style="color: #95a5a6; text-decoration: line-through;">₹${product.price}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 0.5rem;">
                <span style="color: #7f8c8d;">Discount:</span>
                <span style="color: #27ae60; font-weight: 600;">${product.discount}% OFF</span>
            </div>
        ` : ''}
    `;

    // Reset form
    orderForm.reset();
    
    // Show modal
    orderModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Close order modal
function closeOrderModal() {
    orderModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentProduct = null;
}

// Handle order form submission
async function handleOrderSubmission(e) {
    e.preventDefault();
    
    if (!currentProduct) {
        showNotification('No product selected', 'error');
        return;
    }

    const formData = new FormData(orderForm);
    const orderData = {
        productId: currentProduct.id,
        productName: currentProduct.name,
        customerName: formData.get('customerName') || document.getElementById('customerName').value,
        phone: formData.get('phone') || document.getElementById('phone').value,
        address: formData.get('address') || document.getElementById('address').value
    };

    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        
        if (result.success) {
            showNotification('Order placed successfully! We will contact you soon.', 'success');
            closeOrderModal();
        } else {
            showNotification(result.message || 'Error placing order', 'error');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Error placing order. Please try again.', 'error');
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 2000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Utility functions
function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToCategories() {
    document.getElementById('categories').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Add smooth scrolling for all anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});