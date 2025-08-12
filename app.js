import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import session from 'express-session';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);

// Paths
const dataDir = path.join(__dirname, 'data');
const usersPath = path.join(dataDir, 'users.json');
const productsPath = path.join(dataDir, 'products.json');
const ordersPath = path.join(dataDir, 'orders.json');
const configPath = path.join(dataDir, 'config.json');

// Ensure data dir and files exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function safeReadJson(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf8');
    if (!raw) return defaultValue;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read JSON', filePath, err);
    return defaultValue;
  }
}

function safeWriteJson(filePath, data) {
  const tmpPath = filePath + '.tmp';
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath);
}

// Initialize default files
const defaultConfig = safeReadJson(configPath, {
  adminAccessCode: 'flex-key-12345',
  siteName: 'FlexMobile Shop',
});
safeWriteJson(configPath, defaultConfig);

let users = safeReadJson(usersPath, []);
if (users.length === 0) {
  const password = 'admin123';
  const passwordHash = bcrypt.hashSync(password, 10);
  users = [
    { id: uuidv4(), email: 'admin@flexmobile.local', name: 'Admin', passwordHash },
  ];
  safeWriteJson(usersPath, users);
  console.log('Initialized default admin: email=admin@flexmobile.local password=admin123');
}

if (!fs.existsSync(productsPath)) {
  safeWriteJson(productsPath, []);
}
if (!fs.existsSync(ordersPath)) {
  safeWriteJson(ordersPath, []);
}

function readProducts() {
  return safeReadJson(productsPath, []);
}
function writeProducts(products) {
  safeWriteJson(productsPath, products);
}
function readOrders() {
  return safeReadJson(ordersPath, []);
}
function writeOrders(orders) {
  safeWriteJson(ordersPath, orders);
}

// Static
app.use('/assets', express.static(path.join(__dirname, 'public', 'assets')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/admin/static', express.static(path.join(__dirname, 'public', 'admin')));

// Public pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API: Products (public)
app.get('/api/products', (req, res) => {
  const { q, category, minPrice, maxPrice, sort } = req.query;
  let products = readProducts().filter(p => !p.deletedAt);

  if (q) {
    const v = String(q).toLowerCase();
    products = products.filter(
      p => p.name.toLowerCase().includes(v) || p.description.toLowerCase().includes(v)
    );
  }
  if (category) {
    products = products.filter(p => p.category.toLowerCase() === String(category).toLowerCase());
  }
  if (minPrice) {
    const min = Number(minPrice);
    products = products.filter(p => Number(p.price) >= min);
  }
  if (maxPrice) {
    const max = Number(maxPrice);
    products = products.filter(p => Number(p.price) <= max);
  }
  if (sort) {
    if (sort === 'price_asc') products.sort((a, b) => a.price - b.price);
    if (sort === 'price_desc') products.sort((a, b) => b.price - a.price);
    if (sort === 'newest') products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  res.json({ products });
});

// API: Orders (public, COD)
app.post('/api/orders', (req, res) => {
  const { productId, phone, address } = req.body;
  if (!productId || !phone || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const products = readProducts();
  const product = products.find(p => p.id === productId && !p.deletedAt);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const orders = readOrders();
  const order = {
    id: uuidv4(),
    productId,
    phone,
    address,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  writeOrders(orders);

  res.json({ ok: true, order });
});

// Admin access guard
function requireAdmin(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Unauthorized' });
}

function requireAccessCode(req, res, next) {
  const code = req.query.code || req.headers['x-admin-code'];
  const config = safeReadJson(configPath, defaultConfig);
  if (code && code === config.adminAccessCode) return next();
  return res.status(404).send('Not Found');
}

// Admin pages
app.get('/admin', requireAccessCode, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin', 'login.html'));
});

app.get('/admin/dashboard', (req, res) => {
  if (!req.session || !req.session.userId) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'public', 'admin', 'dashboard.html'));
});

// Admin auth
app.post('/admin/login', requireAccessCode, (req, res) => {
  const { email, password } = req.body;
  const users = safeReadJson(usersPath, []);
  const user = users.find(u => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  req.session.userId = user.id;
  res.json({ ok: true });
});

app.post('/admin/logout', requireAdmin, (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// Admin: products
app.get('/admin/api/products', requireAdmin, (req, res) => {
  res.json({ products: readProducts() });
});

app.post('/admin/api/products', requireAdmin, (req, res) => {
  const { category, name, images, price, discountPercent, description } = req.body;
  if (!category || !name || !images || !Array.isArray(images) || images.length < 1 || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const all = readProducts();
  const now = new Date().toISOString();
  const product = {
    id: uuidv4(),
    category: String(category).trim(),
    name: String(name).trim(),
    images: images.slice(0, 4),
    price: Number(price),
    discountPercent: Number(discountPercent || 0),
    description: String(description || ''),
    createdAt: now,
    updatedAt: now,
  };
  all.push(product);
  writeProducts(all);
  res.json({ ok: true, product });
});

app.delete('/admin/api/products/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const all = readProducts();
  const idx = all.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  all[idx].deletedAt = new Date().toISOString();
  writeProducts(all);
  res.json({ ok: true });
});

// Admin: orders
app.get('/admin/api/orders', requireAdmin, (req, res) => {
  const orders = readOrders();
  const products = readProducts();
  const withProducts = orders.map(o => ({
    ...o,
    product: products.find(p => p.id === o.productId) || null,
  }));
  res.json({ orders: withProducts });
});

app.post('/admin/api/orders/:id/status', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const valid = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  orders[idx].status = status;
  orders[idx].updatedAt = new Date().toISOString();
  writeOrders(orders);
  res.json({ ok: true, order: orders[idx] });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Admin access code required to open admin login page.');
});