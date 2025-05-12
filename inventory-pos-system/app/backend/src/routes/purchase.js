const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// POST /api/purchase - Create a purchase order
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { supplier, items } = req.body;
    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Create purchase order
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        supplier,
        items: JSON.stringify(items),
        createdBy: user.id,
        createdAt: new Date()
      }
    });

    res.status(201).json({ message: 'Purchase order created', purchaseOrder });
  } catch (error) {
    console.error('Error creating purchase order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/purchase - List purchase orders
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const purchaseOrders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json(purchaseOrders);
  } catch (error) {
    console.error('Error fetching purchase orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
