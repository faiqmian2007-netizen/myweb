# Flexible - Mobile Accessories E-commerce Website

A professional e-commerce website for selling mobile accessories like chargers, headphones, cables, power banks, phone cases, and screen protectors.

## Features

### 🛍️ Customer Features
- **Beautiful Homepage** with hero section and category showcase
- **Product Catalog** with professional product cards
- **Advanced Search & Filtering** by category, price range, and sorting options
- **Responsive Design** that works on all devices
- **Order System** with customer details collection
- **Cash on Delivery** payment option

### 🔐 Admin Panel Features
- **Secure Login** system (username: `admin`, password: `admin123`)
- **Product Management** - Upload products with images, prices, and discounts
- **Order Management** - View and update order statuses
- **Real-time Notifications** for new orders
- **Professional Interface** with tabbed navigation

### 💾 Data Storage
- **JSON-based storage** - No database required
- **Automatic data persistence** in local files
- **Image hosting support** via ImgBB links

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Website
- **Main Website**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

### 4. Admin Login
- **Username**: `admin`
- **Password**: `admin123`

## How to Use

### For Customers

1. **Browse Products**: Visit the homepage to see all available products
2. **Search & Filter**: Use the search bar and filters to find specific items
3. **View Details**: Click on any product to see images, price, and description
4. **Place Order**: Click "Buy Now" and fill in your details:
   - Full Name
   - Mobile Number
   - Complete Address
5. **Confirmation**: Your order will be placed and you'll receive a confirmation

### For Admin

1. **Login**: Go to `/admin` and login with admin credentials
2. **Upload Products**:
   - Select category (chargers, headphones, cables, etc.)
   - Enter product name and description
   - Set price and discount percentage
   - Add up to 4 image URLs from ImgBB
   - Click "Upload Product"
3. **Manage Orders**:
   - View all customer orders
   - Update order status (pending → confirmed → shipped → delivered)
   - Filter orders by status
4. **Product Management**:
   - View all uploaded products
   - Filter by category
   - Edit or delete products (coming soon)

## Image Hosting with ImgBB

To add product images:

1. Go to [ImgBB.com](https://imgbb.com/)
2. Upload your product images
3. Copy the direct image links
4. Paste them in the admin panel image fields

## File Structure

```
flexible-mobile-accessories/
├── server.js              # Main Node.js server
├── package.json           # Project dependencies
├── data/                  # JSON data storage
│   ├── products.json     # Product database
│   ├── orders.json       # Order database
│   └── admin.json        # Admin credentials
├── public/               # Frontend files
│   ├── index.html        # Main website
│   ├── admin.html        # Admin panel
│   ├── styles.css        # Main website styles
│   ├── admin-styles.css  # Admin panel styles
│   ├── script.js         # Main website JavaScript
│   └── admin-script.js   # Admin panel JavaScript
└── README.md             # This file
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Upload new product
- `POST /api/orders` - Place new order
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/admin/login` - Admin login

## Customization

### Change Website Name
Edit the title in `public/index.html` and `public/admin.html`

### Modify Categories
Update the category options in:
- `public/index.html` (category cards)
- `public/admin.html` (admin form)
- `server.js` (API validation)

### Change Admin Credentials
Edit `data/admin.json` or modify the default credentials in `server.js`

### Styling
- Main website: `public/styles.css`
- Admin panel: `public/admin-styles.css`

## Security Features

- **Admin-only access** to admin panel
- **Input validation** on all forms
- **Secure order processing**
- **Protected admin routes**

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Troubleshooting

### Server won't start
- Check if port 3000 is available
- Ensure all dependencies are installed
- Check console for error messages

### Images not loading
- Verify ImgBB links are correct
- Ensure links are direct image URLs
- Check browser console for errors

### Admin login issues
- Verify username/password
- Check browser console for errors
- Clear browser cache and try again

## Future Enhancements

- [ ] Product editing and deletion
- [ ] User accounts and order history
- [ ] Payment gateway integration
- [ ] Email notifications
- [ ] Product reviews and ratings
- [ ] Inventory management
- [ ] Analytics dashboard

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review browser console for errors
3. Verify all files are in correct locations
4. Ensure Node.js version 14+ is installed

## License

This project is open source and available under the MIT License.

---

**Made with ❤️ for mobile accessories business**
