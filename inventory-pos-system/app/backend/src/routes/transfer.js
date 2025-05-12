const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// POST /api/transfer - Create a stock transfer
router.post('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { toBranchId, items } = req.body;
    if (!toBranchId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    // Validate toBranch exists
    const toBranch = await prisma.branch.findUnique({ where: { id: parseInt(toBranchId) } });
    if (!toBranch) {
      return res.status(400).json({ error: 'Destination branch not found' });
    }

    // Validate stock availability for each item
    for (const item of items) {
      const { productId, quantity, expiryDate } = item;
      if (!productId || !quantity || !expiryDate) {
        return res.status(400).json({ error: 'Invalid item data' });
      }

      // Check stock in user's branch
      const stock = await prisma.inventory.findFirst({
        where: {
          productId: parseInt(productId),
          branchId: user.branchId,
          expiryDate: new Date(expiryDate),
          quantity: { gte: quantity }
        }
      });

      if (!stock) {
        return res.status(400).json({ error: `Insufficient stock for product ${productId}` });
      }
    }

    // Create stock transfer record
    const transfer = await prisma.stockTransfer.create({
      data: {
        fromBranchId: user.branchId,
        toBranchId: parseInt(toBranchId),
        productId: items[0].productId, // Simplified: one product per transfer item for now
        quantity: items[0].quantity,
        expiryDate: new Date(items[0].expiryDate),
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    res.status(201).json({ message: 'Stock transfer created', transfer });
  } catch (error) {
    console.error('Error creating stock transfer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transfer - List stock transfers for user's branch
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const transfers = await prisma.stockTransfer.findMany({
      where: {
        OR: [
          { fromBranchId: user.branchId },
          { toBranchId: user.branchId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(transfers);
  } catch (error) {
    console.error('Error fetching stock transfers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transfer/:id - Get details of a specific stock transfer
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const id = parseInt(req.params.id);
    const transfer = await prisma.stockTransfer.findUnique({ where: { id } });

    if (!transfer) {
      return res.status(404).json({ error: 'Stock transfer not found' });
    }

    if (transfer.fromBranchId !== user.branchId && transfer.toBranchId !== user.branchId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(transfer);
  } catch (error) {
    console.error('Error fetching stock transfer:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
