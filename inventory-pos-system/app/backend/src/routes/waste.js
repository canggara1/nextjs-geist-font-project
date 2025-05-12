const express = require('express');
const router = express.Router();
const { PrismaClient, WasteReason } = require('@prisma/client');
const prisma = new PrismaClient();
const authMiddleware = require('../middleware/authMiddleware');

// Helper function to check role access
function hasRole(user, roles) {
  return roles.includes(user.role);
}

// POST /api/inventory/waste - Input waste stock reduction
router.post('/waste', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    const { inventoryId, quantity, reason } = req.body;

    // Validate role
    if (!hasRole(user, ['ADMIN', 'HEAD_BRANCH', 'STAFF'])) {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    // Validate input
    if (!inventoryId || !quantity || !reason) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than zero' });
    }

    // Validate reason enum
    if (!Object.values(WasteReason).includes(reason)) {
      return res.status(400).json({ error: 'Invalid waste reason' });
    }

    // Fetch inventory
    const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } });
    if (!inventory) {
      return res.status(400).json({ error: 'Invalid inventoryId' });
    }

    // Check user branch access
    if (user.role !== 'ADMIN' && inventory.branchId !== user.branchId) {
      return res.status(403).json({ error: 'Cannot modify inventory of other branches' });
    }

    // Check quantity available
    if (quantity > inventory.quantity) {
      return res.status(400).json({ error: 'Quantity exceeds available stock' });
    }

    // Reduce inventory quantity
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        quantity: inventory.quantity - quantity,
        waste: inventory.waste + quantity,
        updatedAt: new Date()
      }
    });

    // Create waste log
    const wasteLog = await prisma.wasteLog.create({
      data: {
        userId: user.userId,
        branchId: inventory.branchId,
        productId: inventory.productId,
        inventoryId: inventory.id,
        quantity,
        reason,
        createdAt: new Date()
      }
    });

    res.json({ message: 'Waste recorded successfully', wasteLog, updatedInventory });
  } catch (error) {
    console.error('Error recording waste:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/inventory/waste-logs - View waste logs with role-based access
router.get('/waste-logs', authMiddleware, async (req, res) => {
  try {
    const user = req.user;

    let whereClause = {};

    if (user.role === 'ADMIN' || user.role === 'FINANCE') {
      // Admin and Finance can view all waste logs
      whereClause = {};
    } else if (user.role === 'HEAD_BRANCH') {
      // Branch Head can view waste logs of their branch
      whereClause = { branchId: user.branchId };
    } else {
      // Staff and others cannot view waste logs
      return res.status(403).json({ error: 'Unauthorized role to view waste logs' });
    }

    const wasteLogs = await prisma.wasteLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } },
        branch: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        inventory: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(wasteLogs);
  } catch (error) {
    console.error('Error fetching waste logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
