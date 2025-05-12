const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 4000;

const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Inventory & POS Backend is running.' });
});

const inventoryRoutes = require('./routes/inventory');

const wasteRoutes = require('./routes/waste');

const transferRoutes = require('./routes/transfer');

const reportRoutes = require('./routes/report');

const productRoutes = require('./routes/product');
const purchaseRoutes = require('./routes/purchase');
const auditRoutes = require('./routes/audit');
const roleRoutes = require('./routes/role');

// TODO: Add routes for users, transactions

app.use('/api/inventory', inventoryRoutes);
app.use('/api/waste', wasteRoutes);
app.use('/api/transfer', transferRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/products', productRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/roles', roleRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
