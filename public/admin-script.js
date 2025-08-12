// Admin Panel JavaScript
let isLoggedIn = false;
let products = [];
let orders = [];

// DOM elements
const loginSection = document.getElementById('loginSection');
const adminDashboard = document.getElementById('adminDashboard');
const loginForm = document.getElementById('loginForm');
const productForm = document.getElementById('productForm');
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');
const ordersList = document.getElementById('ordersList');
const productsList = document.getElementById('productsList');
const orderStatusFilter = document.getElementById('orderStatusFilter');
const productCategoryFilter = document.getElementById('productCategoryFilter');

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    checkLoginStatus();
});

// Setup event listeners
function setupEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Product form
    productForm.addEventListener('submit', handleProductUpload);
    
    // Navigation tabs
    navBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });
    
    // Filters
    orderStatusFilter.addEventListener('change', filterOrders);
    productCategoryFilter.addEventListener('change', filterProducts);
}

// Check login status
function checkLoginStatus() {
    const token = localStorage.getItem('adminToken');
    if (token) {
        // In a real app, you'd verify the token with the server
        isLoggedIn = true;
        showDashboard();
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const username = formData.get('username') || document.getElementById('username').value;
    const password = formData.get('password') || document.getElementById('password').value;
    
    try {
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            isLoggedIn = true;
            localStorage.setItem('adminToken', 'logged_in');
            showDashboard();
            showToast('Login successful!', 'success');
        } else {
            showToast(result.message || 'Invalid credentials', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showToast('Login failed. Please try again.', 'error');
    }
}

// Show dashboard
function showDashboard() {
    loginSection.style.display = 'none';
    adminDashboard.style.display = 'block';
    
    // Load initial data
    loadProducts();
    loadOrders();
    
    // Switch to upload tab by default
    switchTab('upload');
}

// Logout
function logout() {
    isLoggedIn = false;
    localStorage.removeItem('adminToken');
    adminDashboard.style.display = 'none';
    loginSection.style.display = 'flex';
    loginForm.reset();
}

// Switch between tabs
function switchTab(tabName) {
    // Update navigation buttons
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabName + 'Tab') {
            content.classList.add('active');
        }
    });
    
    // Load data for specific tabs
    if (tabName === 'orders') {
        loadOrders();
    } else if (tabName === 'products') {
        loadProducts();
    }
}

// Handle product upload
async function handleProductUpload(e) {
    e.preventDefault();
    
    const formData = new FormData(productForm);
    const productData = {
        category: formData.get('category') || document.getElementById('category').value,
        name: formData.get('productName') || document.getElementById('productName').value,
        price: formData.get('price') || document.getElementById('price').value,
        discount: formData.get('discount') || document.getElementById('discount').value,
        description: formData.get('description') || document.getElementById('description').value,
        images: [
            formData.get('image1') || document.getElementById('image1').value,
            formData.get('image2') || document.getElementById('image2').value,
            formData.get('image3') || document.getElementById('image3').value,
            formData.get('image4') || document.getElementById('image4').value
        ].filter(img => img.trim() !== '') // Remove empty image URLs
    };
    
    // Validate required fields
    if (!productData.category || !productData.name || !productData.price || !productData.description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (productData.images.length === 0) {
        showToast('Please provide at least one image URL', 'error');
        return;
    }
    
    try {
        const response = await fetch('/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Product uploaded successfully!', 'success');
            productForm.reset();
            loadProducts(); // Refresh products list
        } else {
            showToast(result.message || 'Error uploading product', 'error');
        }
    } catch (error) {
        console.error('Upload error:', error);
        showToast('Error uploading product. Please try again.', 'error');
    }
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        products = await response.json();
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Error loading products', 'error');
    }
}

