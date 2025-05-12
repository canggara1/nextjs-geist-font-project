const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// GET /api/inventory/expiring-soon?days=30 - Get products expiring soon
router.get('/expiring-soon', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH', 'STAFF'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const days = parseInt(req.query.days) || 30;
    const now = new Date();
    const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const expiringInventories = await prisma.inventory.findMany({
      where: {
        branchId: user.branchId,
        expiryDate: {
          lte: targetDate,
          gte: now
        }
      },
      include: {
        product: true
      }
    });

    const response = expiringInventories.map(inv => ({
      productId: inv.productId,
      name: inv.product.name,
      branchId: inv.branchId,
      expiryDate: inv.expiryDate,
      quantity: inv.quantity
    }));

    res.json(response);
  } catch (error) {
    console.error('Error fetching expiring products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
