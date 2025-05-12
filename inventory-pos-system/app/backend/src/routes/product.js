const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// POST /api/products - Create a new product (Admin only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { name, type, unit, shelfLifeDays } = req.body;
    if (!name || !type || !unit || !shelfLifeDays) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        type,
        unit,
        shelfLifeDays,
        createdAt: new Date()
      }
    });

    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/products - Get all products (Admin and Staff)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'STAFF'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const products = await prisma.product.findMany();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/products/:id - Update a product (Admin only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const id = parseInt(req.params.id);
    const { name, type, unit, shelfLifeDays } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: { name, type, unit, shelfLifeDays }
    });

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/products/:id - Delete a product (Admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const id = parseInt(req.params.id);
    await prisma.product.delete({ where: { id } });

    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