// Display products
function displayProducts() {
    if (products.length === 0) {
        productsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <i class="fas fa-box" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No products found</h3>
                <p>Start by uploading your first product!</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = products.map(product => `
        <div class="product-item">
            <div class="product-header">
                <div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: #ff4757; font-size: 1.1rem;">
                        ₹${product.price}
                    </div>
                    ${product.discount > 0 ? `<div style="color: #27ae60; font-size: 0.9rem;">${product.discount}% OFF</div>` : ''}
                </div>
            </div>
            <div class="product-info">
                <div class="product-info-item">
                    <label>Price:</label>
                    <span>₹${product.price}</span>
                </div>
                <div class="product-info-item">
                    <label>Discount:</label>
                    <span>${product.discount || 0}%</span>
                </div>
                <div class="product-info-item">
                    <label>Images:</label>
                    <span>${product.images.length} image(s)</span>
                </div>
                <div class="product-info-item">
                    <label>Created:</label>
                    <span>${new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Load orders
async function loadOrders() {
    try {
        const response = await fetch('/api/orders');
        orders = await response.json();
        displayOrders();
    } catch (error) {
        console.error('Error loading orders:', error);
        showToast('Error loading orders', 'error');
    }
}

// Display orders
function displayOrders() {
    if (orders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No orders found</h3>
                <p>Orders will appear here when customers place them</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = orders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id.slice(-6)}</div>
                    <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <label>Product:</label>
                    <span>${order.productName}</span>
                </div>
                <div class="order-detail">
                    <label>Customer:</label>
                    <span>${order.customerName}</span>
                </div>
                <div class="order-detail">
                    <label>Phone:</label>
                    <span>${order.phone}</span>
                </div>
                <div class="order-detail">
                    <label>Address:</label>
                    <span>${order.address}</span>
                </div>
            </div>
            <div class="order-actions">
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 0.5rem; border-radius: 5px; border: 1px solid #ddd;">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Filter orders
function filterOrders() {
    const statusFilter = orderStatusFilter.value;
    let filteredOrders = orders;
    
    if (statusFilter) {
        filteredOrders = orders.filter(order => order.status === statusFilter);
    }
    
    displayFilteredOrders(filteredOrders);
}

// Display filtered orders
function displayFilteredOrders(filteredOrders) {
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <i class="fas fa-filter" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No orders match the filter</h3>
                <p>Try adjusting your filter criteria</p>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-item">
            <div class="order-header">
                <div>
                    <div class="order-id">Order #${order.id.slice(-6)}</div>
                    <div class="order-date">${new Date(order.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <label>Product:</label>
                    <span>${order.productName}</span>
                </div>
                <div class="order-detail">
                    <label>Customer:</label>
                    <span>${order.customerName}</span>
                </div>
                <div class="order-detail">
                    <label>Phone:</label>
                    <span>${order.phone}</span>
                </div>
                <div class="order-detail">
                    <label>Address:</label>
                    <span>${order.address}</span>
                </div>
            </div>
            <div class="order-actions">
                <select onchange="updateOrderStatus('${order.id}', this.value)" style="padding: 0.5rem; border-radius: 5px; border: 1px solid #ddd;">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                    <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                </select>
                <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        </div>
    `).join('');
}

// Filter products
function filterProducts() {
    const categoryFilter = productCategoryFilter.value;
    let filteredProducts = products;
    
    if (categoryFilter) {
        filteredProducts = products.filter(product => product.category === categoryFilter);
    }
    
    displayFilteredProducts(filteredProducts);
}

// Display filtered products
function displayFilteredProducts(filteredProducts) {
    if (filteredProducts.length === 0) {
        productsList.innerHTML = `
            <div style="text-align: center; padding: 3rem; color: #7f8c8d;">
                <i class="fas fa-filter" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No products match the filter</h3>
                <p>Try adjusting your filter criteria</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = filteredProducts.map(product => `
        <div class="product-item">
            <div class="product-header">
                <div>
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">${product.category}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 600; color: #ff4757; font-size: 1.1rem;">
                        ₹${product.price}
                    </div>
                    ${product.discount > 0 ? `<div style="color: #27ae60; font-size: 0.9rem;">${product.discount}% OFF</div>` : ''}
                </div>
            </div>
            <div class="product-info">
                <div class="product-info-item">
                    <label>Price:</label>
                    <span>₹${product.price}</span>
                </div>
                <div class="product-info-item">
                    <label>Discount:</label>
                    <span>${product.discount || 0}%</span>
                </div>
                <div class="product-info-item">
                    <label>Images:</label>
                    <span>${product.images.length} image(s)</span>
                </div>
                <div class="product-info-item">
                    <label>Created:</label>
                    <span>${new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-secondary" onclick="editProduct('${product.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="deleteProduct('${product.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).join('');
}

// Update order status
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('Order status updated successfully!', 'success');
            loadOrders(); // Refresh orders
        } else {
            showToast(result.message || 'Error updating order status', 'error');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showToast('Error updating order status', 'error');
    }
}

// Edit product (placeholder function)
function editProduct(productId) {
    showToast('Edit functionality coming soon!', 'info');
}

// Delete product (placeholder function)
function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
        showToast('Delete functionality coming soon!', 'info');
    }
}

// View order details (placeholder function)
function viewOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order) {
        alert(`
Order Details:
ID: ${order.id}
Product: ${order.productName}
Customer: ${order.customerName}
Phone: ${order.phone}
Address: ${order.address}
Status: ${order.status}
Date: ${new Date(order.createdAt).toLocaleString()}
        `);
    }
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    
    // Update toast color based on type
    toast.style.background = type === 'success' ? '#27ae60' : 
                            type === 'error' ? '#e74c3c' : 
                            type === 'warning' ? '#f39c12' : '#3498db';
    
    toast.classList.add('show');
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        hideToast();
    }, 3000);
}

// Hide toast
function hideToast() {
    const toast = document.getElementById('toast');
    toast.classList.remove('show');
}

// Auto-refresh data every 30 seconds
setInterval(() => {
    if (isLoggedIn) {
        loadOrders();
        loadProducts();
    }
}, 30000);