const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Data storage paths
const PRODUCTS_FILE = 'data/products.json';
const ORDERS_FILE = 'data/orders.json';
const ADMIN_FILE = 'data/admin.json';

// Ensure data directory exists
if (!fs.existsSync('data')) {
    fs.mkdirSync('data');
}

// Initialize data files if they don't exist
if (!fs.existsSync(PRODUCTS_FILE)) {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(ADMIN_FILE)) {
    fs.writeFileSync(ADMIN_FILE, JSON.stringify({
        username: 'admin',
        password: 'admin123'
    }, null, 2));
}

// Helper functions
function readJSONFile(filename) {
    try {
        const data = fs.readFileSync(filename, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeJSONFile(filename, data) {
    try {
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API Routes
app.get('/api/products', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const products = readJSONFile(PRODUCTS_FILE);
    const newProduct = {
        id: Date.now().toString(),
        category: req.body.category,
        name: req.body.name,
        images: req.body.images,
        price: parseFloat(req.body.price),
        discount: parseFloat(req.body.discount),
        description: req.body.description,
        createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    
    if (writeJSONFile(PRODUCTS_FILE, products)) {
        res.json({ success: true, message: 'Product uploaded successfully!' });
    } else {
        res.status(500).json({ success: false, message: 'Error saving product' });
    }
});

app.post('/api/orders', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    const newOrder = {
        id: Date.now().toString(),
        productId: req.body.productId,
        productName: req.body.productName,
        customerName: req.body.customerName,
        phone: req.body.phone,
        address: req.body.address,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    
    if (writeJSONFile(ORDERS_FILE, orders)) {
        res.json({ success: true, message: 'Order placed successfully!' });
    } else {
        res.status(500).json({ success: false, message: 'Error placing order' });
    }
});

app.get('/api/orders', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    res.json(orders);
});

app.post('/api/admin/login', (req, res) => {
    const admin = readJSONFile(ADMIN_FILE);
    
    if (req.body.username === admin.username && req.body.password === admin.password) {
        res.json({ success: true, message: 'Login successful' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

app.put('/api/orders/:id/status', (req, res) => {
    const orders = readJSONFile(ORDERS_FILE);
    const orderIndex = orders.findIndex(order => order.id === req.params.id);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = req.body.status;
        if (writeJSONFile(ORDERS_FILE, orders)) {
            res.json({ success: true, message: 'Order status updated' });
        } else {
            res.status(500).json({ success: false, message: 'Error updating order' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Order not found' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin`);
});