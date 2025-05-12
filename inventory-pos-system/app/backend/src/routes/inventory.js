const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Waste reasons enum
const wasteReasons = [
  'EXPIRED',
  'DAMAGED',
  'LOST',
  'OTHER'
];

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// View Inventory Stock per Branch with filtering and role-based access
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { branchId, productType, expiryDate } = req.query;

    let branchFilter = {};
    if (user.role === 'ADMIN') {
      // Admin can view all branches or filter by branchId
      if (branchId) {
        branchFilter = { id: parseInt(branchId) };
      }
    } else if (user.role === 'HEAD_BRANCH' || user.role === 'STAFF') {
      // Branch Head and Staff can only view their own branch
      branchFilter = { id: user.branchId };
    } else if (user.role === 'FINANCE') {
      // Finance can view only products and costs, filter by branch if provided
      if (branchId) {
        branchFilter = { id: parseInt(branchId) };
      } else {
        return res.status(403).json({ error: 'Branch filter required for Finance role' });
      }
    } else {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Build product type filter
    let categoryFilter = {};
    if (productType) {
      categoryFilter = { name: productType };
    }

    // Build expiry date filter
    let expiryFilter = {};
    if (expiryDate) {
      expiryFilter = { expiryDate: new Date(expiryDate) };
    }

    // Query inventory with filters
    const inventories = await prisma.inventory.findMany({
      where: {
        branchId: branchFilter.id,
        product: {
          category: categoryFilter
        },
        ...expiryFilter
      },
      include: {
        product: {
          include: {
            category: true
          }
        },
        branch: true
      }
    });

    // For Finance role, filter fields to only products and costs
    if (user.role === 'FINANCE') {
      const financeView = inventories.map(inv => ({
        productName: inv.product.name,
        category: inv.product.category.name,
        quantity: inv.quantity,
        price: inv.product.price,
        totalValue: inv.quantity * inv.product.price,
        expiryDate: inv.expiryDate
      }));
      return res.json(financeView);
    }

    res.json(inventories);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Incoming Stock
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { productId, quantity, productionDate, expiryDate, notes } = req.body;

    // Validate required fields
    if (!productId || !quantity || !productionDate || !expiryDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check user permission
    if (!['ADMIN', 'HEAD_BRANCH', 'STAFF'].includes(user.role)) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Staff can only add stock for their own branch
    if (user.role === 'STAFF' && !user.branchId) {
      return res.status(403).json({ error: 'Staff must belong to a branch' });
    }

    // Admin and Head Branch can specify branchId, Staff uses their own branchId
    const branchId = user.role === 'STAFF' ? user.branchId : req.body.branchId || user.branchId;

    // Validate product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(400).json({ error: 'Invalid productId' });
    }

    // Create or update inventory entry
    // Check if inventory entry exists for product, branch, productionDate, expiryDate
    const existingInventory = await prisma.inventory.findFirst({
      where: {
        productId,
        branchId,
        productionDate: new Date(productionDate),
        expiryDate: new Date(expiryDate)
      }
    });

    if (existingInventory) {
      // Update quantity
      const updatedInventory = await prisma.inventory.update({
        where: { id: existingInventory.id },
        data: {
          quantity: existingInventory.quantity + quantity,
          updatedAt: new Date()
        }
      });
      return res.json({ message: 'Inventory updated', inventory: updatedInventory });
    } else {
      // Create new inventory entry
      const newInventory = await prisma.inventory.create({
        data: {
          productId,
          branchId,
          quantity,
          productionDate: new Date(productionDate),
          expiryDate: new Date(expiryDate),
          waste: 0,
          tester: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      return res.status(201).json({ message: 'Inventory added', inventory: newInventory });
    }
  } catch (error) {
    console.error('Error adding inventory:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
